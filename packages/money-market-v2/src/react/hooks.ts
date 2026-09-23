import { skipToken, useQuery, UseQueryResult } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { Address } from "viem"

import {
  AccountSummary,
  readHollarFacilitator,
  readPositions,
  readReserves,
  readWalletBalances,
  summarizeAccount,
  summarizeReserves,
} from "@/core"
import { useMoneyMarket } from "@/react/provider"
import { moneyMarketKeys } from "@/react/query-keys"
import { useTick } from "@/react/use-tick"
import {
  HollarFacilitator,
  MarketPositions,
  MarketReserves,
  MarketWalletBalances,
  ReserveSummary,
} from "@/types"

/**
 * A market's reserve list changes when governance lists an asset; its rates and
 * indices change every block, but ticking accrues those forward without a read.
 */
export const RESERVES_STALE_TIME = 5 * 60_000

/**
 * A user's own state is shorter-lived on purpose: it changes because of what
 * they just did, and a supply or a repay has to show up promptly.
 */
export const POSITIONS_STALE_TIME = 30_000

/** The market's reserves, base currency and reward configuration, as read. */
export const useMarketReserves = (): UseQueryResult<MarketReserves, Error> => {
  const { config, market } = useMoneyMarket()

  return useQuery({
    queryKey: moneyMarketKeys.reserves(market.market),
    queryFn: () => readReserves(config, market),
    staleTime: RESERVES_STALE_TIME,
  })
}

/** One user's per-reserve state and e-mode category, as read. */
export const useMarketPositions = (
  user: Address | undefined,
): UseQueryResult<MarketPositions, Error> => {
  const { config, market } = useMoneyMarket()

  return useQuery({
    queryKey: moneyMarketKeys.positions(market.market, user),
    queryFn: user ? () => readPositions(config, market, user) : skipToken,
    staleTime: POSITIONS_STALE_TIME,
  })
}

/**
 * What a hook that derives over one or more cached payloads reports.
 *
 * It is deliberately not a `UseQueryResult`: derivation over two queries has no
 * single status, and even over one the `refetch` of the underlying query is
 * typed to the payload rather than to what was derived from it. The fields
 * carried here are the ones a caller needs to render — a spinner, an error, the
 * value, and a way to ask again.
 */
export type DerivedResult<T> = {
  /** Undefined until every read it needs has resolved. */
  data: T | undefined
  isPending: boolean
  isError: boolean
  error: Error | null
  /** Re-reads the chain. The tick never does this on its own. */
  refetch: () => void
}

/**
 * Every reserve summarized against the current tick.
 *
 * The derivation is a memo over the cached payload: a tick changes the
 * timestamp it is evaluated at and nothing else, which is why it cannot cause a
 * refetch. Interest accrues continuously, so accruing the last payload forward
 * is what keeps a stale read reading correctly.
 */
export const useReserveSummaries = (): DerivedResult<ReserveSummary[]> => {
  const query = useMarketReserves()
  const currentTimestamp = useTick()
  const { data } = query

  const summaries = useMemo(
    () => (data ? summarizeReserves({ ...data, currentTimestamp }) : undefined),
    [data, currentTimestamp],
  )

  const refetch = useCallback(() => void query.refetch(), [query])

  return {
    data: summaries,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch,
  }
}

/**
 * The user's account standing and their per-position summaries.
 *
 * Reserves and positions stay separate queries underneath — that is what lets
 * the reserve list still render when a user's positions cannot be fetched — so
 * this reports the two statuses combined rather than pretending to be one
 * query.
 *
 * The reserve summaries are derived here rather than taken from
 * {@link useReserveSummaries}, so that the account and its collateral are
 * evaluated at exactly one timestamp. Two calls to {@link useTick} are two
 * independent timers, and an account valued a second apart from the reserves
 * backing it is a health factor nobody can reproduce.
 */
export const useAccountSummary = (
  user: Address | undefined,
): DerivedResult<AccountSummary> => {
  const reserves = useMarketReserves()
  const positions = useMarketPositions(user)
  const currentTimestamp = useTick()

  const reservesData = reserves.data
  const positionsData = positions.data

  const data = useMemo(() => {
    if (!reservesData || !positionsData) return undefined

    return summarizeAccount({
      reserves: reservesData,
      summaries: summarizeReserves({ ...reservesData, currentTimestamp }),
      positions: positionsData,
      currentTimestamp,
    })
  }, [reservesData, positionsData, currentTimestamp])

  const refetch = useCallback(() => {
    void reserves.refetch()
    void positions.refetch()
  }, [reserves, positions])

  return {
    data,
    isPending: reserves.isPending || positions.isPending,
    isError: reserves.isError || positions.isError,
    error: reserves.error ?? positions.error,
    refetch,
  }
}

/**
 * What the user holds in their wallet of each reserve's underlying asset.
 *
 * Alone among the reads this one returns human units already — the provider
 * reports no decimals, so the read joins against the reserve list to mean
 * anything — which is why there is nothing here to re-derive and no tick. It
 * waits on the reserves for that join; the joined-against list is not part of
 * the key, because a reserve's decimals do not change.
 */
export const useWalletBalances = (
  user: Address | undefined,
): UseQueryResult<MarketWalletBalances, Error> => {
  const { config, market } = useMoneyMarket()
  const { data } = useMarketReserves()
  const reserves = data?.reserves

  return useQuery({
    queryKey: moneyMarketKeys.balances(market.market, user),
    queryFn:
      user && reserves
        ? () => readWalletBalances(config, market, user, reserves)
        : skipToken,
    staleTime: POSITIONS_STALE_TIME,
  })
}

/**
 * The market's Hollar facilitator bucket — the real cap on Hollar borrowing.
 * Minting moves it, so it goes stale on the same clock as a user's state.
 */
export const useHollarFacilitator = (): UseQueryResult<
  HollarFacilitator,
  Error
> => {
  const { config, market } = useMoneyMarket()

  return useQuery({
    queryKey: moneyMarketKeys.hollar(market.market),
    queryFn: () => readHollarFacilitator(config, market),
    staleTime: POSITIONS_STALE_TIME,
  })
}
