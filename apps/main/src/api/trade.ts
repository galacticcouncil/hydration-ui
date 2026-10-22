import { SdkCtx, sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { QueryKey, queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { blockTimeQuery } from "@/api/chain"
import { papiDryRunErrorQuery } from "@/api/dryRun"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import { ENV } from "@/config/env"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"
import { toBigInt } from "@/utils/formatting"

export const TradeType = sor.TradeType

const tradeTypes = Object.values(TradeType)
export type TradeType = (typeof tradeTypes)[number]
export type Trade = sor.Trade
export type TradeOrder = sor.TradeOrder
export type TxBuilderFactory = SdkCtx["tx"]
export type TradeRouter = sor.TradeRouter

export const TradeOrderError = sor.TradeOrderError

type BestSellArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountIn: string
  readonly debug?: boolean
}

export const bestSellQuery = (
  { sdk, isReady }: TProviderContext,
  { assetIn, assetOut, amountIn, debug }: BestSellArgs,
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
    queryFn: async () => {
      const swap = await sdk.api.router.getBestSell(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      )

      if (debug) {
        console.log(swap.toHuman())
      }

      return swap
    },
    enabled: isReady && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
  })

export const bestSellTxQuery = (
  { sdk }: TProviderContext,
  swap: Trade,
  swapKey: QueryKey,
  address: string,
  slippage: number,
) =>
  queryOptions({
    queryKey: [swapKey, "tx"],
    queryFn: async () =>
      sdk.tx
        .trade(swap)
        .withSlippage(slippage)
        .withBeneficiary(address)
        .build()
        .then((tx) => tx.get()),
    enabled: !!address,
  })

type BestSellWithTxArgs = BestSellArgs & {
  readonly slippage: number
  readonly address: string
  readonly dryRun?: boolean
}

export const bestSellWithTxQuery = (
  rpc: TProviderContext,
  { slippage, address, dryRun, ...bestSellArgs }: BestSellWithTxArgs,
) => {
  const { queryClient } = rpc
  const bestSell = bestSellQuery(rpc, bestSellArgs)

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      bestSell.queryKey,
      slippage,
      address,
      dryRun,
    ],
    queryFn: async () => {
      const swap = await queryClient.ensureQueryData(bestSell)

      const txQuery = bestSellTxQuery(
        rpc,
        swap,
        bestSell.queryKey,
        address,
        slippage,
      )

      const tx = txQuery.enabled
        ? await queryClient.ensureQueryData(txQuery)
        : null

      const dryRunError =
        tx && dryRun && ENV.VITE_DRY_RUN_ENABLED
          ? await queryClient.ensureQueryData(
              papiDryRunErrorQuery(rpc, address, tx, bestSellArgs.debug),
            )
          : null

      return {
        swap,
        tx,
        dryRunError,
      }
    },
    enabled: bestSell.enabled as boolean,
  })
}

type BestSellTwapArgs = Omit<BestSellArgs, "debug">

export const bestSellTwapQuery = (
  rpc: TProviderContext,
  { assetIn, assetOut, amountIn }: BestSellTwapArgs,
  isIceEnabled: boolean,
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
      isIceEnabled,
    ],
    queryFn: async () => {
      const inId = Number(assetIn)
      const outId = Number(assetOut)
      if (!isIceEnabled) {
        return rpc.sdk.api.scheduler.getTwapSellOrder(inId, outId, amountIn)
      }
      // ICE: the scheduler's TWAP schedule (impact-based count, fixed
      // interval), built as a DCA order
      const { scheduler, router } = rpc.sdk.api
      const quote = await router.getBestSell(inId, outId, amountIn)
      const tradeCount = scheduler.getTwapTradeCount(
        Math.abs(quote.priceImpactPct),
      )
      return scheduler.getDcaOrder(
        inId,
        outId,
        amountIn,
        scheduler.getTwapExecutionTime(tradeCount),
        tradeCount,
      )
    },
    enabled:
      enabled &&
      rpc.isReady &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0),
  })

type BestBuyArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountOut: string
  readonly debug?: boolean
}

export const bestBuyQuery = (
  { sdk, isReady }: TProviderContext,
  { assetIn, assetOut, amountOut, debug }: BestBuyArgs,
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
    queryFn: async () => {
      const swap = await sdk.api.router.getBestBuy(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      )

      if (debug) {
        console.log(swap.toHuman())
      }

      return swap
    },
    enabled: isReady && !!assetIn && !!assetOut && Big(amountOut || "0").gt(0),
  })

