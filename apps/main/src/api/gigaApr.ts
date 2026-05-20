import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToSeconds } from "date-fns"

import { bestNumberQuery } from "@/api/chain"
import {
  getRewardTrackPercentage,
  REWARD_ACCUMULATOR_POT_ADDRESS,
  STAKE_GIGAPOT_ADDRESS,
} from "@/api/gigaStake"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

type PalletGigahdxRewardsReferendaReward = {
  keyArgs: [number]
  value: {
    totalReward: bigint
    remainingReward: bigint
    totalWeightedVotes: bigint
    trackId: number
    votersRemaining: number
  }
}

type PalletGigahdxRewardsReferendumLiveTally = {
  keyArgs: [number]
  value: {
    totalWeighted: bigint
    votersCount: number
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
 * Both components are backward-looking over a sliding window (default 60d,
 * capped at chain age). Both work whether the user has a position or not:
 * baseAPR is position-size-independent (rate is universal across all
 * GIGAHDX holders), votingAPR degrades cleanly at stakeValue = 0 to a fleet
 * estimate ("what 1 unit of stake would have earned at max conviction over
 * the window").
 */

const getBlocksPerDay = (blockSeconds: number) => {
  return Math.floor(86400 / blockSeconds)
}

/** Locked6x conviction multiplier / REWARD_MULTIPLIER_SCALE = 800/100. */
const LOCKED_6X_MULTIPLIER = 8n
const DEFAULT_WINDOW_DAYS = 60

/**
 * APR queries deliberately load **once per session** — backward-looking
 * windowed averages move slowly and a fleet-level number doesn't need to
 * react to individual blocks. Keeping these stable also prevents the
 * dashboard headline from flickering on every chain tick.
 *
 * Refresh path: a full page reload (or react-query `invalidateQueries`).
 *
 * `v2` in the queryKey is a deliberate cache-bust marker for the
 * Option-B / Option-A formula migration — any cached `0` from the previous
 * implementation gets discarded on first render under the new code.
 */
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
    queryKey: ["gigaApr", "passive", windowDays],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any
      const blocksPerDay = getBlocksPerDay(
        millisecondsToSeconds(rpc.slotDurationMs),
      )

      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const parachainBlockNumber = bestNumber.parachainBlockNumber

      const windowBlocks = windowDays * blocksPerDay
      const t0Block = Math.max(1, parachainBlockNumber - windowBlocks)
      const actualWindowBlocks = parachainBlockNumber - t0Block
      const actualWindowDays = Math.max(1, actualWindowBlocks / blocksPerDay)

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
// Voting APR (active — referendum reward shares)
// ---------------------------------------------------------------------------

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
  windowDays: number = DEFAULT_WINDOW_DAYS,
) =>
  queryOptions({
    ...APR_QUERY_OPTS,
    queryKey: ["gigaApr", "voting", stakeValueHdxPlanck.toString(), windowDays],
    enabled: rpc.isApiLoaded,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [
        allocatedEntries,
        liveEntries,
        cachedTrackEntries,
        rewardPotAcct,
        bestNumber,
      ] = await Promise.all([
        unsafeApi.query.GigaHdxRewards.ReferendaRewardPool.getEntries({
          at: "best",
        }) as PalletGigahdxRewardsReferendaReward[],
        unsafeApi.query.GigaHdxRewards.ReferendaTotalWeightedVotes.getEntries({
          at: "best",
        }) as PalletGigahdxRewardsReferendumLiveTally[],
        unsafeApi.query.GigaHdxRewards.ReferendumTracks.getEntries({
          at: "best",
        }) as PalletGigahdxRewardsReferendumTracks[],
        rpc.sdk.client.balance.getSystemBalance(REWARD_ACCUMULATOR_POT_ADDRESS),
        rpc.queryClient.ensureQueryData(bestNumberQuery(rpc)),
      ])

      const parachainBlockNumber = bestNumber.parachainBlockNumber

      // Index pre-fetched data by ref id.
      const allocated = new Map<
        number,
        { totalReward: bigint; totalWeightedVotes: bigint }
      >()
      for (const { keyArgs, value } of allocatedEntries) {
        allocated.set(keyArgs[0], {
          totalReward: value.totalReward,
          totalWeightedVotes: value.totalWeightedVotes,
        })
      }
      const live = new Map<number, bigint>()
      for (const { keyArgs, value } of liveEntries) {
        live.set(keyArgs[0], value.totalWeighted)
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
        perRefContrib.push({
          refId,
          pool: pool.toString(),
          weighted: weighted.toString(),
          contrib: c.toFixed(6),
          source: alloc ? "alloc" : "estimate",
        })
      }

      const blocksPerDay = getBlocksPerDay(
        millisecondsToSeconds(rpc.slotDurationMs),
      )

      const windowBlocks = windowDays * blocksPerDay
      const actualWindowBlocks = Math.min(
        windowBlocks,
        Math.max(1, parachainBlockNumber - 1),
      )
      const actualWindowDays = Math.max(1, actualWindowBlocks / blocksPerDay)

      return sumPerStakeUnit.times(365).div(actualWindowDays).times(100)
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
