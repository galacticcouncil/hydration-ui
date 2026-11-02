import type { PingResponse } from "@galacticcouncil/utils"

export const MAX_HEAD_LAG_MS = 60_000

/**
 * How long to keep waiting for more nodes after the first one answers. Stale
 * nodes can hold the fresh count under the limit, and without a deadline the
 * wait would run to the slowest node's timeout.
 */
export const STRAGGLER_GRACE_MS = 1_000

export type BestRpcs = {
  best: PingResponse[]
  staleUrls: string[]
}

/**
 * Drops nodes whose head is behind the newest one seen and orders the rest
 * newest first. Lag is relative to the other nodes rather than to Date.now(),
 * so a wrong client clock cannot discard every node.
 */
export const keepFreshRpcs = <T extends Pick<PingResponse, "timestamp">>(
  results: T[],
): T[] => {
  const newest = Math.max(...results.map((result) => result.timestamp))

  return results
    .filter((result) => newest - result.timestamp <= MAX_HEAD_LAG_MS)
    .sort((a, b) => b.timestamp - a.timestamp)
}
