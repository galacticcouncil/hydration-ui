import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { bestSellQuery } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMarketTradeData = (form: UseFormReturn<MarketFormValues>) => {
  const rpc = useRpcProvider()

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  return useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
    }),
  )
}
