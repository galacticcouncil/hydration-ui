import {
  GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX,
  GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX,
  GIGAHDX_LAUNCH_BLOCK,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToSeconds } from "date-fns"
import { daysInYear, secondsInDay } from "date-fns/constants"

import { bestNumberQuery } from "@/api/chain"
import {
  gigapotBalanceQuery,
  gigaTotalLockedQuery,
  referendaRewardPoolQuery,
  referendaTotalWeightedVotesQuery,
  REWARD_ACCUMULATOR_POT_ADDRESS,
  STAKE_GIGAPOT_ADDRESS,
} from "@/api/gigaStake"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

/**
 * GIGAHDX APR (annual percentage return).
 *
 *   totalAPR = baseAPR + votingAPR
 *
 * baseAPR — combines a governance-guaranteed floor (ref 358 scheduler,
 * `GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX / totalStake`) with a measured
 * rate-delta signal that captures every inflow source (scheduler AND fees)
 * once the pallet is old enough for the window to be meaningful. Position-
 * size-independent. See `passiveAprQuery` doc for the full spec.
 *
 * votingAPR — share of referendum reward pools at max conviction, anchored
 * to the measured payout flow out of the reward accumulator over a trailing
 * window. Degrades cleanly at stakeValue = 0 to a fleet estimate.
 */

const getBlocksPerDay = (blockSeconds: number) => {
  return Math.floor(secondsInDay / blockSeconds)
}

/** Locked6x conviction multiplier / REWARD_MULTIPLIER_SCALE = 800/100. */
const LOCKED_6X_MULTIPLIER = 8n
const DEFAULT_WINDOW_DAYS = 28

/**
 * Pallet age (days since `GIGAHDX_LAUNCH_BLOCK`) required before the measured
 * signals are considered stable enough to display. Below this, both
 * `passiveAprQuery` and `votingAprQuery` return their governance-guaranteed
 * floors alone — 1-2d of measured data annualises to wildly noisy
 * launch-burst numbers.
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
const ANNUAL_HDX_TO_VOTING_POT_PLANCK =
  BigInt(GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX) * 10n ** 12n

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
        rpc.papi.query.GigaHdx.TotalLocked.getValue({ at: t0HashStr }).catch(
          () => null,
        ),
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

/** Trailing window (days) over which reward-pool payouts are measured for
 * the voting APR. Clamped to pallet age while the pallet is younger. 60d
 * smooths the lumpy per-referendum allocation cadence (~0.5 allocations/day
 * as of Aug 2026). */
const PAIDOUT_WINDOW_DAYS = 60

/**
 * Fallback for the "typical total weighted votes per referendum" denominator,
 * used when the live sample is empty — every allocated pool fully claimed AND
 * no ongoing ref with votes. This happens regularly (e.g. 2026-08-11 ~12:00
 * UTC when the last claimants of refs 371/377–381 wiped the sample); without
 * the fallback the display collapses to the guaranteed floor between refs.
 *
 * Calibration: median `total_weighted_votes` across all 23 allocations since
 * launch (refs 359–381, `RewardPoolAllocated` events, read 2026-08-12) =
 * 2.15B HDX-weighted. Participation drifts slowly; recalibrate
 * opportunistically by replaying `RewardPoolAllocated` events (each
 * accumulator balance drop marks one).
 */
const FALLBACK_MEDIAN_WEIGHTED = 2_150_000_000n * 10n ** 12n

/** Milliseconds per year, for annualising the measured payout window. */
const YEAR_MS = daysInYear * secondsInDay * 1000

