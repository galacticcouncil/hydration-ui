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
  /** HOLLAR of withdrawal equity one slice frees */
  freedPerSlice: number
  /** seconds per slice: the keeper's measured cadence, never below pacing */
  sliceSeconds: number
  /** a safety de-lever or a pause: withdrawals make no progress */
  stalled: boolean
}

/** the keeper starts an eligible unwind on its next cycle */
const START_SECONDS = 30
/** the vault pays out on the keeper turn after the last slice is credited */
const SETTLE_SECONDS = 30

/**
 * Seconds until a withdrawal is fully claimable:
 *
 *   (backlog + not started) / freed per slice × seconds per slice
 *
 * plus the cooldown left and a keeper turn to start it, then one to pay out.
 * Every started withdrawal finishes together, so the whole backlog counts,
 * never just the queue ahead. Withdrawals that start later push it back; null
 * while the inputs are unknown or the keeper is stalled. An exit that does not
 * wait for the unwind (a headroom exit) pays out on the keeper turns alone.
 */
export const claimableInSeconds = ({
  backlog,
  notStartedHollar,
  cooldownLeftSeconds,
  started,
  waitsOnUnwind = true,
}: {
  backlog: ExitBacklog | null
  /** equity of requested withdrawals the keeper has not started, all vaults */
  notStartedHollar: number
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
  const slices =
    (backlog.backlogHollar + notStartedHollar) / backlog.freedPerSlice
  return turns + slices * backlog.sliceSeconds
}

/**
 * HOLLAR equity of requested withdrawals the keeper has not started yet, in
 * every vault: each joins the shared backlog within a keeper turn.
 */
export const notStartedEquity = (
  vaults: {
    queued: { remaining: number; started: boolean }[]
    /** HOLLAR of Main debt per collateral unit; null while unknown */
    debtPerCollateral: number | null
  }[],
) =>
  vaults.reduce(
    (sum, { queued, debtPerCollateral }) =>
      sum +
      queued
        .filter((q) => !q.started)
        .reduce((s, q) => s + q.remaining * (debtPerCollateral ?? 0), 0),
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
