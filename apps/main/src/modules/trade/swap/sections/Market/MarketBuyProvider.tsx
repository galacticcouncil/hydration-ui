import { useQueries } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const MarketBuyProvider: FC<TradeProviderProps> = ({ children }) => {
  const rpc = useRpcProvider()
  const form = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset, buyAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "buyAmount",
  ])

  const [
    { data: swapData, isLoading: isSwapLoading },
    { data: twapData, isLoading: isTwapLoading },
  ] = useQueries({
    queries: [
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
      }),
      bestBuyTwapQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
      }),
    ],
  })

  return children({
    swap: swapData,
    twap: twapData,
    isLoading: isSwapLoading || isTwapLoading,
  })
}
