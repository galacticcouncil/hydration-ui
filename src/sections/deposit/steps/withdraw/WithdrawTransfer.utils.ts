import { chainsMap } from "@galacticcouncil/xcm-cfg"
import {
  AnyChain,
  Asset,
  AssetAmount,
  DexFactory,
} from "@galacticcouncil/xcm-core"
import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useMutation } from "@tanstack/react-query"
import { parseBalanceData } from "api/balances"
import { useExternalApi } from "api/external"
import {
  assethubNativeToken,
  getAssetHubTokenBalance,
} from "api/external/assethub"
import { useCrossChainWallet } from "api/xcm"
import BN from "bignumber.js"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { CEX_CONFIG, useDeposit } from "sections/deposit/DepositPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { BN_0 } from "utils/constants"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"

type WithdrawalTransferValues = {
  cexAddress: string
  amount: string
}

export const useWithdraw = (cexId: string, assetId: string) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const wallet = useCrossChainWallet()
  const { setAmount: setWithdrawnAmount } = useDeposit()

  const isFirstStepCompleted = useRef(false)

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)
  const asset = cex ? cex.assets.find((a) => a.assetId === assetId) : null
  const assetMeta = getAsset(assetId)

  const { data: externalApi } = useExternalApi(asset?.withdrawalChain ?? "")

  const srcChain = chainsMap.get("hydration")
  const dstChain = chainsMap.get(asset?.withdrawalChain ?? "")

  const getSteps = () => [
    {
      label: t("withdraw.transfer.cex.to", {
        chain: dstChain?.name,
      }),
      state: isFirstStepCompleted.current
        ? ("done" as const)
        : ("active" as const),
    },
    {
      label: t("withdraw.transfer.cex.to", {
        chain: cex?.title,
      }),
      state: isFirstStepCompleted.current
        ? ("active" as const)
        : ("todo" as const),
    },
  ]

  return useMutation(async (values: WithdrawalTransferValues) => {
    if (!srcChain || !dstChain) throw new Error("Chain not found")
    if (!api) throw new Error(`${srcChain.name} api not connected`)
    if (!externalApi) throw new Error(`${dstChain.name} api not connected`)
    if (!cex) throw new Error(`CEX ${cexId} not found`)
    if (!asset || !assetMeta) throw new Error(`Asset ${assetId} not found`)
    if (!account) throw new Error("Account not found")

    if (!isFirstStepCompleted.current) {
      const xTransfer = await wallet.transfer(
        asset.data.asset.key,
        account.address,
        srcChain,
        cex.isXcmCompatible ? values.cexAddress : account.address,
        dstChain,
      )

      const call = await xTransfer.buildCall(values.amount)

      await createTransaction(
        {
          title: t("withdraw.transfer.cex.modal.title", { cex: cex.title }),
          description: t("xcm.transfer.reviewTransaction.modal.description", {
            amount: values.amount,
            symbol: assetMeta.symbol,
            srcChain: srcChain.name,
            dstChain: cex.isXcmCompatible ? cex.title : dstChain.name,
          }),
          tx: api.tx(call.data),
        },
        {
          disableAutoClose: true,
          rejectOnClose: true,
          onSuccess: () => {
            isFirstStepCompleted.current = true
            const amount = BN(values.amount).shiftedBy(assetMeta.decimals)
            setWithdrawnAmount(amount.toString())
          },
          steps: cex.isXcmCompatible ? undefined : getSteps(),
          toast: createToastMessages("xcm.transfer.toast", {
            t,
            tOptions: {
              amount: values.amount,
              symbol: asset.data.asset.originSymbol,
              srcChain: srcChain.name,
              dstChain: cex.isXcmCompatible ? cex.title : dstChain.name,
            },
          }),
        },
      )
    }

    if (cex.isXcmCompatible) return

    const amount = BN(values.amount).shiftedBy(assetMeta.decimals)

    let paymentFee = BN_0
    let balance = BN_0

    if (dstChain.key === "assethub") {
      const onChainAssetId = dstChain.getAssetId(asset.data.asset).toString()
      await waitForAssetWithdrawal(externalApi, onChainAssetId, account.address)

      const tx = externalApi.tx.assets.transferKeepAlive(
        onChainAssetId,
        values.cexAddress,
        amount.toString(),
      )

      const balanceRes = await getAssetHubTokenBalance(
        externalApi,
        onChainAssetId,
        account.address,
      )()

      balance = balanceRes?.balance ?? BN_0

      paymentFee = await calculateAssethubFee(
        tx,
        values.cexAddress,
        asset.data.asset,
        dstChain,
      )
    } else if (dstChain.key === "polkadot") {
      await waitForNativeWithdrawal(externalApi, account.address)

      const tx = externalApi.tx.balances.transferKeepAlive(
        values.cexAddress,
        amount.toString(),
      )

      const balanceRes = await externalApi.query.system.account(account.address)
      const balanceData = parseBalanceData(
        balanceRes.data,
        assetId,
        account.address,
      )
      balance = BN(balanceData.balance)

      const paymentInfo = await tx.paymentInfo(values.cexAddress)
      paymentFee = BN(paymentInfo.partialFee.toString())
        .multipliedBy(0.1)
        .decimalPlaces(0)
    }

    const adjustedAmount = amount.minus(paymentFee)
    const formattedAmount = adjustedAmount
      .shiftedBy(-assetMeta.decimals)
      .toString()

    const isAssetHub = dstChain.key === "assethub"

    await createTransaction(
      {
        title: t("withdraw.transfer.cex.modal.title", { cex: cex.title }),
        description: t("xcm.transfer.reviewTransaction.modal.description", {
          amount: formattedAmount,
          symbol: assetMeta.symbol,
          srcChain: dstChain.name,
          dstChain: cex.title,
        }),
        tx: isAssetHub
          ? externalApi.tx.assets.transferKeepAlive(
              dstChain.getAssetId(asset.data.asset).toString(),
              values.cexAddress,
              adjustedAmount.toString(),
            )
          : externalApi.tx.balances.transferKeepAlive(
              values.cexAddress,
              adjustedAmount.toString(),
            ),
        txOptions: isAssetHub
          ? {
              asset: asset.data.asset,
            }
          : undefined,
        xcallMeta: {
          srcChain: dstChain.key,
          srcChainFeeBalance: BN(balance)
            .shiftedBy(-assetMeta.decimals)
            .toString(),
          srcChainFee: paymentFee.shiftedBy(-assetMeta.decimals).toString(),
          srcChainFeeSymbol: assetMeta.symbol,
        },
      },
      {
        rejectOnClose: true,
        disableAutoClose: true,
        onSuccess: () => {
          setWithdrawnAmount(adjustedAmount.toString())
        },
        steps: getSteps(),
        toast: createToastMessages("xcm.transfer.toast", {
          t,
          tOptions: {
            amount: formattedAmount,
            symbol: asset.data.asset.originSymbol,
            srcChain: dstChain.name,
            dstChain: cex.title,
          },
        }),
      },
    )
  })
}

