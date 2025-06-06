import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

type BestSellArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
}

export const bestSellQuery = (
  { tradeRouter, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountIn }: BestSellArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestSell",
      assetIn,
      assetOut,
      amountIn,
    ],
    queryFn: () =>
      tradeRouter.getBestSell(Number(assetIn), Number(assetOut), amountIn),
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
  })

type BestBuyArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountOut: string
}

export const bestBuyQuery = (
  { tradeRouter, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountOut }: BestBuyArgs,
) => {
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestBuy",
      assetIn,
      assetOut,
      amountOut,
    ],
    queryFn: () =>
      tradeRouter.getBestBuy(Number(assetIn), Number(assetOut), amountOut),
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountOut || "0").gt(0),
  })
}