/**
 * Voting APR — annualised share of referendum reward pools at max
 * conviction (Locked6x = 8×). Displays `max(guaranteed, measured)`.
 *
 *   measured = 8 × paidOutPerYear / (medianWeighted + 8 × stakeValue) × 100
 *
 * Derivation: `paidOutPerYear` HDX is distributed pro-rata to weighted votes;
 * a voter with stake S at Locked6x holds `8 × S` weight against
 * `medianWeighted` others, earning `paidOutPerYear × 8S / (W + 8S)` — divide
 * by S for the rate; S cancels at `stakeValue = 0` (fleet-level projection).
 * Referendum cadence deliberately does NOT appear: pool-size × refs-per-year
 * cancels out (annual flow is what it is regardless of how many refs split
 * it), and both of those inputs proved volatile — the accumulator saw-tooths
 * with claim timing.
 *
 * `paidOutPerYear` is MEASURED, not modelled: HDX that actually left the
 * `gigarwd!` accumulator into per-referendum reward pools over the trailing
 * `PAIDOUT_WINDOW_DAYS` (clamped to pallet age):
 *
 *   scheduled(window) = ANNUAL_HDX_TO_VOTING_POT × elapsed / year
 *   paidOut(window)   = scheduled(window) − Δaccumulator  (clamped ≥ 0)
 *
 * Cost: two archive balance reads + two timestamp reads. `elapsed` comes
 * from block timestamps, never `blocks × assumed-block-time` — block time
 * drifts. Conservative by construction: the accumulator also receives a
 * variable trading-fee stream (~40K HDX/day average since launch) that this
 * estimate ignores, so `measured` is a lower bound of real payouts (as of
 * 2026-08-12: ~10% displayed vs ~16% exact from `RewardPoolAllocated`
 * events). Exact measurement wants a runtime `TotalAllocated` counter.
 *
 * `medianWeighted` — typical competition per referendum — comes from the
 * live sample (allocated pools awaiting claims + ongoing tallies) when
 * non-empty, else `FALLBACK_MEDIAN_WEIGHTED`.
 *
 * Returns the guaranteed floor alone while the pallet is younger than
 * `MEASURED_MIN_AGE_DAYS` or when a historical read fails (pruned RPC).
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
      const blocksPerDay = getBlocksPerDay(
        millisecondsToSeconds(rpc.slotDurationMs),
      )
      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const head = bestNumber.parachainBlockNumber

      const [allocatedEntries, liveEntries, tlNow, gpNow] = await Promise.all([
        rpc.queryClient.ensureQueryData(referendaRewardPoolQuery(rpc)),
        rpc.queryClient.ensureQueryData(referendaTotalWeightedVotesQuery(rpc)),
        rpc.queryClient.ensureQueryData(gigaTotalLockedQuery(rpc)),
        rpc.queryClient.ensureQueryData(gigapotBalanceQuery(rpc)),
      ])

      // Governance-guaranteed voting-APR floor: 54M HDX/yr from ref 358
      // divided by live `totalStake`. Worst-case by construction — nominal
      // budget with 100% of stake voting at max conviction.
      const totalStake = (tlNow ?? 0n) + (gpNow ?? 0n)
      const guaranteed =
        totalStake === 0n
          ? Big(0)
          : Big(ANNUAL_HDX_TO_VOTING_POT_PLANCK.toString())
              .div(totalStake.toString())
              .times(100)

      // Pallet too young → the measured window is launch-burst noise.
      const palletAgeDays = (head - GIGAHDX_LAUNCH_BLOCK) / blocksPerDay
      if (palletAgeDays < MEASURED_MIN_AGE_DAYS) return guaranteed

      // --- paidOutPerYear: measured payout flow over the trailing window ---
      const t0Block = Math.max(
        GIGAHDX_LAUNCH_BLOCK,
        head - PAIDOUT_WINDOW_DAYS * blocksPerDay,
      )
      const t0HashStr: string = await rpc.papiClient._request(
        "chain_getBlockHash",
        [t0Block],
      )
      const [accNow, accT0, tsT0, tsNow] = await Promise.all([
        rpc.papi.query.System.Account.getValue(REWARD_ACCUMULATOR_POT_ADDRESS, {
          at: "best",
        }).catch(() => null),
        rpc.papi.query.System.Account.getValue(REWARD_ACCUMULATOR_POT_ADDRESS, {
          at: t0HashStr,
        }).catch(() => null),
        rpc.papi.query.Timestamp.Now.getValue({ at: t0HashStr }).catch(
          () => null,
        ),
        rpc.papi.query.Timestamp.Now.getValue({ at: "best" }).catch(() => null),
      ])
      // Any missing read (pruned RPC) → no measurement, floor only.
      if (!accNow || !accT0 || tsT0 === null || tsNow === null)
        return guaranteed
      const elapsedMs = Number(tsNow - tsT0)
      if (elapsedMs <= 0) return guaranteed

      const accDelta = accNow.data.free - accT0.data.free
      const scheduledInWindow =
        (ANNUAL_HDX_TO_VOTING_POT_PLANCK * BigInt(elapsedMs)) / BigInt(YEAR_MS)
      const paidOutInWindow =
        scheduledInWindow > accDelta ? scheduledInWindow - accDelta : 0n
      const paidOutPerYear =
        (paidOutInWindow * BigInt(YEAR_MS)) / BigInt(elapsedMs)

      // --- medianWeighted: typical competition per referendum ---
      // Live sample: allocated pools awaiting claims + ongoing pre-alloc
      // tallies, dust filtered. Empty between refs → calibrated fallback.
      const weightedSample = [
        ...Array.from(
          allocatedEntries.values(),
          (alloc) => alloc.total_weighted_votes,
        ),
        ...Array.from(liveEntries.entries())
          .filter(([refId]) => !allocatedEntries.has(refId))
          .map(([, tally]) => tally.total_weighted),
      ].filter((weighted) => weighted >= MIN_REAL_VOTE_WEIGHTED)

      const sortedWeighted = weightedSample.sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0,
      )
      const medianWeighted =
        sortedWeighted[Math.floor(sortedWeighted.length / 2)] ??
        FALLBACK_MEDIAN_WEIGHTED

      const denom = Big(medianWeighted.toString()).plus(
        (stakeValueHdxPlanck * LOCKED_6X_MULTIPLIER).toString(),
      )
      const measured = denom.lte(0)
        ? Big(0)
        : Big(paidOutPerYear.toString())
            .times(LOCKED_6X_MULTIPLIER.toString())
            .div(denom)
            .times(100)

      return measured.gt(guaranteed) ? measured : guaranteed
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
