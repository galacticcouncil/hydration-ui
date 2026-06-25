import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToSeconds } from "date-fns"
import { daysInYear, secondsInDay } from "date-fns/constants"

import { bestNumberQuery } from "@/api/chain"
import {
  accumulatorPotBalanceQuery,
  getRewardTrackPercentage,
  gigapotBalanceQuery,
  gigaTotalLockedQuery,
  referendaRewardPoolQuery,
  referendaTotalWeightedVotesQuery,
  referendumTracksQuery,
  STAKE_GIGAPOT_ADDRESS,
} from "@/api/gigaStake"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

/**
 * GIGAHDX APR (annual percentage return).
 *
 *   totalAPR = baseAPR + votingAPR
 *
 * Both components are backward-looking over a sliding window (default 60d,
 * capped at chain age). Both work whether the user has a position or not:
 * baseAPR is position-size-independent (rate is universal across all
 * GIGAHDX holders), votingAPR degrades cleanly at stakeValue = 0 to a fleet
 * estimate ("what 1 unit of stake would have earned at max conviction over
 * the window").
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
 * Block at which the GIGAHDX launch proposal was enacted — i.e. the block where
 * `gigaHdx.GigaHdxPoolContract` was first set. That happens in the same atomic
 * batch that sweeps the gigapot to ~0, so it's the exact point after which the
 * gigapot balance reflects only post-launch yield.
 *
 * Used to anchor the passive-APR window: without it the trailing lookback
 * reaches back to the pre-launch gigapot balance, the launch sweep makes the
 * windowed delta negative, and the cap-at-0 then shows a misleading 0% APR for
 * the first ~windowDays of the market's life.
 *
 * The search is bounded to the last `DEFAULT_WINDOW_DAYS` of blocks — the only
 * regime where the anchor matters (once launch is older than the window, the
 * plain trailing window is already post-launch). That also keeps every read on
 * recent, un-pruned state. Returns `null` (→ no anchoring) when not launched,
 * launched longer ago than the window, or historical state can't be read.
 * Cached forever: the answer never changes once launched.
 */
export const gigaLaunchBlockQuery = (rpc: TProviderContext) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "launchBlock"],
    enabled: rpc.isApiLoaded,
    queryFn: async (): Promise<number | null> => {
      // GigaHdx pallet storage isn't in the typed descriptors — use the unsafe
      // API, same as gigaStake.ts (Stakes / TotalLocked / PendingUnstakes).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any
      const isSetAt = async (block: number) => {
        const hash: string = await rpc.papiClient._request(
          "chain_getBlockHash",
          [block],
        )
        const v = await unsafeApi.query.GigaHdx.GigaHdxPoolContract.getValue({
          at: hash,
        })
        return v != null
      }
      try {
        const blocksPerDay = getBlocksPerDay(
          millisecondsToSeconds(rpc.slotDurationMs),
        )
        const head = (await rpc.queryClient.ensureQueryData(bestNumberQuery(rpc)))
          .parachainBlockNumber
        const lowerBound = Math.max(1, head - DEFAULT_WINDOW_DAYS * blocksPerDay)

        // Not set at head → launch hasn't happened; nothing to anchor to.
        if (!(await isSetAt(head))) return null
        // Already set a full window ago → launch predates the window; the plain
        // trailing window is already post-launch, so no anchoring is needed.
        if (await isSetAt(lowerBound)) return null

        // Launch is within (lowerBound, head] — binary-search the first set block.
        let lo = lowerBound
        let hi = head
        while (lo < hi) {
          const mid = Math.floor((lo + hi) / 2)
          if (await isSetAt(mid)) hi = mid
          else lo = mid + 1
        }
        return lo
      } catch {
        return null
      }
    },
  })

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

      // Anchor the trailing window to the launch block so the baseline can never
      // predate the launch sweep (which would otherwise show 0% for ~windowDays).
      const launchBlock =
        (await rpc.queryClient.ensureQueryData(gigaLaunchBlockQuery(rpc))) ?? 1
      const windowBlocks = windowDays * blocksPerDay
      const t0Block = Math.max(
        1,
        launchBlock,
        parachainBlockNumber - windowBlocks,
      )

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
const REFS_PER_YEAR = 75

/**
 * Voting APR — annualised share of referendum reward pools at max
 * conviction (Locked6x = 8×).
 *
 *   votingAPR = Σ [ 8 × pool_r / (weighted_r + 8 × stakeValue) ]
 *               × (365 / windowDays) × 100
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
 * the fleet-level "per-stake-unit" projection — the natural answer for
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
      const [allocatedEntries, liveEntries, rewardPotAcct] = await Promise.all([
        rpc.queryClient.ensureQueryData(referendaRewardPoolQuery(rpc)),
        rpc.queryClient.ensureQueryData(referendaTotalWeightedVotesQuery(rpc)),
        rpc.queryClient.fetchQuery(accumulatorPotBalanceQuery(rpc)),
      ])

      const potFree = rewardPotAcct.free

      const myWeighted = stakeValueHdxPlanck * LOCKED_6X_MULTIPLIER
      const myWeightedBig = Big(myWeighted.toString())
      const multBig = Big(LOCKED_6X_MULTIPLIER.toString())

      // Iterate the union of refs that have any pool we can size — either
      // an exact allocation or a live tally we can estimate against.
      const refIds = new Set<number>([
        ...allocatedEntries.keys(),
        ...liveEntries.keys(),
      ])

      const promises = Array.from(refIds).map(async (refId) => {
        let pool: bigint
        let weighted: bigint

        const alloc = allocatedEntries.get(refId)

        if (alloc) {
          pool = alloc.total_reward
          weighted = alloc.total_weighted_votes
        } else {
          const trackId = await rpc.queryClient.ensureQueryData(
            referendumTracksQuery(rpc, refId),
          )
          if (trackId === null) return { contrib: Big(0), countedRefs: false }
          const pct = getRewardTrackPercentage(trackId)
          pool = (potFree * BigInt(pct)) / 100n
          weighted = liveEntries.get(refId)?.total_weighted ?? 0n
        }

        if (weighted < MIN_REAL_VOTE_WEIGHTED) {
          return { contrib: Big(0), countedRefs: false }
        }

        const denom = Big(weighted.toString()).plus(myWeightedBig)
        if (denom.lte(0)) {
          return { contrib: Big(0), countedRefs: false }
        }

        return {
          contrib: Big(pool.toString()).times(multBig).div(denom),
          countedRefs: true,
        }
      })

      const promisesRes = await Promise.all(promises)

      const { countedRefs, sumPerStakeUnit } = promisesRes.reduce(
        (acc, curr) => {
          if (curr.countedRefs) {
            acc.countedRefs += 1
            acc.sumPerStakeUnit = acc.sumPerStakeUnit.plus(curr.contrib)
          }
          return acc
        },
        { countedRefs: 0, sumPerStakeUnit: Big(0) },
      )

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
