import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { dcaTradeOrderQuery } from "@/api/trade"
import { getPeriodDuration } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const useDcaTradeOrder = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const {
    dca: { slippage, maxRetries },
  } = useTradeSettings()

  const [sellAsset, buyAsset, sellAmount, frequencyPeriod, orders] = form.watch(
    ["sellAsset", "buyAsset", "sellAmount", "frequency", "orders"],
  )

  const frequency = getPeriodDuration(frequencyPeriod)

  const [
    { data: orderData, isLoading: isOrderLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      dcaTradeOrderQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
        frequency,
        orders: orders ?? 0,
        slippage,
        maxRetries,
        address,
      }),
      healthFactorAfterWithdrawQuery(rpc, {
        address,
        fromAssetId:
          sellAsset && isErc20AToken(sellAsset)
            ? sellAsset.underlyingAssetId
            : "",
        fromAmount: sellAmount,
      }),
    ],
  })

  return {
    order: orderData?.order,
    orderTx: orderData?.orderTx,
    healthFactor: healthFactorData,
    isLoading: isOrderLoading || isHealthFactorLoading,
  }
}
