import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToSeconds } from "date-fns"
import { daysInYear, secondsInDay } from "date-fns/constants"

import { bestNumberQuery } from "@/api/chain"
import {
  getRewardTrackPercentage,
  gigapotBalanceQuery,
  gigaTotalLockedQuery,
  REWARD_ACCUMULATOR_POT_ADDRESS,
  STAKE_GIGAPOT_ADDRESS,
} from "@/api/gigaStake"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

// Both camelCase and snake_case shapes are declared because polkadot-api's
// `unsafeApi` decoder returns the runtime's snake_case field names on this
// build, while typed metadata in other contexts can yield camelCase. The
// query reads with `value.totalReward ?? value.total_reward` etc. to handle
// either shape — TS needs both keys declared as optional.
type PalletGigahdxRewardsReferendaReward = {
  keyArgs: [number]
  value: {
    totalReward?: bigint
    total_reward?: bigint
    remainingReward?: bigint
    remaining_reward?: bigint
    totalWeightedVotes?: bigint
    total_weighted_votes?: bigint
    trackId?: number
    track_id?: number
    votersRemaining?: number
    voters_remaining?: number
  }
}

type PalletGigahdxRewardsReferendumLiveTally = {
  keyArgs: [number]
  value: {
    totalWeighted?: bigint
    total_weighted?: bigint
    votersCount?: number
    voters_count?: number
  }
}

type PalletGigahdxRewardsReferendumTracks = {
  keyArgs: [number]
  value: number
}
/**
 * GIGAHDX APR (annual percentage return).
 *
 *   totalAPR = baseAPR + votingAPR
 *
 * - `baseAPR`  — backward-looking: annualised gigapot inflow over a 60-day
 *   window (clamped to chain age). Position-size-independent — same value
 *   for every GIGAHDX holder.
 *
 * - `votingAPR` — forward-looking: per-stake-unit share of pools across all
 *   ongoing rewardable refs at max conviction, averaged per-ref, scaled by
 *   an assumed annual cadence (`REFS_PER_YEAR = 75`). Personalised by the
 *   caller-supplied `stakeValueHdxPlanck`; degrades cleanly at
 *   `stakeValue = 0` to the marginal-voter limit ("what 1 wei of additional
 *   stake would earn").
 *
 * Both components read entirely from chain storage at head — no indexer
 * dependency.
 */

const getBlocksPerDay = (blockSeconds: number) => {
  return Math.floor(secondsInDay / blockSeconds)
}

/** Locked6x conviction multiplier / REWARD_MULTIPLIER_SCALE = 800/100. */
const LOCKED_6X_MULTIPLIER = 8n
const DEFAULT_WINDOW_DAYS = 60

const APR_QUERY_OPTS = {
  staleTime: Infinity,
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
}

/**
 * Minimum aggregate `weighted` (Σ staked × conviction_mult / scale, in HDX
 * planck) required for a referendum's pool to contribute to the voting APR
 * projection.
 *
 * Why: at `stakeValue = 0` the formula `Σ pool × 8 / weighted` represents
 * the marginal limit "what would 1 wei of stake earn." If a ref has only a
 * dust vote (e.g. 10 HDX-units), a new voter at max conviction grabs nearly
 * the whole pool → astronomical fleet APR. That's mathematically correct
 * but misleading as a dashboard projection.
 *
 * 100 HDX-weighted-units (= 100 HDX at Locked3x, or 12.5 HDX at Locked6x,
 * or 400 HDX at Locked1x) is a low bar for a serious vote — on mainnet
 * this filter will almost never trigger; on testnet it filters bootstrap
 * dust-votes that would otherwise blow up the headline number.
 */
const MIN_REAL_VOTE_WEIGHTED = 100n * 10n ** 12n

/**
 * Assumed annual referendum throughput used by `votingAprQuery` to project
 * an annualised APR from the current snapshot of ongoing rewardable refs.
 *
 * Sourced from mainnet history: 35 completed refs in the trailing 60-day
 * window ≈ 213/yr face-value. Discount heavily for sparse periods and for
 * refs without rewardable tracks → ~75/yr is a defensible "expected"
 * cadence. APR scales linearly with this constant — wrong by 2× means
 * displayed APR is wrong by 2×, but relative ordering between users and
 * across time is preserved. Tune from telemetry once realised data is
 * available via an indexer.
 */
const REFS_PER_YEAR = 75

