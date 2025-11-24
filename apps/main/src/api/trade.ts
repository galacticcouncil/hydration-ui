import { SdkCtx, sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"

export const TradeType = sor.TradeType

const tradeTypes = Object.values(TradeType)
export type TradeType = (typeof tradeTypes)[number]
export type Trade = sor.Trade
export type TradeOrder = sor.TradeOrder
export type TxBuilderFactory = SdkCtx["tx"]

export const TradeOrderType = sor.TradeOrderType
export const TradeOrderError = sor.TradeOrderError

type BestSellArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
  readonly slippage: number
  readonly address: string
}

export const bestSellQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountIn, slippage, address }: BestSellArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestSell",
      assetIn,
      assetOut,
      amountIn,
      address,
    ],
    queryFn: async () => {
      const swap = await sdk.api.router.getBestSell(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      )

      // debug for experienced users
      console.log(swap.toHuman())

      const tx = address
        ? await sdk.tx
            .trade(swap)
            .withSlippage(slippage)
            .withBeneficiary(address)
            .build()
            .then((tx) => tx.get())
        : null

      return {
        swap,
        tx,
      }
    },
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
  })

export const bestSellTwapQuery = (
  { sdk, isLoaded }: TProviderContext,
  {
    assetIn,
    assetOut,
    amountIn,
    slippage,
    maxRetries,
    address,
  }: BestSellArgs & { readonly maxRetries: number },
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
      address,
    ],
    queryFn: async () => {
      const twap = await sdk.api.scheduler.getTwapSellOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      )

      const tx = address
        ? await sdk.tx
            .order(twap)
            .withSlippage(slippage)
            .withMaxRetries(maxRetries)
            .withBeneficiary(address)
            .build()
            .then((tx) => tx.get())
        : null

      return { twap, tx }
    },
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
  readonly slippage: number
  readonly address: string
}

export const bestBuyQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountOut, slippage, address }: BestBuyArgs,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestBuy",
      assetIn,
      assetOut,
      amountOut,
      address,
    ],
    queryFn: async () => {
      const swap = await sdk.api.router.getBestBuy(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      )

      // debug for experienced users
      console.log(swap.toHuman())

      const tx = address
        ? await sdk.tx
            .trade(swap)
            .withSlippage(slippage)
            .withBeneficiary(address)
            .build()
            .then((tx) => tx.get())
        : null

      return {
        swap,
        tx,
      }
    },
    enabled: isLoaded && !!assetIn && !!assetOut && Big(amountOut || "0").gt(0),
  })

export const bestBuyTwapQuery = (
  { sdk, isLoaded }: TProviderContext,
  {
    assetIn,
    assetOut,
    amountOut,
    slippage,
    maxRetries,
    address,
  }: BestBuyArgs & { readonly maxRetries: number },
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
      address,
    ],
    queryFn: async () => {
      const twap = await sdk.api.scheduler.getTwapBuyOrder(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      )

      const tx = address
        ? await sdk.tx
            .order(twap)
            .withSlippage(slippage)
            .withMaxRetries(maxRetries)
            .withBeneficiary(address)
            .build()
            .then((tx) => tx.get())
        : null

      return { twap, tx }
    },
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
  readonly frequency: number
}

export const dcaTradeOrderQuery = (
  { sdk, isLoaded }: TProviderContext,
  { assetIn, assetOut, amountIn, duration, frequency }: DcaTradeOrderArgs,
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
      frequency,
    ],
    queryFn: () =>
      sdk.api.scheduler.getDcaOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
        duration,
        frequency,
      ),
    enabled:
      isLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0) &&
      frequency > 0 &&
      duration > 0,
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
