import { StakingEvent } from "@galacticcouncil/indexer/neckwork"
import { secondsToMilliseconds } from "date-fns"
import { secondsInWeek } from "date-fns/constants"

export type AccumulatedRpsEvent = StakingEvent & {
  readonly accumulatedRps: string
  readonly totalStake: string
}

const FROM_BLOCK_STEP = 1000

// min. amount of block for how long we want to calculate APR from = one week
export const getLengthOfStaking = (blockTimeMs: number) =>
  secondsToMilliseconds(secondsInWeek) / blockTimeMs

/**
 * Two weeks back: every event of the last week plus the newest one before it.
 * Rounded down so the query key does not change with every block.
 */
export const getAccumulatedRpsFromBlock = (
  currentBlock: number,
  blockTimeMs: number,
) => {
  const fromBlock = currentBlock - 2 * getLengthOfStaking(blockTimeMs)

  return Math.max(0, Math.floor(fromBlock / FROM_BLOCK_STEP) * FROM_BLOCK_STEP)
}

export const selectAccumulatedRpsEvents = (
  events: readonly StakingEvent[],
): AccumulatedRpsEvent[] =>
  events.filter(
    (event): event is AccumulatedRpsEvent =>
      event.accumulatedRps !== null && event.totalStake !== null,
  )

/**
 * Splits events (oldest first) at `weekAgoBlock`. `before` is the newest event
 * older than that block, or the oldest event when none is older.
 */
export const splitAccumulatedRpsEvents = <
  T extends { readonly blockHeight: number },
>(
  events: readonly T[],
  weekAgoBlock: number,
) => {
  const after = events.filter((event) => event.blockHeight >= weekAgoBlock)
  const before = events[events.length - after.length - 1] ?? events[0]

  return { before, after }
}
