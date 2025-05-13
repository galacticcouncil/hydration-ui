import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { bestSellQuery } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/useMarketForm"
import { useMarketSellTwapQuery } from "@/modules/trade/swap/sections/Market/useMarketSellTwapQuery"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMarketTradeData = (form: UseFormReturn<MarketFormValues>) => {
  const rpc = useRpcProvider()

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const { data: swap, isLoading: isLoadingSwap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
    }),
  )

  const {
    data: twap,
    isLoading: isLoadingTwap,
    showTwap,
  } = useMarketSellTwapQuery(swap, sellAsset, buyAsset, sellAmount)

  return {
    swap,
    twap,
    showTwap,
    isLoadingSwap,
    isLoadingTwap,
  }
}