export const passiveAprQuery = (
  rpc: TProviderContext,
  windowDays: number = DEFAULT_WINDOW_DAYS,
) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "passive", windowDays],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      const blocksPerDay = getBlocksPerDay(
        millisecondsToSeconds(rpc.slotDurationMs),
      )

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const parachainBlockNumber = bestNumber.parachainBlockNumber

      const windowBlocks = windowDays * blocksPerDay
      const t0Block = Math.max(1, parachainBlockNumber - windowBlocks)

      const t0HashStr: string = await rpc.papiClient._request(
        "chain_getBlockHash",
        [t0Block],
      )

      const [tlNowRaw, gpNowAcct, gpT0Acct] = await Promise.all([
        rpc.queryClient.ensureQueryData(gigaTotalLockedQuery(rpc)),
        rpc.queryClient.ensureQueryData(gigapotBalanceQuery(rpc)),
        rpc.papi.query.System.Account.getValue(STAKE_GIGAPOT_ADDRESS, {
          at: t0HashStr,
        }).catch(() => undefined),
      ])

      const tlNow = tlNowRaw ?? 0n
      const gpNow = gpNowAcct ?? 0n
      const gpT0 = gpT0Acct?.data?.free ?? 0n

      const totalStake = tlNow + gpNow
      if (totalStake === 0n) return Big(0)

      // Cap negative deltas at 0 — pot can only shrink via privileged ops or
      // yield-paying user flows (already-earned HDX leaving the pot); neither
      // represents anti-yield.
      const dgp = gpNow > gpT0 ? gpNow - gpT0 : 0n
      const actualWindowBlocks = parachainBlockNumber - t0Block
      const actualWindowDays = Math.max(1, actualWindowBlocks / blocksPerDay)

      return Big(dgp.toString())
        .div(totalStake.toString())
        .times(daysInYear)
        .div(actualWindowDays)
        .times(100)
    },
  })

// ---------------------------------------------------------------------------
// Voting APR (active — referendum reward shares)
// ---------------------------------------------------------------------------

/**
 * Voting APR — forward-looking projection of referendum reward pools at
 * max conviction (Locked6x = 8×).
 *
 *   votingAPR  =  (Σ_ongoing 8 × pool_r / (weighted_r + 8 × stakeValue))
 *                 × (REFS_PER_YEAR / num_counted_refs)
 *                 × 100
 *
 * **Mental model.** `Σ 8R/(W+8S)` is the per-stake-unit share the caller
 * would earn if all currently-ongoing rewardable refs paid out today. We
 * normalise that by `num_counted_refs` to get the per-ref average share,
 * then scale by an assumed yearly ref cadence (`REFS_PER_YEAR`) to project
 * an annual return. This treats the current snapshot as a representative
 * cross-section, not as historic earnings to annualise.
 *
 * `REFS_PER_YEAR` is a tunable constant — seeded from mainnet history
 * (35 refs in trailing 60 days ≈ 213/yr theoretical; discounted for sparse
 * weeks and non-rewardable tracks → 75 as a defensible expected cadence).
 * The APR scales linearly with this constant; calibrate from telemetry
 * once realised data is available via an indexer.
 *
 * Per-referendum pool sourcing (mirrors `claimableVotingRewardsQuery` and
 * the `gigahdx-voting-rewards-estimate.mjs` test script):
 *   - Allocated:    `ReferendaRewardPool[ref].total_reward` (exact)
 *   - Pre-alloc:    `accumulator_pot × track_pct[track_id] / 100` (estimate)
 *
 * Pre-alloc refs only count when someone has already voted — we need a
 * `ReferendaTotalWeightedVotes` entry to know the dilution and a
 * `ReferendumTracks` cache hit to know the track. Refs no-one has voted on
 * yet contribute nothing (denominator would be 0 for the fleet case anyway).
 *
 * Behaviour at stakeValue = 0: denominator collapses to `weighted_r`, giving
 * the marginal-voter "per-stake-unit" projection — the natural answer for
 * users without a position considering whether to stake.
 *
 * On long-lived chains, refs whose entries have been deleted after the last
 * voter claimed will be silently excluded — fixing that needs an indexer.
 * Until then this slightly under-estimates on mature mainnet.
 *
 * NOTE: `stakeValue` is in HDX planck (the locked HDX backing the user's
 * position). For a connected user with a position, pass `gigahdx × rate` so
 * the projection accounts for their accrued yield (assuming `realizeYield`
 * is called before voting). For a new staker previewing, pass their
 * intended deposit.
 */
