import {
  GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX,
  //GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX,
  GIGAHDX_LAUNCH_BLOCK,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
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
 * Both components are backward-looking over a sliding window (default 28d,
 * capped at chain age). Both work whether the user has a position or not:
 * baseAPR is position-size-independent (rate is universal across all
 * GIGAHDX holders), votingAPR degrades cleanly at stakeValue = 0 to a fleet
 * estimate ("what 1 unit of stake would have earned at max conviction over
 * the window").
 */

const getBlocksPerDay = (blockSeconds: number) => {
  return Math.floor(secondsInDay / blockSeconds)
}

/**
 * Pallet age (days since `GIGAHDX_LAUNCH_BLOCK`) required before the measured
 * rate-delta signal is considered stable enough to display. Below this,
 * `passiveAprQuery` returns the governance-guaranteed constant alone — 1-2d
 * of rate delta annualises to wildly noisy launch-burst numbers (30%+
 * headline for a signal that will settle around 10-13% within a week).
 */
const MEASURED_MIN_AGE_DAYS = 7

/** stHDX asset id as a `number` — matches how `Tokens.TotalIssuance` is keyed. */
const STHDX_ASSET_ID_NUM = Number(STHDX_ASSET_ID)

/**
 * Annual HDX committed via ref 358, in planck. Encodes the scheduler's
 * `4,109.59 HDX × 8,760 hours` cadence to `gigahdx!`. Divided by live
 * `totalStake` to give the governance-guaranteed base-APR floor.
 */
const ANNUAL_HDX_TO_BASE_POT_PLANCK =
  BigInt(GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX) * 10n ** 12n

/**
 * Annual HDX committed to the voting-rewards accumulator (`gigarwd!`) via
 * ref 358. Divided by live `totalStake` to give the voting-APR guaranteed
 * floor (mirrors `ANNUAL_HDX_TO_BASE_POT_PLANCK` for the base component).
 */
// const ANNUAL_HDX_TO_VOTING_POT_PLANCK =
//   BigInt(GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX) * 10n ** 12n

/** Locked6x conviction multiplier / REWARD_MULTIPLIER_SCALE = 800/100. */
const LOCKED_6X_MULTIPLIER = 8n
const DEFAULT_WINDOW_DAYS = 28

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
 * Base APR. Displays `max(guaranteed, measured)`.
 *
 *   guaranteed = `GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX / totalStake × 100`
 *                (ref-358 scheduler commitment ÷ live stake). Position-
 *                independent; strictly a function of the current stake pool.
 *
 *   measured   = `(rate_now / rate_t0 − 1) × 365 / windowDays × 100`
 *                where `rate = (TotalLocked + gigapot.free) / stHDX_supply`.
 *                Captures every inflow source (scheduler + fees) via the
 *                exchange-rate improvement between the two block hashes —
 *                immune to `realize_yield` drain (which moves `gp → TL`,
 *                leaving `TL + gp` unchanged). Only used once the pallet is
 *                ≥ `MEASURED_MIN_AGE_DAYS` old — below that the annualised
 *                signal is dominated by launch-burst noise.
 *
 * `t0` is `max(GIGAHDX_LAUNCH_BLOCK, head − windowDays)` — the window can't
 * predate the sweep-to-zero at enactment. Historical reads use `.at(hash)`
 * with `.catch(() => null)` to survive pruned RPCs; when a required historical
 * read is missing, `measured` reduces to `0` and the `max()` returns the
 * guaranteed floor.
 *
 * At ref 358's scheduled expiry (year 1 without renewal) `measured` will start
 * reflecting the drop in inflow — display naturally decays over the trailing
 * window instead of pretending the incentive continues.
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

      const [tlNowRaw, gpNow, supplyNow] = await Promise.all([
        rpc.queryClient.ensureQueryData(gigaTotalLockedQuery(rpc)),
        rpc.queryClient.ensureQueryData(gigapotBalanceQuery(rpc)),
        rpc.papi.query.Tokens.TotalIssuance.getValue(STHDX_ASSET_ID_NUM, {
          at: "best",
        }),
      ])
      const tlNow = tlNowRaw ?? 0n
      const supNow = supplyNow ?? 0n

      const totalStake = tlNow + gpNow
      if (totalStake === 0n) return Big(0)

      const guaranteed = Big(ANNUAL_HDX_TO_BASE_POT_PLANCK.toString())
        .div(totalStake.toString())
        .times(100)

      // Pallet too young → measured is noise, return the guaranteed floor.
      const palletAgeDays =
        (parachainBlockNumber - GIGAHDX_LAUNCH_BLOCK) / blocksPerDay
      if (palletAgeDays < MEASURED_MIN_AGE_DAYS) return guaranteed

      // Window = min(windowDays, palletAge). Anchored so t0 can never predate
      // the launch sweep (`gigapot = 0`, `stHDX supply = 0` → rate = 1 by
      // runtime clamp).
      const windowBlocks = windowDays * blocksPerDay
      const t0Block = Math.max(
        GIGAHDX_LAUNCH_BLOCK,
        parachainBlockNumber - windowBlocks,
      )
      const actualWindowDays = Math.max(
        1,
        (parachainBlockNumber - t0Block) / blocksPerDay,
      )

      const t0HashStr: string = await rpc.papiClient._request(
        "chain_getBlockHash",
        [t0Block],
      )
      const [tlT0Raw, gpT0Acct, supplyT0Raw] = await Promise.all([
        unsafeApi.query.GigaHdx.TotalLocked.getValue({ at: t0HashStr }).catch(
          () => null,
        ) as Promise<bigint | null>,
        rpc.papi.query.System.Account.getValue(STAKE_GIGAPOT_ADDRESS, {
          at: t0HashStr,
        }).catch(() => null),
        rpc.papi.query.Tokens.TotalIssuance.getValue(STHDX_ASSET_ID_NUM, {
          at: t0HashStr,
        }).catch(() => null),
      ])

      // rate = (TL + gp) / stHDX_supply, floored at 1 to match runtime clamp.
      // Any missing historical read → `measured` collapses to 0 and the
      // `max()` below returns the guaranteed floor.
      const tlT0 = tlT0Raw ?? 0n
      const gpT0 = gpT0Acct?.data?.free ?? 0n
      const supT0 = supplyT0Raw ?? 0n

      const rateNow =
        supNow === 0n
          ? Big(1)
          : Big.max(
              1,
              Big(tlNow.toString())
                .plus(gpNow.toString())
                .div(supNow.toString()),
            )
      const rateT0 =
        supT0 === 0n
          ? Big(1)
          : Big.max(
              1,
              Big(tlT0.toString()).plus(gpT0.toString()).div(supT0.toString()),
            )

      const measured = rateT0.eq(0)
        ? Big(0)
        : rateNow
            .div(rateT0)
            .minus(1)
            .times(daysInYear)
            .div(actualWindowDays)
            .times(100)

      return measured.gt(guaranteed) ? measured : guaranteed
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
