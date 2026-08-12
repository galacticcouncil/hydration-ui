import {
  GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX,
  GIGAHDX_LAUNCH_BLOCK,
} from "@galacticcouncil/money-market/ui-config"
import { queryOptions } from "@tanstack/react-query"
import { millisecondsToSeconds } from "date-fns"
import { secondsInDay } from "date-fns/constants"

import { bestNumberQuery } from "@/api/chain"
import { REWARD_ACCUMULATOR_POT_ADDRESS } from "@/api/gigaStake"
import { TProviderContext } from "@/providers/rpcProvider"

/**
 * Exact GIGAHDX voting-reward allocation history, recovered from chain with
 * no indexer and no runtime support.
 *
 * How: the ONLY outflow from the `gigarwd!` accumulator is the per-referendum
 * allocation (`maybe_allocate_and_record` → alc pot); dust recycling and the
 * scheduler/fee streams only flow IN. So every balance DROP on the
 * accumulator marks exactly one allocation block, and `System.Events` at
 * that block carries `GigaHdxRewards.RewardPoolAllocated` with the exact
 * `total_reward` and `total_weighted_votes` — the two numbers state cleanup
 * later deletes.
 *
 * Scan: coarse balance samples (~6h apart) flag intervals whose net delta
 * falls below the scheduled-inflow floor → refine to ~1h buckets → binary
 * search each drop block → read its events. Blocks are immutable, so results
 * persist in localStorage forever; after the first scan only the range since
 * `lastScannedBlock` is ever touched again (~4 balance reads per absent day).
 *
 * Detection floor: a drop must exceed `dropMargin` (≈3 drip-ticks, derived
 * from the ref-358 schedule — see `detectionThresholds`) to be found. Every
 * pool observed on mainnet is ≥70K HDX; a missed dust pool biases the
 * measured APR down by well under 1%.
 */

export type TAllocationRecord = {
  block: number
  refIndex: number
  /** HDX planck, decimal string (JSON-safe). */
  totalReward: string
  /** HDX-weighted planck (Σ stake × conviction multiplier), decimal string. */
  totalWeightedVotes: string
}

type TAllocationCache = {
  version: 1
  lastScannedBlock: number
  allocations: TAllocationRecord[]
}

const CACHE_KEY = "hydration.gigahdx.allocations.v1"
const CACHE_VERSION = 1

/** Trailing window (days) the voting APR measures payouts over. The scanner
 * cold-starts one window back; incremental scans keep extending from
 * `lastScannedBlock`. */
export const PAIDOUT_WINDOW_DAYS = 60

/** ~6h of blocks — coarse sampling step. */
const COARSE_STEP_BLOCKS = 3600
/** ~1h of blocks — refinement step inside flagged coarse intervals. */
const FINE_STEP_BLOCKS = 600
/** Parallel RPC batch size for balance sampling. */
const RPC_BATCH = 40

const ANNUAL_VOTING_PLANCK =
  BigInt(GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX) * 10n ** 12n
const SECONDS_PER_YEAR = 365.25 * secondsInDay

/**
 * Detection thresholds, derived from the ref-358 schedule and the live slot
 * duration rather than hardcoded amounts — they keep working if the drip
 * size or block time changes.
 *
 * - `coarseFlagDelta`: a coarse interval receives ~`scheduled(step)` from
 *   the drip (fees only add); a net delta below HALF that means an outflow
 *   of at least `scheduled/2` (~18.5K HDX today) happened inside.
 * - `dropMargin`: bisection confirms a drop when the balance falls this far
 *   below the anchor — 3× the per-fine-step drip comfortably exceeds any
 *   intra-bucket inflow (one drip tick + typical fees) while staying far
 *   below every pool observed on mainnet (≥70K HDX).
 *
 * Pools smaller than these thresholds (2%-track refs against a nearly empty
 * accumulator) can slip through; the resulting APR bias is downward and
 * bounded by threshold × cadence — well under 1% today.
 */
const detectionThresholds = (blockSeconds: number) => {
  const scheduledPerBlock =
    Number(ANNUAL_VOTING_PLANCK) * (blockSeconds / SECONDS_PER_YEAR)
  const perCoarseStep = BigInt(
    Math.round(scheduledPerBlock * COARSE_STEP_BLOCKS),
  )
  const perFineStep = BigInt(Math.round(scheduledPerBlock * FINE_STEP_BLOCKS))
  return {
    coarseFlagDelta: perCoarseStep / 2n,
    dropMargin: perFineStep * 3n,
  }
}

const loadCache = (): TAllocationCache | null => {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TAllocationCache
    return parsed.version === CACHE_VERSION ? parsed : null
  } catch {
    return null
  }
}

const saveCache = (cache: TAllocationCache): void => {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // quota / unavailable — scan results still served from memory this session
  }
}

const inBatches = async <T, R>(
  items: readonly T[],
  fn: (item: T) => Promise<R>,
): Promise<R[]> => {
  const out: R[] = []
  for (let i = 0; i < items.length; i += RPC_BATCH) {
    out.push(...(await Promise.all(items.slice(i, i + RPC_BATCH).map(fn))))
  }
  return out
}

