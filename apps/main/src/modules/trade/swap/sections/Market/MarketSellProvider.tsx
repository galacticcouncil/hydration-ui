import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { bestSellQuery } from "@/api/trade"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const MarketSellProvider: FC<TradeProviderProps> = ({ children }) => {
  const rpc = useRpcProvider()
  const form = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const { data, isLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
    }),
  )

  return children({
    swap: data,
    isLoading,
  })
}
