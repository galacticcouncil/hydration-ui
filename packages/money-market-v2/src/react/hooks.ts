import { skipToken, useQuery, UseQueryResult } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { Address } from "viem"

import {
  AccountSummary,
  readHollarFacilitator,
  readPositions,
  readReserves,
  readUserIncentives,
  readWalletBalances,
  summarizeAccount,
  SummarizeAccountRequest,
  summarizeReserves,
  summarizeRewards,
  SummarizeRewardsRequest,
} from "@/core"
import { useMoneyMarket } from "@/react/provider"
import { moneyMarketKeys } from "@/react/query-keys"
import { useTick } from "@/react/use-tick"
import {
  ClaimableReward,
  HollarFacilitator,
  MarketPositions,
  MarketReserves,
  MarketWalletBalances,
  ReserveSummary,
  UserReserveIncentives,
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

/** What {@link joinSources} needs from each read or derivation it joins. */
type Source = Pick<
  DerivedResult<unknown>,
  "isPending" | "isError" | "error" | "refetch"
>

/**
 * One {@link DerivedResult} over several sources: pending or failed if any of
 * them is, the first error found, and a refetch that asks every one again.
 */
export const joinSources = <T>(
  data: T | undefined,
  sources: Source[],
): DerivedResult<T> => ({
  data,
  isPending: sources.some((source) => source.isPending),
  isError: sources.some((source) => source.isError),
  error: sources.find((source) => source.error)?.error ?? null,
  refetch: () => sources.forEach((source) => void source.refetch()),
})

/**
 * Everything `summarizeAccount` — and so every assessment — takes, evaluated
 * on one tick.
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
 * backing it is a health factor nobody can reproduce. A hook built on this one
 * must therefore not call {@link useTick} again.
 */
export const useAccountRequest = (
  user: Address | undefined,
): DerivedResult<SummarizeAccountRequest> => {
  const reserves = useMarketReserves()
  const positions = useMarketPositions(user)
  const currentTimestamp = useTick()

  const reservesData = reserves.data
  const positionsData = positions.data

  const data = useMemo(() => {
    if (!reservesData || !positionsData) return undefined

    return {
      reserves: reservesData,
      summaries: summarizeReserves({ ...reservesData, currentTimestamp }),
      positions: positionsData,
      currentTimestamp,
    }
  }, [reservesData, positionsData, currentTimestamp])

  return joinSources(data, [reserves, positions])
}

/** The user's account standing and their per-position summaries. */
export const useAccountSummary = (
  user: Address | undefined,
): DerivedResult<AccountSummary> => {
  const request = useAccountRequest(user)
  const { data } = request

  const summary = useMemo(() => data && summarizeAccount(data), [data])

  return { ...request, data: summary }
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

/**
 * One user's reward state for every incentivised reserve, as read. The claim
 * builders take this payload directly; what it is worth comes from
 * {@link useClaimableRewards}.
 */
export const useUserIncentives = (
  user: Address | undefined,
): UseQueryResult<UserReserveIncentives[], Error> => {
  const { config, market } = useMoneyMarket()

  return useQuery({
    queryKey: moneyMarketKeys.rewards(market.market, user),
    queryFn: user ? () => readUserIncentives(config, market, user) : skipToken,
    staleTime: POSITIONS_STALE_TIME,
  })
}

/**
 * What `summarizeRewards` takes, on the same single tick as the account it
 * accrues against.
 */
export const useRewardsRequest = (
  user: Address | undefined,
): DerivedResult<SummarizeRewardsRequest> => {
  const account = useAccountRequest(user)
  const incentives = useUserIncentives(user)

  const accountData = account.data
  const userIncentives = incentives.data

  const data = useMemo(() => {
    if (!accountData || !userIncentives) return undefined

    const { reserves, positions, currentTimestamp } = accountData

    return { reserves, positions, userIncentives, currentTimestamp }
  }, [accountData, userIncentives])

  return joinSources(data, [account, incentives])
}

/** What the user can claim, per reward token, accrued to the current tick. */
export const useClaimableRewards = (
  user: Address | undefined,
): DerivedResult<ClaimableReward[]> => {
  const request = useRewardsRequest(user)
  const { data } = request

  const claimable = useMemo(() => data && summarizeRewards(data), [data])

  return { ...request, data: claimable }
}
