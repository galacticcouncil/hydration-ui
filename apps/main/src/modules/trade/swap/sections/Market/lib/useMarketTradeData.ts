import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { bestSellQuery } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useMarketSellTwapQuery } from "@/modules/trade/swap/sections/Market/lib/useMarketSellTwapQuery"
import { useMarketSwapTxQuery } from "@/modules/trade/swap/sections/Market/lib/useMarketSwapTx"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMarketTradeData = (form: UseFormReturn<MarketFormValues>) => {
  const rpc = useRpcProvider()

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const swapQuery = bestSellQuery(rpc, {
    assetIn: sellAsset?.id ?? "",
    assetOut: buyAsset?.id ?? "",
    amountIn: sellAmount,
  })

  const { data: swap, isLoading: isLoadingSwap } = useQuery(swapQuery)

  const { data: swapTx, isLoading: isLoadingSwapTx } = useMarketSwapTxQuery(
    sellAsset,
    swap,
    swapQuery.queryKey,
  )

  const {
    data: twap,
    isLoading: isLoadingTwap,
    showTwap,
  } = useMarketSellTwapQuery(
    swap,
    swapTx,
    swapQuery.queryKey,
    sellAsset,
    buyAsset,
  )

  return {
    swap,
    swapTx,
    twap,
    showTwap,
    isLoadingSwap,
    isLoadingSwapTx,
    isLoadingTwap,
  }
}