export const votingAprQuery = (
  rpc: TProviderContext,
  stakeValueHdxPlanck: bigint,
) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "voting", stakeValueHdxPlanck.toString()],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [allocatedEntries, liveEntries, cachedTrackEntries, rewardPotAcct] =
        await Promise.all([
          unsafeApi.query.GigaHdxRewards.ReferendaRewardPool.getEntries({
            at: "best",
          }) as PalletGigahdxRewardsReferendaReward[],
          unsafeApi.query.GigaHdxRewards.ReferendaTotalWeightedVotes.getEntries(
            {
              at: "best",
            },
          ) as PalletGigahdxRewardsReferendumLiveTally[],
          unsafeApi.query.GigaHdxRewards.ReferendumTracks.getEntries({
            at: "best",
          }) as PalletGigahdxRewardsReferendumTracks[],
          rpc.sdk.client.balance.getSystemBalance(
            REWARD_ACCUMULATOR_POT_ADDRESS,
          ),
        ])

      // Index pre-fetched data by ref id.
      //
      // `unsafeApi` decodes runtime structs with snake_case field names
      // (matching the Rust definitions). Some metadata builds expose them
      // as camelCase too. Probe both shapes so we read the right field
      // regardless of which form the binding returns — same defensive
      // pattern `claimableVotingRewardsQuery` already uses in gigaStake.ts.
      // Without this fallback, all reads return undefined, the query
      // throws on `weighted.toString()` further down, react-query
      // catches it, and the consumer falls back to `Big(0)` → UI shows 0%.
      const allocated = new Map<
        number,
        { totalReward: bigint; totalWeightedVotes: bigint }
      >()
      for (const { keyArgs, value } of allocatedEntries) {
        allocated.set(keyArgs[0], {
          totalReward: value.totalReward ?? value.total_reward ?? 0n,
          totalWeightedVotes:
            value.totalWeightedVotes ?? value.total_weighted_votes ?? 0n,
        })
      }
      const live = new Map<number, bigint>()
      for (const { keyArgs, value } of liveEntries) {
        live.set(keyArgs[0], value.totalWeighted ?? value.total_weighted ?? 0n)
      }
      const cachedTracks = new Map<number, number>()
      for (const { keyArgs, value } of cachedTrackEntries) {
        cachedTracks.set(keyArgs[0], value)
      }

      const potFree = rewardPotAcct.free

      const myWeighted = stakeValueHdxPlanck * LOCKED_6X_MULTIPLIER
      const myWeightedBig = Big(myWeighted.toString())
      const multBig = Big(LOCKED_6X_MULTIPLIER.toString())

      // Iterate the union of refs that have any pool we can size — either
      // an exact allocation or a live tally we can estimate against.
      const refIds = new Set<number>([...allocated.keys(), ...live.keys()])

      let sumPerStakeUnit = Big(0)
      let countedRefs = 0
      const perRefContrib: Array<{
        refId: number
        pool: string
        weighted: string
        contrib: string
        source: string
      }> = []
      for (const refId of refIds) {
        const alloc = allocated.get(refId)
        let pool: bigint
        let weighted: bigint
        if (alloc) {
          pool = alloc.totalReward
          weighted = alloc.totalWeightedVotes
        } else {
          // Pre-allocation: pool sized at today's pot × track percentage.
          // Track id must be known — populated in `ReferendumTracks` on the
          // first vote (`on_before_vote` runtime hook). If we somehow have a
          // tally without a cached track, skip the ref.
          const trackId = cachedTracks.get(refId)
          if (trackId === undefined) continue
          const pct = getRewardTrackPercentage(trackId)
          pool = (potFree * BigInt(pct)) / 100n
          weighted = live.get(refId) ?? 0n
        }
        // Sanity filter: refs whose existing voters total a dust amount
        // produce wildly inflated marginal-stake projections at the fleet
        // (stakeValue = 0) limit. See `MIN_REAL_VOTE_WEIGHTED` doc-comment.
        if (weighted < MIN_REAL_VOTE_WEIGHTED) {
          perRefContrib.push({
            refId,
            pool: pool.toString(),
            weighted: weighted.toString(),
            contrib: "0",
            source: alloc ? "alloc-filtered" : "estimate-filtered",
          })
          continue
        }
        const denom = Big(weighted.toString()).plus(myWeightedBig)
        if (denom.lte(0)) {
          perRefContrib.push({
            refId,
            pool: pool.toString(),
            weighted: weighted.toString(),
            contrib: "0",
            source: alloc ? "alloc-zero-denom" : "estimate-zero-denom",
          })
          continue
        }
        const c = Big(pool.toString()).times(multBig).div(denom)
        sumPerStakeUnit = sumPerStakeUnit.plus(c)
        countedRefs += 1
        perRefContrib.push({
          refId,
          pool: pool.toString(),
          weighted: weighted.toString(),
          contrib: c.toFixed(6),
          source: alloc ? "alloc" : "estimate",
        })
      }

      // No refs contributed → no meaningful projection. Return 0% rather
      // than dividing by zero. Caller already falls back to Big(0) when
      // data is undefined; this is the well-defined "nothing to project"
      // path.
      if (countedRefs === 0) return Big(0)

      // Project forward: treat the current snapshot as a representative
      // cross-section, average per ref, scale by assumed annual cadence.
      return sumPerStakeUnit.div(countedRefs).times(REFS_PER_YEAR).times(100)
    },
  })

// ---------------------------------------------------------------------------
// Combined hook
// ---------------------------------------------------------------------------

/**
 * Combined GIGAHDX APR hook.
 *
 * - `stakeValueHdxPlanck = 0n` → fleet APR (the default for the dashboard
 *   header — what 1 HDX of stake would earn at max conviction).
 * - `stakeValueHdxPlanck > 0` → personalised APR (the user's actual stake
 *   diluted into the per-ref reward pools).
 */
export const useGigaApr = (stakeValueHdxPlanck: bigint = 0n) => {
  const rpc = useRpcProvider()

  const passiveQuery = useQuery(passiveAprQuery(rpc))
  const votingQueryResult = useQuery(votingAprQuery(rpc, stakeValueHdxPlanck))

  const passive = passiveQuery.data ?? Big(0)
  const voting = votingQueryResult.data ?? Big(0)
  const total = passive.plus(voting)
  const isLoading = passiveQuery.isLoading || votingQueryResult.isLoading

  return { passive, voting, total, isLoading }
}
