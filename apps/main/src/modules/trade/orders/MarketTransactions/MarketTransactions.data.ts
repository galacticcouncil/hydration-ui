import { useMemo } from "react"

import { MarketTransaction } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.column"
import { useAssets } from "@/providers/assetsProvider"

export const useMarketTransactionsData = () => {
  const { getAssetWithFallback } = useAssets()

  const transactions = useMemo<Array<MarketTransaction>>(() => {
    return [
      {
        fillPrice: "0.212",
        from: getAssetWithFallback("10"),
        fromAmount: "100",
        to: getAssetWithFallback("0"),
        toAmount: "10012",
        type: "buy",
        timestamp: "2025-05-23T11:37:58.307Z",
        address: "0x1234567890123456789012345678901234567890",
      },
    ]
  }, [getAssetWithFallback])

  return { transactions, isLoading: false }
}
