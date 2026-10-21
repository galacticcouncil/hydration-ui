import { queryOptions } from "@tanstack/react-query"

import { getInfoClient } from "@/client"

/**
 * Cadence for live market and account data. Info requests are rate limited
 * by weight (1200/min per IP); at this pace the page's polling stays well
 * inside that even with the heavier universe queries.
 */
export const LIVE_REFETCH_MS = 5_000

const network = (isTestnet: boolean) => (isTestnet ? "testnet" : "mainnet")

export const hyperliquidQueryKeys = {
  all: ["hyperliquid"] as const,
  maxBuilderFee: (isTestnet: boolean, user: string, builder: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "maxBuilderFee",
      user,
      builder,
    ] as const,
  userRole: (isTestnet: boolean, user: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "userRole",
      user,
    ] as const,
  metaAndAssetCtxs: (isTestnet: boolean) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "metaAndAssetCtxs",
    ] as const,
  clearinghouseState: (isTestnet: boolean, user: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "clearinghouseState",
      user,
    ] as const,
  activeAssetData: (isTestnet: boolean, user: string, coin: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "activeAssetData",
      user,
      coin,
    ] as const,
  candles: (isTestnet: boolean, coin: string, interval: CandleInterval) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "candles",
      coin,
      interval,
    ] as const,
  openOrders: (isTestnet: boolean, user: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "openOrders",
      user,
    ] as const,
  spotMetaAndAssetCtxs: (isTestnet: boolean) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "spotMetaAndAssetCtxs",
    ] as const,
  spotClearinghouseState: (isTestnet: boolean, user: string) =>
    [
      ...hyperliquidQueryKeys.all,
      network(isTestnet),
      "spotClearinghouseState",
      user,
    ] as const,
}

export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w"

/** Roughly 200 candles per interval, which fills the chart without overfetching. */
const CANDLE_LOOKBACK_MS: Record<CandleInterval, number> = {
  "1m": 200 * 60_000,
  "5m": 200 * 5 * 60_000,
  "15m": 200 * 15 * 60_000,
  "1h": 200 * 3_600_000,
  "4h": 200 * 4 * 3_600_000,
  "1d": 200 * 86_400_000,
  "1w": 200 * 7 * 86_400_000,
}

const user = (address: string) => ({ user: address as `0x${string}` })

/**
 * The fee, in tenths of a basis point, that the user has already approved for
 * our builder address. Returns 0 when no approval exists yet.
 */
export const maxBuilderFeeQuery = (
  isTestnet: boolean,
  address: string,
  builder: string,
) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.maxBuilderFee(isTestnet, address, builder),
    queryFn: () =>
      getInfoClient(isTestnet).maxBuilderFee({
        ...user(address),
        builder: builder as `0x${string}`,
      }),
    enabled: !!address && !!builder,
  })

/**
 * Whether the address exists on Hyperliquid at all. Every action — the
 * builder approval included — is rejected until the account has received its
 * first deposit, and the API reports such addresses as `missing`.
 */
export const userRoleQuery = (isTestnet: boolean, address: string) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.userRole(isTestnet, address),
    queryFn: () => getInfoClient(isTestnet).userRole(user(address)),
    enabled: !!address,
  })

/** Perp universe plus per-asset mark price, funding and open interest. */
export const metaAndAssetCtxsQuery = (isTestnet: boolean) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.metaAndAssetCtxs(isTestnet),
    queryFn: () => getInfoClient(isTestnet).metaAndAssetCtxs(),
    refetchInterval: LIVE_REFETCH_MS,
  })

/** Perp account summary: margin, withdrawable balance and open positions. */
export const clearinghouseStateQuery = (isTestnet: boolean, address: string) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.clearinghouseState(isTestnet, address),
    queryFn: () => getInfoClient(isTestnet).clearinghouseState(user(address)),
    enabled: !!address,
    refetchInterval: LIVE_REFETCH_MS,
  })

/**
 * Per-market account state: the leverage currently set for the asset (which
 * persists whether or not a position is open) and what is available to trade.
 */
export const activeAssetDataQuery = (
  isTestnet: boolean,
  address: string,
  coin: string,
) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.activeAssetData(isTestnet, address, coin),
    queryFn: () =>
      getInfoClient(isTestnet).activeAssetData({ ...user(address), coin }),
    enabled: !!address && !!coin,
    refetchInterval: LIVE_REFETCH_MS,
  })

/** OHLCV history for one perp market. */
export const candlesQuery = (
  isTestnet: boolean,
  coin: string,
  interval: CandleInterval,
) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.candles(isTestnet, coin, interval),
    queryFn: () =>
      getInfoClient(isTestnet).candleSnapshot({
        coin,
        interval,
        startTime: Date.now() - CANDLE_LOOKBACK_MS[interval],
      }),
    enabled: !!coin,
    refetchInterval: 60_000,
  })

/** Resting orders for the account. */
export const openOrdersQuery = (isTestnet: boolean, address: string) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.openOrders(isTestnet, address),
    queryFn: () => getInfoClient(isTestnet).openOrders(user(address)),
    enabled: !!address,
    refetchInterval: LIVE_REFETCH_MS,
  })

/**
 * Spot universe plus per-pair context. Unlike perps, the context array is not
 * aligned with the universe array — entries must be matched on `coin`, which
 * is the pair's wire name (`@107`), not its display name.
 */
export const spotMetaAndAssetCtxsQuery = (isTestnet: boolean) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.spotMetaAndAssetCtxs(isTestnet),
    queryFn: () => getInfoClient(isTestnet).spotMetaAndAssetCtxs(),
    refetchInterval: LIVE_REFETCH_MS,
  })

/** Spot token balances, which fund spot orders rather than perp margin. */
export const spotClearinghouseStateQuery = (
  isTestnet: boolean,
  address: string,
) =>
  queryOptions({
    queryKey: hyperliquidQueryKeys.spotClearinghouseState(isTestnet, address),
    queryFn: () =>
      getInfoClient(isTestnet).spotClearinghouseState(user(address)),
    enabled: !!address,
    refetchInterval: LIVE_REFETCH_MS,
  })
