import { IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { STAKE_GIGAPOT_ADDRESS } from "@/api/gigaStake"
import { useIndexerClient } from "@/api/provider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

/**
 * GIGAHDX APR (annual percentage return).
 *
 *   totalAPR = baseAPR + votingAPR
 *
 * Both components are backward-looking over a sliding window (default 60d,
 * capped at chain age). Both are FLEET-level — same value for every user,
 * because both measure realised system-wide flow (gigapot inflow for base,
 * voter-reward events for voting) divided by the current stake base.
 */

const BLOCKS_PER_DAY = 14_400
const DEFAULT_WINDOW_DAYS = 60

/**
 * APR queries deliberately load **once per session** — backward-looking
 * windowed averages move slowly and a fleet-level number doesn't need to
 * react to individual blocks. Keeping these stable also prevents the
 * dashboard headline from flickering on every chain tick.
 *
 * Refresh path: a full page reload (or react-query `invalidateQueries`).
 *
 * The version suffix in the queryKey is a cache-bust marker for formula
 * migrations — any cached value from the previous version is discarded on
 * first render under the new code.
 */
const APR_QUERY_OPTS = {
  // Never go stale on its own — explicit invalidation only.
  staleTime: Infinity,
  // Don't refetch on remount / window focus / network reconnect.
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
}
const QUERY_KEY_VERSION = "v3"

// ---------------------------------------------------------------------------
// Base APR (passive — gigapot inflow)
// ---------------------------------------------------------------------------

/**
 * Passive APR — annualised HDX flow into the gigapot per unit of total stake.
 *
 *   baseAPR = (gp_now − gp_t0) / (TL_now + gp_now) × (365 / actualWindowDays) × 100
 *
 * Where:
 *   - gp        = `System.Account(gigapot).data.free` (yield accumulator)
 *   - TL        = `GigaHdx.TotalLocked`               (sum of all stake principal)
 *   - TL + gp   = runtime's `total_staked_hdx()`     (HDX backing all GIGAHDX)
 *
 * Position-size-independent — the rate moves the same for every GIGAHDX
 * holder proportional to their balance, so the displayed % applies universally.
 *
 * On chains younger than the requested window, the window clamps to the
 * actual elapsed days (so a 60d request on a 9d chain annualises over 9d).
 *
 * Mild undercount on mature chains when `realize_yield` or yield-paying
 * unstakes drain the pot during the window — those flows are real yield but
 * leave the pot. Errs conservative; never overstates. Event-scan compensation
 * would be needed for full accuracy and is deferred to indexer integration.
 */
export const passiveAprQuery = (
  rpc: TProviderContext,
  windowDays: number = DEFAULT_WINDOW_DAYS,
) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "passive", QUERY_KEY_VERSION, windowDays],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const headBlock = Number(
        await rpc.papi.query.System.Number.getValue({ at: "best" }),
      )
      const windowBlocks = windowDays * BLOCKS_PER_DAY
      const t0Block = Math.max(1, headBlock - windowBlocks)
      const actualWindowBlocks = headBlock - t0Block
      const actualWindowDays = Math.max(1, actualWindowBlocks / BLOCKS_PER_DAY)

      // Raw RPC for the t0 hash — returns a 0x-prefixed hex string that
      // polkadot-api's `{ at }` accepts (same pattern as api/multisig.ts).
      // Current state uses `{ at: "best" }`; no need to materialise the head
      // hash.
      const t0HashStr: string = await rpc.papiClient._request(
        "chain_getBlockHash",
        [t0Block],
      )

      const [tlNowRaw, gpNowAcct, gpT0Acct] = await Promise.all([
        unsafeApi.query.GigaHdx.TotalLocked.getValue({ at: "best" }).catch(
          () => 0n,
        ),
        rpc.papi.query.System.Account.getValue(STAKE_GIGAPOT_ADDRESS, {
          at: "best",
        }),
        rpc.papi.query.System.Account.getValue(STAKE_GIGAPOT_ADDRESS, {
          at: t0HashStr,
        }).catch(() => undefined),
      ])

      const tlNow = BigInt(tlNowRaw ?? 0n)
      const gpNow = BigInt(gpNowAcct?.data?.free ?? 0n)
      const gpT0 = BigInt(gpT0Acct?.data?.free ?? 0n)

      const totalStake = tlNow + gpNow
      if (totalStake === 0n) return Big(0)

      // Cap negative deltas at 0 — pot can only shrink via privileged ops or
      // yield-paying user flows (already-earned HDX leaving the pot); neither
      // represents anti-yield.
      const dgp = gpNow > gpT0 ? gpNow - gpT0 : 0n

      return Big(dgp.toString())
        .div(totalStake.toString())
        .times(365)
        .div(actualWindowDays)
        .times(100)
    },
  })

// ---------------------------------------------------------------------------
// Voting APR (active — annualised voter payouts over window)
// ---------------------------------------------------------------------------

