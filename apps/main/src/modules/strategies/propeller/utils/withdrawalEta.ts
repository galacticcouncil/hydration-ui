export type SettleLog = {
  requestId: number
  /** collateral units */
  collateral: number
  blockNumber: bigint
}

/**
 * The keeper's exit work, shared by every vault. It sells one slice of the
 * loop's aPRIME per pacing interval and credits the freed HOLLAR to every
 * started withdrawal pro rata, so all of them finish in the same last slice.
 */
export type ExitBacklog = {
  /** HOLLAR still to free for started withdrawals, all vaults */
  backlogHollar: number
  /** of that, what the next keeper turn frees from the loop's idle cash */
  comingSoonHollar: number
  /** HOLLAR of withdrawal equity one slice frees */
  freedPerSlice: number
  /** equity freed per HOLLAR the loop gives up, idle cash included */
  equityShare: number
  /** seconds per slice: the keeper's measured cadence, never below pacing */
  sliceSeconds: number
  /** a safety de-lever or a pause: withdrawals make no progress */
  stalled: boolean
}

/**
 * The keeper borrowing the vault's waiting credit into the loop, before and
 * during an unwind: that cash waits there unbought, and the unwind frees it
 * first, alongside its sales.
 */
export type LoopDeployment = {
  /** HOLLAR deployed by the exit's start */
  byStart: number
  /** HOLLAR still to deploy after it */
  later: number
  /** HOLLAR deployed per second; Infinity when it goes at once */
  perSecond: number
}

/** the keeper starts an eligible unwind on its next cycle */
export const START_SECONDS = 30
/** the vault pays out on the keeper turn after the last slice is credited */
const SETTLE_SECONDS = 30

/** a keeper turn on top of the pacing interval when no sales were seen */
const KEEPER_SLACK_SECONDS = 5

/**
 * The keeper's usual seconds per exit slice: the median of the gaps between
 * its sales. A missed turn or a quiet stretch between withdrawals stretches a
 * few gaps (114, 234 s against a steady 60 s on 0.lark) and drags an average
 * along; the median stays on the cadence the keeper runs most of the time.
 * Never below the pacing interval; the interval plus a turn without gaps.
 */
export const typicalSliceSeconds = (gaps: number[], interval: number) => {
  if (gaps.length === 0) return interval + KEEPER_SLACK_SECONDS
  const sorted = [...gaps].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
  return Math.max(median, interval)
}

/**
 * Seconds until a withdrawal is fully claimable:
 *
 *   (backlog + not started − freed from idle cash) / freed per slice × seconds per slice
 *
 * less what deployed cash frees while the slices sell *
 * plus the cooldown left and a keeper turn to start it, then one to pay out.
 * Every started withdrawal finishes together, so the whole backlog counts,
 * never just the queue ahead. Withdrawals that start later push it back; null
 * while the inputs are unknown or the keeper is stalled. An exit that does not
 * wait for the unwind (a headroom exit) pays out on the keeper turns alone.
 */
export const claimableInSeconds = ({
  backlog,
  notStartedHollar,
  ownHollar = 0,
  deployment,
  cooldownLeftSeconds,
  started,
  waitsOnUnwind = true,
}: {
  backlog: ExitBacklog | null
  /**
   * HOLLAR the loop's unwind must free for requested withdrawals the keeper
   * has not started, all vaults: each one's claim on the loop
   */
  notStartedHollar: number
  /**
   * this withdrawal's own claim still to free: the backlog can never be
   * less, though a backlog read before the keeper started it says so
   */
  ownHollar?: number
  deployment?: LoopDeployment
  cooldownLeftSeconds: number
  started: boolean
  waitsOnUnwind?: boolean
}): number | null => {
  if (!backlog || backlog.stalled) return null
  const turns =
    Math.max(cooldownLeftSeconds, 0) +
    (started ? 0 : START_SECONDS) +
    SETTLE_SECONDS
  if (!waitsOnUnwind) return turns
  if (backlog.freedPerSlice <= 0) return null
  const { equityShare } = backlog
  const atOnce = deployment?.perSecond === Infinity
  const idle =
    backlog.comingSoonHollar +
    ((deployment?.byStart ?? 0) + (atOnce ? deployment!.later : 0)) *
      equityShare
  const need = Math.max(
    Math.max(backlog.backlogHollar + notStartedHollar, ownHollar) - idle,
    0,
  )
  // freed per second by sales, and by cash deployed while they sell
  const selling = backlog.freedPerSlice / backlog.sliceSeconds
  const cash = atOnce ? 0 : (deployment?.perSecond ?? 0) * equityShare
  const later = cash > 0 ? (deployment?.later ?? 0) * equityShare : 0
  const together = later > 0 && cash > 0 ? need / (selling + cash) : Infinity
  const seconds =
    together * cash <= later
      ? together
      : ((need - later) / backlog.freedPerSlice) * backlog.sliceSeconds
  return turns + Math.max(seconds, 0)
}

/**
 * HOLLAR the loop's unwind must free for requested withdrawals the keeper has
 * not started yet, in every vault: each joins the shared backlog within a
 * keeper turn.
 */
export const notStartedUnwind = (
  vaults: {
    queued: {
      remaining: number
      started: boolean
      unwinding?: boolean
      /**
       * its claim on the loop, projected for its start; without a projection
       * its Main debt stands in (a claim's equity tracks the debt it backs)
       */
      unwind?: number
    }[]
    /** HOLLAR of Main debt per collateral unit; null while unknown */
    debtPerCollateral: number | null
  }[],
) =>
  vaults.reduce(
    (sum, { queued, debtPerCollateral }) =>
      sum +
      queued
        // a waiting exit headroom will settle adds nothing to the unwind
        .filter((q) => !q.started && q.unwinding !== false)
        .reduce(
          (s, q) => s + (q.unwind ?? q.remaining * (debtPerCollateral ?? 0)),
          0,
        ),
    0,
  )

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

/** coarse on purpose: keeper turns wobble, so minutes beat false precision */
export const formatEta = (seconds: number) => {
  if (seconds < 90) return "~1 min"
  if (seconds < 5400) return `~${Math.round(seconds / 60)} min`
  if (seconds < 172800) return `~${Math.round(seconds / 3600)} h`
  return `~${Math.round(seconds / 86400)} d`
}
