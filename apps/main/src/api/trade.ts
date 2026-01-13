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
export type TradeRouter = sor.TradeRouter

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
  disableDebug = false,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestSell",
      assetIn,
      assetOut,
      amountIn,
      slippage,
      address,
    ],
    queryFn: async () => {
      const swap = await sdk.api.router.getBestSell(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      )

      // debug for experienced users
      if (!disableDebug) {
        console.log(swap.toHuman())
      }

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
      slippage,
      maxRetries,
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
  disableDebug = false,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "bestBuy",
      assetIn,
      assetOut,
      amountOut,
      slippage,
      address,
    ],
    queryFn: async () => {
      const swap = await sdk.api.router.getBestBuy(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      )

      // debug for experienced users
      if (!disableDebug) {
        console.log(swap.toHuman())
      }

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
      slippage,
      maxRetries,
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
  readonly orders: number | null
  readonly slippage: number
  readonly maxRetries: number
  readonly address: string
}

export const dcaTradeOrderQuery = (
  { sdk, isLoaded }: TProviderContext,
  {
    assetIn,
    assetOut,
    amountIn,
    duration,
    orders,
    slippage,
    maxRetries,
    address,
  }: DcaTradeOrderArgs,
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
      orders,
      address,
    ],
    queryFn: async () => {
      const order = await sdk.api.scheduler.getDcaOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
        duration,
        orders ?? undefined,
      )

      const orderTx = address
        ? await sdk.tx
            .order(order)
            .withBeneficiary(address)
            .withSlippage(slippage)
            .withMaxRetries(maxRetries)
            .build()
            .then((tx) => tx.get())
        : null

      return { order, orderTx }
    },
    enabled:
      isLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0) &&
      duration > 0 &&
      (orders === null || orders > 0),
  })

export const minimumOrderBudgetQuery = (
  { isLoaded, sdk }: TProviderContext,
  assetId: string,
  assetDecimals: number,
) => {
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "minOrderBudget",
      assetId,
      assetDecimals,
    ],
    queryFn: async () =>
      sdk.api.scheduler.getMinimumOrderBudget(Number(assetId), assetDecimals),
    enabled: isLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}

export const tradeOrderDurationQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  tradeCount: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapExecutionTime",
      tradeCount,
    ],
    queryFn: () => sdk.api.scheduler.getTwapExecutionTime(tradeCount),
    enabled: isApiLoaded && tradeCount > 0,
  })