export const bestBuyTxQuery = (
  { sdk }: TProviderContext,
  swap: Trade,
  swapKey: QueryKey,
  address: string,
  slippage: number,
) =>
  queryOptions({
    queryKey: [swapKey, "tx"],
    queryFn: () =>
      sdk.tx
        .trade(swap)
        .withSlippage(slippage)
        .withBeneficiary(address)
        .build()
        .then((tx) => tx.get()),
    enabled: !!address,
  })

type BestBuyWithTxArgs = BestBuyArgs & {
  readonly slippage: number
  readonly address: string
  readonly dryRun?: boolean
}

export const bestBuyWithTxQuery = (
  rpc: TProviderContext,
  { slippage, address, dryRun, ...bestBuyArgs }: BestBuyWithTxArgs,
) => {
  const { queryClient } = rpc
  const bestBuy = bestBuyQuery(rpc, bestBuyArgs)

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      bestBuy.queryKey,
      slippage,
      address,
      dryRun,
    ],
    queryFn: async () => {
      const swap = await queryClient.ensureQueryData(bestBuy)

      const txQuery = bestBuyTxQuery(
        rpc,
        swap,
        bestBuy.queryKey,
        address,
        slippage,
      )

      const tx = txQuery.enabled
        ? await queryClient.ensureQueryData(txQuery)
        : null

      const dryRunError =
        tx && dryRun && ENV.VITE_DRY_RUN_ENABLED
          ? await queryClient.ensureQueryData(
              papiDryRunErrorQuery(rpc, address, tx, bestBuyArgs.debug),
            )
          : null

      return {
        swap,
        tx,
        dryRunError,
      }
    },
    enabled: bestBuy.enabled as boolean,
  })
}

export const dcaOrderQuery = (rpc: TProviderContext, form: DcaFormValues) => {
  const { sdk, isReady, queryClient } = rpc
  const duration = getTimeFrameMillis(form.duration)

  const orders =
    form.orders.type === DcaOrdersMode.Custom
      ? (form.orders.value ?? undefined)
      : undefined

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "dcaOrder",
      form.sellAsset?.id,
      form.buyAsset?.id,
      form.sellAmount,
      form.duration,
      form.orders,
    ],
    queryFn: async () => {
      if (!form.sellAsset || !form.buyAsset) {
        return null
      }

      if (form.orders.type === DcaOrdersMode.OpenBudget) {
        return sdk.api.scheduler.getOpenBudgetDcaOrder(
          Number(form.sellAsset.id),
          Number(form.buyAsset.id),
          form.sellAmount,
          duration,
        )
      }

      const minBudget = await queryClient.ensureQueryData(
        minimumOrderBudgetQuery(
          rpc,
          form.sellAsset.id,
          form.sellAsset.decimals,
        ),
      )

      // getDcaOrder divides by tradeCount, which is 0 below 20% of min budget.
      const minTradeAmount = (minBudget * 2n) / 10n
      const amountIn = toBigInt(form.sellAmount, form.sellAsset.decimals)

      if (minTradeAmount === 0n || amountIn < minTradeAmount) {
        return null
      }

      return sdk.api.scheduler.getDcaOrder(
        Number(form.sellAsset.id),
        Number(form.buyAsset.id),
        form.sellAmount,
        duration,
        orders ?? undefined,
      )
    },
    enabled:
      isReady &&
      !!form.sellAsset &&
      !!form.buyAsset &&
      Big(form.sellAmount || "0").gt(0) &&
      duration > 0 &&
      (orders === undefined || orders > 0),
  })
}

export const minimumOrderBudgetQuery = (
  { isReady, sdk }: TProviderContext,
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
    enabled: isReady,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}

export const tradeOrderDurationQuery = (
  { sdk, isReady, queryClient }: TProviderContext,
  isIceEnabled: boolean,
  tradeCount: number,
  tradePeriod = 0,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapExecutionTime",
      tradeCount,
      tradePeriod,
      isIceEnabled,
    ],
    queryFn: async () => {
      if (!isIceEnabled) {
        return sdk.api.scheduler.getTwapExecutionTime(tradeCount)
      }

      const blockTimeMs = await queryClient.ensureQueryData(blockTimeQuery(sdk))
      return tradeCount * tradePeriod * blockTimeMs
    },
    enabled: isReady && tradeCount > 0 && (!isIceEnabled || tradePeriod > 0),
  })
