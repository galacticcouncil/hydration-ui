import { useMemo } from "react"

import { OrderHistory } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { useAssets } from "@/providers/assetsProvider"

export const useOrderHistoryData = () => {
  const { getAssetWithFallback } = useAssets()

  const orders = useMemo<Array<OrderHistory>>(() => {
    return [
      {
        from: getAssetWithFallback("10"),
        fromAmount: "100",
        to: getAssetWithFallback("0"),
        toAmount: "10012",
        fillPrice: "0.212",
        type: "dca",
        status: { type: "canceled" },
      },
    ]
  }, [getAssetWithFallback])

  return { orders, isLoading: false }
}