export const useWithdrawalOnchain = (assetId: string) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { setAmount: setWithdrawnAmount } = useDeposit()

  const { native, getAsset } = useAssets()

  const asset = getAsset(assetId)

  return useMutation(async (values: WithdrawalTransferValues) => {
    if (!asset) throw new Error(`Asset ${assetId} not found`)
    if (!account) throw new Error("Account not found")

    const amount = new BN(values.amount).shiftedBy(asset.decimals).toString()

    return await createTransaction(
      {
        tx:
          asset.id === native.id || asset.isErc20
            ? api.tx.currencies.transfer(values.cexAddress, asset.id, amount)
            : api.tx.tokens.transfer(values.cexAddress, asset.id, amount),
      },
      {
        rejectOnClose: true,
        disableAutoClose: true,
        onSuccess: () => {
          setWithdrawnAmount(amount)
        },
        toast: createToastMessages("wallet.assets.transfer.toast", {
          t,
          tOptions: {
            value: values.amount,
            symbol: asset.symbol,
            address: shortenAccountAddress(
              getChainSpecificAddress(values.cexAddress),
              12,
            ),
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  })
}

async function waitForAssetWithdrawal(
  api: ApiPromise,
  assetId: string,
  account: string,
): Promise<void> {
  return new Promise(async (resolve) => {
    const unsub = await api.query.assets.account(
      assetId,
      account,
      async (res) => {
        const balance: BN = !res.isNone
          ? res.unwrap().balance.toBigNumber()
          : BN_0
        if (balance.gt(0)) {
          unsub()
          resolve()
        }
      },
    )
  })
}

async function waitForNativeWithdrawal(
  api: ApiPromise,
  account: string,
): Promise<void> {
  return new Promise(async (resolve) => {
    const unsub = await api.query.system.account(account, async (res) => {
      const balance = res.data.free.toBigNumber()
      if (balance.gt(0)) {
        unsub()
        resolve()
      }
    })
  })
}

async function calculateAssethubFee(
  tx: SubmittableExtrinsic,
  address: string,
  asset: Asset,
  chain: AnyChain,
): Promise<BN> {
  const paymentInfo = await tx.paymentInfo(address)
  const rawFee = BN(paymentInfo.partialFee.toString())
    .multipliedBy(0.1)
    .decimalPlaces(0)

  const dex = DexFactory.getInstance().get(chain.key)!
  const feeQuote = await dex.getQuote(
    asset,
    assethubNativeToken.asset,
    AssetAmount.fromAsset(assethubNativeToken.asset, {
      amount: BigInt(rawFee.toString()),
      decimals: assethubNativeToken.decimals!,
    }),
  )
  return BN(feeQuote.amount.toString())
}
