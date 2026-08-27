import { SdkCtx, sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { QueryKey, queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { papiDryRunErrorQuery } from "@/api/dryRun"
import { PoolType } from "@/api/pools"
import { computeTwapProposal } from "@/api/twapProposal"
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
  { sdk, isApiLoaded }: TProviderContext,
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
    enabled:
      isApiLoaded && !!assetIn && !!assetOut && Big(amountIn || "0").gt(0),
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

const TWAP_BLOCK_TIME_MS = 6000

/**
 * The order's flow as a fraction of the Omnipool-hop asset's reserve — the input
 * to the fee-aware cadence. Reads the actual route from the quote and the reserve
 * from live pool state. Returns 0 when no Omnipool dynamic-fee hop is on the route
 * (flat XYK/Stableswap/Aave legs), which collapses pacing to the minimum period.
 */
const getOmnipoolFraction = async (
  sdk: SdkCtx,
  quote: Trade,
): Promise<number> => {
  const hop = quote.swaps.find((s) => s.pool === PoolType.Omni)
  if (!hop || hop.amountOut <= 0n) {
    return 0
  }
  const pools = await sdk.ctx.pool.getPools()
  const omni = pools.find((p) => p.type === PoolType.Omni)
  const token = omni?.tokens.find((t) => Number(t.id) === Number(hop.assetOut))
  if (!token || token.balance <= 0n) {
    return 0
  }
  return Number(hop.amountOut) / Number(token.balance)
}

const getMinDcaPeriod = async ({
  papiClient,
}: TProviderContext): Promise<number> =>
  Number(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (papiClient.getUnsafeApi() as any).constants.Intent.MinDcaPeriod(),
  )

/**
 * Build an inline TWAP order sized for any amount: impact-based fine slicing plus
 * a fee-aware cadence (`computeTwapProposal`), executed as a `Dca` order so there
 * are no 6h / 600-slice / `OrderImpactTooBig` caps and the swap page can always
 * offer a working setup. ICE-only; the legacy path keeps `getTwap*Order`.
 */
const buildTwapProposalOrder = async (
  rpc: TProviderContext,
  assetIn: number,
  assetOut: number,
  quote: Trade,
  sellAmount: string,
): Promise<TradeOrder> => {
  const { sdk } = rpc
  const decimals = quote.swaps[0]?.assetInDecimals ?? 12
  const [minOrderBudget, poolFraction, minDcaPeriod] = await Promise.all([
    sdk.api.scheduler.getMinimumOrderBudget(assetIn, decimals),
    getOmnipoolFraction(sdk, quote),
    getMinDcaPeriod(rpc),
  ])
  const { slices, durationMs } = computeTwapProposal({
    impactPct: quote.priceImpactPct,
    amount: quote.amountIn,
    minOrderBudget,
    poolFraction,
    minDcaPeriod,
    blockTimeMs: TWAP_BLOCK_TIME_MS,
  })
  return sdk.api.scheduler.getDcaOrder(
    assetIn,
    assetOut,
    sellAmount,
    durationMs,
    slices,
  )
}

type BestSellTwapArgs = Omit<BestSellArgs, "debug">

export const bestSellTwapQuery = (
  rpc: TProviderContext,
  { assetIn, assetOut, amountIn }: BestSellTwapArgs,
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
    queryFn: async () => {
      const inId = Number(assetIn)
      const outId = Number(assetOut)
      // Legacy (non-ICE) path unchanged.
      if (!rpc.featureFlags.isIceEnabled) {
        return rpc.sdk.api.scheduler.getTwapSellOrder(inId, outId, amountIn)
      }
      const quote = await rpc.sdk.api.router.getBestSell(inId, outId, amountIn)
      return buildTwapProposalOrder(rpc, inId, outId, quote, amountIn)
    },
    enabled:
      enabled &&
      rpc.isApiLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountIn || "0").gt(0),
  })

export const bestSellTwapTxQuery = (
  { sdk }: TProviderContext,
  twap: TradeOrder,
  twapKey: QueryKey,
  address: string,
  slippage: number,
  maxRetries: number,
) =>
  queryOptions({
    queryKey: [twapKey, "tx"],
    queryFn: () =>
      sdk.tx
        .order(twap)
        .withSlippage(slippage)
        .withMaxRetries(maxRetries)
        .withBeneficiary(address)
        .build()
        .then((tx) => tx.get()),
    enabled: !!address,
  })

type BestSellTwapWithTxArgs = BestSellTwapArgs & {
  readonly slippage: number
  readonly address: string
  readonly maxRetries: number
  readonly dryRun?: boolean
}

export const bestSellTwapWithTxQuery = (
  rpc: TProviderContext,
  {
    slippage,
    maxRetries,
    address,
    dryRun,
    ...bestSellTwapArgs
  }: BestSellTwapWithTxArgs,
  enabled = true,
) => {
  const { queryClient } = rpc
  const bestSellTwap = bestSellTwapQuery(rpc, bestSellTwapArgs)

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      bestSellTwap.queryKey,
      slippage,
      maxRetries,
      address,
      dryRun,
    ],
    queryFn: async () => {
      const twap = await queryClient.ensureQueryData(bestSellTwap)

      const txQuery = bestSellTwapTxQuery(
        rpc,
        twap,
        bestSellTwap.queryKey,
        address,
        slippage,
        maxRetries,
      )

      const tx = txQuery.enabled
        ? await queryClient.ensureQueryData(txQuery)
        : null

      const dryRunError =
        tx && dryRun && ENV.VITE_DRY_RUN_ENABLED
          ? await queryClient.ensureQueryData(
              papiDryRunErrorQuery(rpc, address, tx),
            )
          : null

      return { twap, tx, dryRunError }
    },
    enabled: enabled && (bestSellTwap.enabled as boolean),
  })
}

type BestBuyArgs = {
  readonly assetIn: string
  readonly assetOut: string
  readonly amountOut: string
  readonly debug?: boolean
}

export const bestBuyQuery = (
  { sdk, isApiLoaded }: TProviderContext,
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
    enabled:
      isApiLoaded && !!assetIn && !!assetOut && Big(amountOut || "0").gt(0),
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
  const { sdk, isLoaded, queryClient } = rpc
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
      isLoaded &&
      !!form.sellAsset &&
      !!form.buyAsset &&
      Big(form.sellAmount || "0").gt(0) &&
      duration > 0 &&
      (orders === undefined || orders > 0),
  })
}

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

/** Scheduler's TWAP execution interval in blocks (TWAP_EXECUTION_INTERVAL). */
const TWAP_INTERVAL_BLOCKS = 6

export const tradeOrderDurationQuery = (
  { sdk, papiClient, featureFlags, isApiLoaded }: TProviderContext,
  tradeCount: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapExecutionTime",
      tradeCount,
      featureFlags.isIceEnabled,
    ],
    queryFn: async () => {
      const duration = await sdk.api.scheduler.getTwapExecutionTime(tradeCount)

      if (!featureFlags.isIceEnabled) {
        return duration
      }

      // The intent pallet enforces a per-network minimum block period
      // (MinDcaPeriod) and the tx builder clamps the order to it, so the
      // real cadence can be slower than the scheduler's 6-block interval.
      const minDcaPeriod: number =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (papiClient.getUnsafeApi() as any).constants.Intent.MinDcaPeriod()

      return minDcaPeriod > TWAP_INTERVAL_BLOCKS
        ? (duration * minDcaPeriod) / TWAP_INTERVAL_BLOCKS
        : duration
    },
    enabled: isApiLoaded && tradeCount > 0,
  })
