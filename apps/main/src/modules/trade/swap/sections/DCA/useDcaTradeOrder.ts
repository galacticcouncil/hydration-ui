import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorQuery } from "@/api/aave"
import { dcaTradeOrderQuery } from "@/api/trade"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { toDecimal } from "@/utils/formatting"

export const useDcaTradeOrder = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()
  const { getAsset } = useAssets()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const {
    dca: { slippage, maxRetries },
  } = useTradeSettings()

  const [sellAsset, buyAsset, sellAmount, durationTimeFrame, orders] =
    form.watch(["sellAsset", "buyAsset", "sellAmount", "duration", "orders"])

  const tradeCount =
    orders.type === DcaOrdersMode.Auto ? null : (orders.value ?? 0)

  const duration = getTimeFrameMillis(durationTimeFrame)

  const { data: orderData, isLoading: isOrderLoading } = useQuery(
    dcaTradeOrderQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
      duration,
      orders: tradeCount,
      slippage,
      maxRetries,
      address,
    }),
  )

  const assetOut = getAsset(orderData?.order.assetOut ?? 0)

  const { data: healthFactorData, isLoading: isHealthFactorLoading } = useQuery(
    healthFactorQuery(rpc, {
      fromAsset: sellAsset,
      fromAmount: sellAmount,
      toAsset: buyAsset,
      toAmount:
        orderData && assetOut
          ? toDecimal(orderData.order.amountOut, assetOut.decimals)
          : "0",
      address,
    }),
  )

  return {
    order: orderData?.order,
    orderTx: orderData?.orderTx,
    healthFactor: healthFactorData,
    isLoading: isOrderLoading || isHealthFactorLoading,
  }
}
