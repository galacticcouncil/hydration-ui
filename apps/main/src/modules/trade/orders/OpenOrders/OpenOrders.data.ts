import { useMemo } from "react"

import { OpenOrder } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { useAssets } from "@/providers/assetsProvider"

export const useOpenOrdersData = () => {
  const { getAssetWithFallback } = useAssets()

  const orders = useMemo<Array<OpenOrder>>(() => {
    return [
      {
        from: getAssetWithFallback("10"),
        fromAmount: "100",
        to: getAssetWithFallback("0"),
        toAmount: "10012",
        averagePrice: "0.212",
        type: "dca",
        status: { type: "active" },
      },
    ]
  }, [getAssetWithFallback])

  return { orders, isLoading: false }
}