/**
 * Voting APR — annualised HDX paid out as voting rewards over the window,
 * divided by total stake.
 *
 *   votingAPR = Σ rewardAmount(UserRewardRecorded in window)
 *               / (TotalLocked + gigapot.free)
 *               × (365 / actualWindowDays) × 100
 *
 * Backward-looking, event-based. Mirrors `useStakingAPR`'s pattern: pull
 * realised history from the indexer, divide by current stake, annualise.
 *
 * The pallet emits `GigaHdxRewards.UserRewardRecorded { who, ref_index,
 * reward_amount }` every time a voter's per-ref share is credited to
 * PendingRewards. Summing those amounts over a 60-day window gives the
 * total HDX actually paid out to voters — no assumptions about conviction,
 * track, ref count, or participation rate. The runtime did the math; we
 * read the receipts.
 *
 * Fleet-level: same value for every user, like passive APR. No `stakeValue`
 * parameter — the formula doesn't need one (denominator is system-wide
 * TVL, numerator is system-wide payouts).
 *
 * Empty events / indexer unavailable → 0%. Honest: nothing's been paid out
 * (or we can't see it), so the projection is zero. Better than a guess.
 */
export const votingAprQuery = (
  rpc: TProviderContext,
  indexerSdk: IndexerSdk,
  windowDays: number = DEFAULT_WINDOW_DAYS,
) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "voting", QUERY_KEY_VERSION, windowDays],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const headBlock = Number(
        await rpc.papi.query.System.Number.getValue({ at: "best" }),
      )
      const windowBlocks = windowDays * BLOCKS_PER_DAY
      const t0Block = Math.max(1, headBlock - windowBlocks)
      const actualWindowDays = Math.max(
        1,
        (headBlock - t0Block) / BLOCKS_PER_DAY,
      )

      // TVL denominator — same as base APR. `TotalLocked + gigapot.free` is
      // the runtime's `total_staked_hdx()` (HDX backing all GIGAHDX).
      const [tlNowRaw, gpNowAcct] = await Promise.all([
        unsafeApi.query.GigaHdx.TotalLocked.getValue({ at: "best" }).catch(
          () => 0n,
        ),
        rpc.papi.query.System.Account.getValue(STAKE_GIGAPOT_ADDRESS, {
          at: "best",
        }),
      ])
      const totalStake =
        BigInt(tlNowRaw ?? 0n) + BigInt(gpNowAcct?.data?.free ?? 0n)
      if (totalStake === 0n) return Big(0)

      // Pull all UserRewardRecorded events in the window from the indexer.
      // Hydration's Subsquid-style indexer indexes events generically by
      // name (same path classic staking uses for AccumulatedRpsUpdated).
      let userRewardEvents: ReadonlyArray<{
        block: { height: number }
        args?: unknown
      }>
      try {
        const result = await indexerSdk.UserRewardRecordedEvents({
          sinceBlock: t0Block,
        })
        userRewardEvents = result.events
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[gigaApr.voting] indexer FETCH FAILED", e)
        return Big(0)
      }

      // Defensive field reader — event args may use camelCase or snake_case
      // depending on the indexer's decoder.
      const readField = (obj: unknown, ...names: string[]): unknown => {
        if (obj === null || obj === undefined || typeof obj !== "object")
          return undefined
        for (const n of names) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const v = (obj as any)[n]
          if (v !== undefined) return v
        }
        return undefined
      }
      const toBig = (v: unknown): bigint => {
        if (v === undefined || v === null) return 0n
        if (typeof v === "bigint") return v
        if (typeof v === "number") return BigInt(v)
        if (typeof v === "string") return BigInt(v)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return BigInt((v as any).toString())
      }

      let totalPaidToVoters = 0n
      for (const event of userRewardEvents) {
        const amount = toBig(
          readField(event.args, "rewardAmount", "reward_amount"),
        )
        totalPaidToVoters += amount
      }

      // eslint-disable-next-line no-console
      console.debug("[gigaApr.voting] event-based result", {
        eventCount: userRewardEvents.length,
        totalPaidToVoters: totalPaidToVoters.toString(),
        totalStake: totalStake.toString(),
        actualWindowDays,
      })

      return Big(totalPaidToVoters.toString())
        .div(totalStake.toString())
        .times(365)
        .div(actualWindowDays)
        .times(100)
    },
  })

// ---------------------------------------------------------------------------
// Combined hook
// ---------------------------------------------------------------------------

/**
 * Combined GIGAHDX APR hook. Both APRs are fleet-level (same for everyone)
 * because both measure realised system-wide flow:
 *   - passive: gigapot inflow over window / TVL
 *   - voting:  voter rewards paid over window / TVL
 *
 * The legacy `stakeValueHdxPlanck` parameter is preserved for backwards
 * compatibility with existing call sites but is no longer used — both
 * components are now intrinsically fleet projections (matching the
 * realised-flow semantic of classic staking's APR).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useGigaApr = (_stakeValueHdxPlanck: bigint = 0n) => {
  const rpc = useRpcProvider()
  const indexerSdk = useIndexerClient()

  const passiveQuery = useQuery(passiveAprQuery(rpc))
  const votingQueryResult = useQuery(votingAprQuery(rpc, indexerSdk))

  const passive = passiveQuery.data ?? Big(0)
  const voting = votingQueryResult.data ?? Big(0)
  const total = passive.plus(voting)
  const isLoading = passiveQuery.isLoading || votingQueryResult.isLoading

  return { passive, voting, total, isLoading }
}
