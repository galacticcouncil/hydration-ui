import { sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"

export const TradeType = sor.TradeType

const tradeTypes = Object.values(TradeType)
export type TradeType = (typeof tradeTypes)[number]

export const TradeOrderType = sor.TradeOrderType

type BestSellArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
}

export const bestSellQuery = (
  { sdk, isLoaded }: TProviderContext,
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
      sdk.api.router.getBestSell(Number(assetIn), Number(assetOut), amountIn),
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
  })

export const bestSellTwapQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountIn }: BestSellArgs,
  enabled = true,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapSellOrder",
      assetIn,
      assetOut,
      amountIn,
    ],
    queryFn: () =>
      sdk.api.scheduler.getTwapSellOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      ),
    enabled:
      enabled &&
      isLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0),
  })

type BestBuyArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountOut: string
}

export const bestBuyQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountOut }: BestBuyArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestBuy",
      assetIn,
      assetOut,
      amountOut,
    ],
    queryFn: () =>
      sdk.api.router.getBestBuy(Number(assetIn), Number(assetOut), amountOut),
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountOut || "0").gt(0),
  })

export const bestBuyTwapQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountOut }: BestBuyArgs,
  enabled = true,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapBuyOrder",
      assetIn,
      assetOut,
      amountOut,
    ],
    queryFn: () =>
      sdk.api.scheduler.getTwapBuyOrder(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      ),
    enabled:
      enabled &&
      isLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountOut || "0").gt(0),
  })

type DcaTradeOrderArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
  readonly duration: number
}

export const dcaTradeOrderQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountIn, duration }: DcaTradeOrderArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "dcaTradeOrder",
      assetIn,
      assetOut,
      amountIn,
      duration,
    ],
    queryFn: () =>
      sdk.api.scheduler.getDcaOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
        duration,
      ),
    enabled:
      isLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0) &&
      duration >= 0,
  })

export const minimumOrderBudgetQuery = (
  { isLoaded, sdk }: TProviderContext,
  assetId: string,
) => {
  return queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "trade", "minOrderBudget", assetId],
    queryFn: async () =>
      sdk.api.scheduler.getMinimumOrderBudget(Number(assetId)),
    enabled: isLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}

export const tradeOrderDurationQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  tradeCount: number,
  isEnabled: boolean,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapExecutionTime",
      tradeCount,
    ],
    queryFn: () => sdk.api.scheduler.getTwapExecutionTime(tradeCount),
    enabled: isEnabled && isApiLoaded && !!tradeCount,
  })
