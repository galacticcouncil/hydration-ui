import { SdkCtx, sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { QueryKey, queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { papiDryRunErrorQuery } from "@/api/dryRun"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
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
        tx && dryRun
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
  { sdk, isApiLoaded }: TProviderContext,
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
    queryFn: async () =>
      sdk.api.scheduler.getTwapSellOrder(
        Number(assetIn),
        Number(assetOut),
        amountIn,
      ),
    enabled:
      enabled &&
      isApiLoaded &&
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
        tx && dryRun
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
        tx && dryRun
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

type BestBuyTwapArgs = Omit<BestBuyArgs, "debug">

export const bestBuyTwapQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  { assetIn, assetOut, amountOut }: BestBuyTwapArgs,
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
    queryFn: async () =>
      sdk.api.scheduler.getTwapBuyOrder(
        Number(assetIn),
        Number(assetOut),
        amountOut,
      ),
    enabled:
      enabled &&
      isApiLoaded &&
      !!assetIn &&
      !!assetOut &&
      Big(amountOut || "0").gt(0),
  })

export const bestBuyTwapTxQuery = (
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

type BestBuyTwapWithTxArgs = BestBuyTwapArgs & {
  readonly slippage: number
  readonly address: string
  readonly maxRetries: number
  readonly dryRun?: boolean
}

export const bestBuyTwapWithTxQuery = (
  rpc: TProviderContext,
  {
    slippage,
    maxRetries,
    address,
    dryRun,
    ...bestBuyTwapArgs
  }: BestBuyTwapWithTxArgs,
  enabled = true,
) => {
  const { queryClient } = rpc
  const bestBuyTwap = bestBuyTwapQuery(rpc, bestBuyTwapArgs)

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      bestBuyTwap.queryKey,
      slippage,
      maxRetries,
      address,
      dryRun,
    ],
    queryFn: async () => {
      const twap = await queryClient.ensureQueryData(bestBuyTwap)

      const txQuery = bestBuyTwapTxQuery(
        rpc,
        twap,
        bestBuyTwap.queryKey,
        address,
        slippage,
        maxRetries,
      )

      const tx = txQuery.enabled
        ? await queryClient.ensureQueryData(txQuery)
        : null

      const dryRunError =
        tx && dryRun
          ? await queryClient.ensureQueryData(
              papiDryRunErrorQuery(rpc, address, tx),
            )
          : null

      return { twap, tx, dryRunError }
    },
    enabled: enabled && (bestBuyTwap.enabled as boolean),
  })
}

export const dcaOrderQuery = (
  { sdk, isLoaded }: TProviderContext,
  form: DcaFormValues,
) => {
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
    queryFn: () => {
      if (!form.sellAsset || !form.buyAsset) {
        return null
      }

      return form.orders.type === DcaOrdersMode.OpenBudget
        ? sdk.api.scheduler.getOpenBudgetDcaOrder(
            Number(form.sellAsset.id),
            Number(form.buyAsset.id),
            form.sellAmount,
            duration,
          )
        : sdk.api.scheduler.getDcaOrder(
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

export const dcaTxQuery = (
  { sdk }: TProviderContext,
  order: TradeOrder,
  orderKey: QueryKey,
  address: string,
  slippage: number,
  maxRetries: number,
) =>
  queryOptions({
    queryKey: [orderKey, "tx"],
    queryFn: () =>
      sdk.tx
        .order(order)
        .withBeneficiary(address)
        .withSlippage(slippage)
        .withMaxRetries(maxRetries)
        .build()
        .then((tx) => tx.get()),
    enabled: !!address,
  })

type DcaTradeOrderArgs = {
  readonly form: DcaFormValues
  readonly slippage: number
  readonly maxRetries: number
  readonly address: string
  readonly dryRun?: boolean
}

export const dcaTradeOrderQuery = (
  rpc: TProviderContext,
  { form, slippage, maxRetries, address, dryRun }: DcaTradeOrderArgs,
) => {
  const { queryClient } = rpc
  const dcaOrder = dcaOrderQuery(rpc, form)

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      dcaOrder.queryKey,
      slippage,
      maxRetries,
      address,
      dryRun,
    ],
    queryFn: async () => {
      const order = await queryClient.ensureQueryData(dcaOrder)

      const txQuery = order
        ? dcaTxQuery(
            rpc,
            order,
            dcaOrder.queryKey,
            address,
            slippage,
            maxRetries,
          )
        : null

      const orderTx = txQuery?.enabled
        ? await queryClient.ensureQueryData(txQuery)
        : null

      const dryRunError =
        orderTx && dryRun
          ? await queryClient.ensureQueryData(
              papiDryRunErrorQuery(rpc, address, orderTx),
            )
          : null

      return { order, orderTx, dryRunError }
    },
    enabled: dcaOrder.enabled as boolean,
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
