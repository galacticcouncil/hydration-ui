import { times } from "remeda"

/**
 * Queue slots whose estimated wait bounds a new redemption request: every
 * slot from the head through the append index. Empty when nothing is queued.
 */
export const getQueueWaitSlots = (
  queueHead: bigint,
  queueLength: bigint,
): bigint[] =>
  queueLength > queueHead
    ? times(Number(queueLength - queueHead) + 1, (i) => queueHead + BigInt(i))
    : []

type QueueWaitInput = {
  /** `getEstimatedWaitTime` of every slot from `getQueueWaitSlots`, seconds */
  waits: readonly bigint[]
  /** Maturity timestamp of the head position, 0 when there is none */
  maturityTime: bigint
  /** Current unix time, seconds */
  now: bigint
  idleHollar: bigint
}

export const getQueueWait = ({
  waits,
  maturityTime,
  now,
  idleHollar,
}: QueueWaitInput) => {
  const nextMaturitySec = maturityTime > now ? maturityTime - now : 0n
  const maxWaitSec = waits.reduce((max, w) => (w > max ? w : max), 0n)

  // getEstimatedWaitTime often returns 0 for settled/claimable requests,
  // so floor on next maturity when idle HOLLAR is 0.
  const worstCaseWaitSec =
    idleHollar === 0n && nextMaturitySec > maxWaitSec
      ? nextMaturitySec
      : maxWaitSec

  return { nextMaturitySec, worstCaseWaitSec }
}