const makeChainReaders = (rpc: TProviderContext) => {
  const hashOf = (block: number): Promise<string> =>
    rpc.papiClient._request("chain_getBlockHash", [block])

  const balanceAt = async (block: number): Promise<bigint> => {
    const acct = await rpc.papi.query.System.Account.getValue(
      REWARD_ACCUMULATOR_POT_ADDRESS,
      { at: await hashOf(block) },
    )
    return acct.data.free
  }

  const allocationsAt = async (block: number): Promise<TAllocationRecord[]> => {
    const events = await rpc.papi.query.System.Events.getValue({
      at: await hashOf(block),
    })
    const records: TAllocationRecord[] = []
    for (const { event } of events) {
      if (event.type !== "GigaHdxRewards") continue
      const inner = event.value
      if (inner.type !== "RewardPoolAllocated") continue
      records.push({
        block,
        refIndex: Number(inner.value.ref_index),
        totalReward: inner.value.total_reward.toString(),
        totalWeightedVotes: inner.value.total_weighted_votes.toString(),
      })
    }
    return records
  }

  return { balanceAt, allocationsAt }
}

/**
 * Find every allocation in `(from, to]` by locating accumulator balance
 * drops. Multiple drops per bucket are handled by re-anchoring after each
 * find; a bisection hit without a matching event (e.g. some future manual
 * outflow) is skipped but still advances the anchor, so the loop always
 * terminates.
 */
const scanRange = async (
  rpc: TProviderContext,
  from: number,
  to: number,
): Promise<TAllocationRecord[]> => {
  if (to <= from) return []
  const { balanceAt, allocationsAt } = makeChainReaders(rpc)
  const { coarseFlagDelta, dropMargin } = detectionThresholds(
    millisecondsToSeconds(rpc.slotDurationMs),
  )

  // Coarse pass: balances at every ~6h boundary.
  const coarsePoints: number[] = []
  for (let b = from; b < to; b += COARSE_STEP_BLOCKS) coarsePoints.push(b)
  coarsePoints.push(to)
  const coarseBalances = await inBatches(coarsePoints, balanceAt)

  const flagged: Array<{ start: number; end: number }> = []
  for (let i = 1; i < coarsePoints.length; i++) {
    const delta = (coarseBalances[i] ?? 0n) - (coarseBalances[i - 1] ?? 0n)
    if (delta < coarseFlagDelta) {
      flagged.push({
        start: coarsePoints[i - 1] ?? from,
        end: coarsePoints[i] ?? to,
      })
    }
  }
  if (flagged.length === 0) return []

  // Fine pass: ~1h buckets inside flagged intervals; a bucket that lost
  // balance contains at least one drop (hourly inflow alone is positive).
  const dropBuckets: Array<{ start: number; end: number }> = []
  for (const { start, end } of flagged) {
    const finePoints: number[] = []
    for (let b = start; b < end; b += FINE_STEP_BLOCKS) finePoints.push(b)
    finePoints.push(end)
    const fineBalances = await inBatches(finePoints, balanceAt)
    for (let i = 1; i < finePoints.length; i++) {
      if ((fineBalances[i] ?? 0n) < (fineBalances[i - 1] ?? 0n)) {
        dropBuckets.push({
          start: finePoints[i - 1] ?? start,
          end: finePoints[i] ?? end,
        })
      }
    }
  }

  // Bisect each drop bucket to exact blocks and read their events.
  const found: TAllocationRecord[] = []
  for (const bucket of dropBuckets) {
    let anchor = bucket.start
    let anchorBalance = await balanceAt(anchor)
    for (;;) {
      // Smallest block in (anchor, end] whose balance fell ≥ dropMargin
      // below the anchor. Intra-range inflow keeps non-drop balances above
      // the anchor, so the predicate is monotone across the drop point.
      let lo = anchor
      let hi = bucket.end
      let hiBalance = await balanceAt(hi)
      if (anchorBalance - hiBalance < dropMargin) break
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        const midBalance = await balanceAt(mid)
        if (anchorBalance - midBalance >= dropMargin) {
          hi = mid
          hiBalance = midBalance
        } else {
          lo = mid
        }
      }
      found.push(...(await allocationsAt(hi)))
      anchor = hi
      anchorBalance = hiBalance
    }
  }
  return found
}

/**
 * Full allocation history covering at least the trailing
 * `PAIDOUT_WINDOW_DAYS`, exact from chain, cached in localStorage across
 * sessions (blocks are immutable — nothing is ever re-scanned).
 *
 * First visit scans one full window (~250 balance reads + a handful of
 * event reads, batched — a few seconds in the background); later visits
 * only cover the range since `lastScannedBlock`.
 */
export const allocationHistoryQuery = (rpc: TProviderContext) =>
  queryOptions({
    queryKey: ["gigaApr", "allocationHistory"],
    enabled: rpc.isApiLoaded,
    staleTime: Infinity,
    refetchOnMount: false as const,
    refetchOnWindowFocus: false as const,
    refetchOnReconnect: false as const,
    queryFn: async (): Promise<TAllocationRecord[]> => {
      const blocksPerDay = Math.floor(
        secondsInDay / millisecondsToSeconds(rpc.slotDurationMs),
      )
      const bestNumber = await rpc.queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      const head = bestNumber.parachainBlockNumber

      const windowStart = Math.max(
        GIGAHDX_LAUNCH_BLOCK,
        head - PAIDOUT_WINDOW_DAYS * blocksPerDay,
      )
      const cache = loadCache()
      // Ranges older than the window never feed the APR — skip any gap left
      // by a long absence instead of scanning it.
      const scanFrom = Math.max(cache?.lastScannedBlock ?? 0, windowStart)

      const fresh = await scanRange(rpc, scanFrom, head)

      const byKey = new Map<string, TAllocationRecord>()
      for (const record of [...(cache?.allocations ?? []), ...fresh]) {
        byKey.set(`${record.block}:${record.refIndex}`, record)
      }
      const allocations = [...byKey.values()].sort((a, b) => a.block - b.block)

      saveCache({
        version: CACHE_VERSION,
        lastScannedBlock: head,
        allocations,
      })
      return allocations
    },
  })
