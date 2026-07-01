import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { minimumOrderBudgetQuery } from "@/api/trade"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import { DEFAULT_DCA_DURATION } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

export const useMaxOrderBalance = ({
  assetIn,
  assetOut,
}: {
  assetIn: string
  assetOut: string
}) => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const {
    dca: { slippage, maxRetries },
  } = useTradeSettings()
  const { getTransferableBalance } = useAccountBalances()
  const enabled =
    rpc.isApiLoaded && !!account && accountFeePaymentAssetId === Number(assetIn)
  const meta = getAssetWithFallback(assetIn)

  const { data: tx } = useQuery({
    enabled,
    queryKey: ["maxOrderAmount", assetIn, assetOut],
    queryFn: async () => {
      const minAmount = await rpc.queryClient.ensureQueryData(
        minimumOrderBudgetQuery(rpc, meta.id, meta.decimals),
      )

      const minAmountHuman = scaleHuman(minAmount.toString(), meta.decimals)

      const openBudgetDcaOrder =
        await rpc.sdk.api.scheduler.getOpenBudgetDcaOrder(
          Number(assetIn),
          Number(assetOut),
          minAmountHuman,
          getTimeFrameMillis(DEFAULT_DCA_DURATION),
        )
      const dcaOrder = await rpc.sdk.api.scheduler.getDcaOrder(
        Number(assetIn),
        Number(assetOut),
        minAmountHuman,
        getTimeFrameMillis(DEFAULT_DCA_DURATION),
        undefined,
      )

      const dcaOrderTx = await rpc.sdk.tx
        .order(dcaOrder)
        .withBeneficiary(account?.address ?? "")
        .withSlippage(slippage)
        .withMaxRetries(maxRetries)
        .build()
        .then((tx) => tx.get())

      const openBudgetDcaOrderTx = await rpc.sdk.tx
        .order(openBudgetDcaOrder)
        .withBeneficiary(account?.address ?? "")
        .withSlippage(slippage)
        .withMaxRetries(maxRetries)
        .build()
        .then((tx) => tx.get())

      return {
        dcaOrderTx,
        openBudgetDcaOrderTx,
      }
    },
  })

  const limitOrderBalanceWithFee = useMaxBalanceWithFee(tx?.dcaOrderTx ?? null)
  const openBudgetOrderBalanceWithFee = useMaxBalanceWithFee(
    tx?.openBudgetDcaOrderTx ?? null,
  )

  if (!enabled) {
    const balance = scaleHuman(
      getTransferableBalance(assetIn).toString(),
      meta.decimals,
    )

    return {
      limitOrderMaxBalance: balance,
      openBudgetOrderMaxBalance: balance,
    }
  }

  return {
    limitOrderMaxBalance: limitOrderBalanceWithFee?.maxBalanceHuman ?? "0",
    openBudgetOrderMaxBalance:
      openBudgetOrderBalanceWithFee?.maxBalanceHuman ?? "0",
  }
}
