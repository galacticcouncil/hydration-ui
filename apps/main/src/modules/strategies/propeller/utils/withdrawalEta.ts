/** a keeper's first sliver (<0.0001) says nothing about its tranche pace */
const PACE_DUST = 0.0001
/** a longer pause between tranches means the queue was idle, not slow */
const IDLE_GAP_SECONDS = 15 * 60
/** fewer tranche gaps than this is too thin to call a pace */
const MIN_PACE_SAMPLES = 2
/** the keeper changes; only its latest tranches say how it works now */
const RECENT_GAPS = 20
/** a settling request this many keeper cycles without a tranche is stalled */
const STALL_CYCLES = 5

export type SettleLog = {
  requestId: number
  /** collateral units */
  collateral: number
  blockNumber: bigint
}

export type SettlePace = {
  /** collateral the keeper settles per second while the queue is busy */
  perSecond: number
  /** one keeper cycle: the median gap between consecutive tranches */
  cycleSeconds: number
}

/**
 * The keeper settles one tranche per cycle, so its pace is collateral settled
 * over the time between consecutive tranches of the same request. Gaps
 * between requests are cooldowns and an idle queue, not keeper speed.
 */
export const measureSettlePace = (
  logs: SettleLog[],
  blockTimeSeconds: number,
): SettlePace | null => {
  const tranches = logs
    .filter((l) => l.collateral >= PACE_DUST)
    .sort((a, b) => (a.blockNumber < b.blockNumber ? -1 : 1))
  const idleBlocks = IDLE_GAP_SECONDS / blockTimeSeconds
  const gaps: number[] = []
  let collateral = 0
  for (let i = tranches.length - 1; i >= 1 && gaps.length < RECENT_GAPS; i--) {
    const [prev, next] = [tranches[i - 1]!, tranches[i]!]
    if (prev.requestId !== next.requestId) continue
    const gap = Number(next.blockNumber - prev.blockNumber)
    if (gap > idleBlocks || gap === 0) continue
    collateral += next.collateral
    gaps.push(gap)
  }
  if (gaps.length < MIN_PACE_SAMPLES) return null
  const blocks = gaps.reduce((sum, gap) => sum + gap, 0)
  const sorted = [...gaps].sort((a, b) => a - b)
  return {
    perSecond: collateral / (blocks * blockTimeSeconds),
    cycleSeconds: sorted[Math.floor(sorted.length / 2)]! * blockTimeSeconds,
  }
}

/**
 * Seconds until a withdrawal is fully claimable:
 *
 *   cooldown left + one keeper cycle to start + (ahead + remaining) / pace
 *
 * `ahead` is collateral still to settle for earlier requests: the queue is
 * FIFO. null while the pace is unknown or the request has stalled.
 */
export const claimableInSeconds = ({
  pace,
  remaining,
  ahead,
  cooldownLeftSeconds,
  started,
  sinceLastSettleSeconds,
}: {
  pace: SettlePace | null
  /** collateral units */
  remaining: number
  /** collateral units */
  ahead: number
  cooldownLeftSeconds: number
  started: boolean
  /** since this request's own latest tranche; null before its first one */
  sinceLastSettleSeconds: number | null
}): number | null => {
  if (!pace || pace.perSecond <= 0 || remaining <= 0) return null
  // a stalled request never gets a countdown that keeps moving forward
  if (
    sinceLastSettleSeconds !== null &&
    sinceLastSettleSeconds > STALL_CYCLES * pace.cycleSeconds
  )
    return null
  return (
    Math.max(cooldownLeftSeconds, 0) +
    (started ? 0 : pace.cycleSeconds) +
    (ahead + remaining) / pace.perSecond
  )
}

/**
 * The reserve pays each exit's share of the strategy's shortfall. An exit it
 * cannot cover holds the queue until someone funds it, so warn when the
 * shortfall of everything up to this withdrawal exceeds the reserve.
 */
export const reserveCoversExit = ({
  carry,
  reserveHollar,
  debtPerCollateral,
  collateral,
}: {
  /** shortfall share, 0.0044 = 0.44% */
  carry: number | null
  reserveHollar: number | null
  /** HOLLAR of Main debt per collateral unit */
  debtPerCollateral: number | null
  /** this withdrawal plus everything ahead of it, collateral units */
  collateral: number
}) => {
  if (!carry || carry <= 0) return true
  // unknown inputs never raise an alarm the contract would not
  if (reserveHollar === null || debtPerCollateral === null) return true
  return reserveHollar >= collateral * debtPerCollateral * carry
}

/** coarse on purpose: the pace wobbles, so minutes beat false precision */
export const formatEta = (seconds: number) => {
  if (seconds < 90) return "~1 min"
  if (seconds < 5400) return `~${Math.round(seconds / 60)} min`
  if (seconds < 172800) return `~${Math.round(seconds / 3600)} h`
  return `~${Math.round(seconds / 86400)} d`
}
