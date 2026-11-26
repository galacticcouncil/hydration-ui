import { Ladder, Stall } from "@/modules/strategies/multiply/config/abi"

export type MultiplyPositionStatus =
  | "active"
  | "building"
  | "withdrawing"
  | "closing"
  | "paused"

// ILooperPosition.Kind: None means nothing is in flight.
const KIND_NONE = 0

export type MultiplyPositionState = {
  ladder: Ladder
  closing: boolean
  stalled: Stall
  pendingKind: number
  // ms, as the contract stores it
  pendingDeadline: number
}

/** True when a rung is in flight past its deadline: only `resume` moves it on. */
export const isRungExpired = (state: MultiplyPositionState, nowMs: number) =>
  state.pendingKind !== KIND_NONE && nowMs > state.pendingDeadline

// Collapses the contract's ladder × stall × pending states into what users see.
export const getMultiplyPositionStatus = (
  state: MultiplyPositionState,
  nowMs: number,
): MultiplyPositionStatus => {
  if (state.stalled !== Stall.None || isRungExpired(state, nowMs))
    return "paused"
  if (state.ladder === Ladder.None) return "active"
  if (state.ladder === Ladder.Ramp) return "building"
  return state.closing ? "closing" : "withdrawing"
}

/**
 * Ladder progress as a fraction, or null when there is none to show. A ramp
 * climbs from 1× to its target, a close comes back down to 1×. A partial
 * withdraw keeps its leverage, so leverage cannot measure it.
 * ponytail: no bar for withdrawing; it needs the debt at ladder start, which the contract does not keep
 */
export const getMultiplyProgress = (
  status: MultiplyPositionStatus,
  leverage: number,
  targetLeverage: number,
) => {
  if (targetLeverage <= 1) return null
  const climbed = Math.min(
    1,
    Math.max(0, (leverage - 1) / (targetLeverage - 1)),
  )
  if (status === "building") return climbed
  if (status === "closing") return 1 - climbed
  return null
}

const peaks = new Map<string, { ladder: Ladder; peak: number }>()

/**
 * The highest progress a position's current ladder has shown. A lark reorg
 * rewinds a ramp by a rung or two, and the bar should not follow it back. A
 * new ladder, or one that ended, starts from scratch.
 */
export const holdPeakProgress = (
  address: string,
  ladder: Ladder,
  progress: number | null,
) => {
  if (progress === null) {
    if (ladder === Ladder.None) peaks.delete(address)
    return null
  }
  const prev = peaks.get(address)
  const peak =
    prev?.ladder === ladder ? Math.max(prev.peak, progress) : progress
  peaks.set(address, { ladder, peak })
  return peak
}
