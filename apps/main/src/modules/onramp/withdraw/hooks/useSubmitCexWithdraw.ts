import { hub, MultiAddress } from "@galacticcouncil/descriptors"
import { invariant, isParachain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Asset } from "@galacticcouncil/xc-core"
import { Transfer, Wallet } from "@galacticcouncil/xc-sdk"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { calculateAssethubFee } from "@/api/external/assethub"
import { useCrossChainWallet } from "@/api/xcm"
import { WaitingForBalanceUpdate } from "@/modules/onramp/components/WaitingForBalanceUpdate"
import { getCexConfigById } from "@/modules/onramp/config/cex"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import {
  assertTransferValues,
  buildXcmTx,
} from "@/modules/xcm/transfer/utils/transfer"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionActions,
  TransactionType,
  useTransactionsStore,
} from "@/states/transactions"
import { toBigInt, toDecimal } from "@/utils/formatting"

export type CexWithdrawOptions = TransactionActions & {
  asset: Asset | null
  cexId: string
}

export const useSubmitCexWithdraw = (options: CexWithdrawOptions) => {
  const { t } = useTranslation(["onramp", "common"])
  const { createTransaction } = useTransactionsStore()
  const { getAsset } = useAssets()
  const { account } = useAccount()
  const { papi } = useRpcProvider()

  const { cexId, asset } = options

  const wallet = useCrossChainWallet()

  return useMutation({
    mutationFn: async ([values, transfer]: [XcmFormValues, Transfer]) => {
      invariant(account, "Account is required")

      const { srcAmount, srcChain, destChain } = assertTransferValues(values)

      const assetId = asset ? srcChain.getAssetId(asset) : ""
      const assetMeta = getAsset(assetId.toString())

      invariant(asset && assetMeta, "Invalid asset")
      invariant(isParachain(destChain), "Destination chain must be a parachain")

      const { source } = transfer

      const i18nVars = {
        amount: srcAmount,
        symbol: source.balance.originSymbol,
        destChain: destChain.name,
        cex: getCexConfigById(cexId)?.title ?? "",
      }

      const tx = await buildXcmTx(srcChain, transfer, srcAmount, papi)

      return createTransaction(
        {
          tx: [
            {
              stepTitle: t("common:transfer"),
              tx,
              title: t("common:transfer"),
              description: t("withdraw.tx.transfer.description", i18nVars),
              invalidateQueries: [["xcm", "transfer"]],
              fee: {
                feeAmount: toDecimal(source.fee.amount, source.fee.decimals),
                feeSymbol: source.fee.symbol,
              },
              toasts: {
                submitted: t("withdraw.tx.transfer.toast.submitted", i18nVars),
                success: t("withdraw.tx.transfer.toast.success", i18nVars),
              },
              meta: {
                type: TransactionType.Xcm,
                srcChainKey: srcChain.key,
                srcChainFee: toDecimal(source.fee.amount, source.fee.decimals),
                srcChainFeeSymbol: source.fee.symbol,
                dstChainKey: destChain.key,
                tags: [],
              },
            },
            {
              stepTitle: t("common:withdraw"),
              pendingComponent: WaitingForBalanceUpdate,
              tx: async () => {
                await waitForBalanceChange(
                  wallet,
                  destChain.key,
                  asset,
                  account.address,
                )

                const amount = toBigInt(srcAmount, assetMeta.decimals)
                const api = destChain.client.getTypedApi(hub)

                const destAssetId = destChain.getAssetId(asset)

                const [fee, assetInfo] = await Promise.all([
                  calculateAssethubFee(
                    api.tx.Assets.transfer({
                      id: Number(destAssetId),
                      target: MultiAddress.Id(values.destAddress),
                      amount,
                    }),
                    account.address,
                    asset,
                  ),
                  api.query.Assets.Asset.getValue(Number(destAssetId)),
                ])

                const halfMinBalance = assetInfo
                  ? assetInfo.min_balance / 2n
                  : 0n

                const adjustedAmount = amount - fee - halfMinBalance

                invariant(adjustedAmount > 0n, "Insufficient balance")

                return {
                  title: t("common:withdraw"),
                  description: t("withdraw.tx.cex.description", i18nVars),
                  signerFeeAsset: asset,
                  toasts: {
                    submitted: t("withdraw.tx.cex.toast.submitted", i18nVars),
                    success: t("withdraw.tx.cex.toast.success", i18nVars),
                  },
                  tx: api.tx.Assets.transfer({
                    id: Number(destAssetId),
                    target: MultiAddress.Id(values.destAddress),
                    amount: adjustedAmount,
                  }),
                  fee: {
                    feeAmount: toDecimal(fee, assetMeta.decimals),
                    feeSymbol: assetMeta.symbol,
                  },
                  meta: {
                    type: TransactionType.Onchain,
                    srcChainKey: destChain.key,
                  },
                }
              },
            },
          ],
        },
        options,
      )
    },
  })
}

async function waitForBalanceChange(
  wallet: Wallet,
  chainKey: string,
  asset: Asset,
  address: string,
): Promise<bigint> {
  const { promise, resolve, reject } = Promise.withResolvers<bigint>()
  let prevBalance: bigint | undefined

  const sub = await wallet.subscribeBalance(address, chainKey, (balances) => {
    const balance = balances.find((b) => b.key === asset.key)

    if (!balance) {
      sub.unsubscribe()
      return reject(new Error("Asset not found"))
    }

    if (!prevBalance) {
      prevBalance = balance.amount
    }

    if (balance.amount > prevBalance) {
      sub.unsubscribe()
      resolve(balance.amount)
    }
  })

  return promise
}
