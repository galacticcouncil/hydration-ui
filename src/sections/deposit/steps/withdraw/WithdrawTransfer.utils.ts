import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { useMutation } from "@tanstack/react-query"
import { useCrossChainWallet } from "api/xcm"
import BN from "bignumber.js"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { CEX_CONFIG } from "sections/deposit/DepositPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"

type WithdrawalTransferValues = {
  cexAddress: string
  amount: string
}

export const useWithdrawalToCex = (cexId: string, assetId: string) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()

  const wallet = useCrossChainWallet()

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)
  const asset = cex ? cex.assets.find((a) => a.assetId === assetId) : null

  return useMutation(async (values: WithdrawalTransferValues) => {
    if (!cex) throw new Error(`CEX ${cexId} not found`)
    if (!asset) throw new Error(`Asset ${assetId} not found`)
    if (!account) throw new Error("Account not found")

    const srcChain = chainsMap.get("hydration")
    const dstChain = chainsMap.get(asset?.withdrawalChain ?? "")

    if (!srcChain || !dstChain) throw new Error("Chain not found")

    const xTransfer = await wallet.transfer(
      asset.data.asset.key,
      account.address,
      srcChain,
      values.cexAddress,
      dstChain,
    )

    const call = await xTransfer.buildCall(values.amount)

    return createTransaction(
      {
        title: t("withdraw.transfer.cex.modal.title", { cex: cex.title }),
        tx: api.tx(call.data),
      },
      {
        toast: createToastMessages("xcm.transfer.toast", {
          t,
          tOptions: {
            amount: values.amount,
            symbol: asset.data.asset.originSymbol,
            srcChain: srcChain.name,
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
