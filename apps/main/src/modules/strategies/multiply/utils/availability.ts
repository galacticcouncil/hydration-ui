import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import Big from "big.js"

export type MultiplyUnavailableReason =
  | "reserveFrozen"
  | "notBorrowable"
  | "debtCeiling"
  | "borrowCap"

type AvailabilityReserve = Pick<
  ReserveSummary,
  | "isActive"
  | "isFrozen"
  | "isPaused"
  | "isIsolated"
  | "borrowingEnabled"
  | "borrowableInIsolation"
  | "availableDebtCeilingUsd"
  | "borrowCap"
  | "totalDebt"
>

// Why a new position could not ramp, or null when it can. The factory's
// _validate misses isolation and caps, so Aave would stall the ladder instead.
// ponytail: HOLLAR's facilitator bucket is not checked yet
export const getMultiplyUnavailableReason = (
  collateral: AvailabilityReserve,
  debt: AvailabilityReserve,
): MultiplyUnavailableReason | null => {
  const halted = (r: AvailabilityReserve) =>
    !r.isActive || r.isFrozen || r.isPaused

  if (halted(collateral) || halted(debt)) return "reserveFrozen"
  if (
    !debt.borrowingEnabled ||
    (collateral.isIsolated && !debt.borrowableInIsolation)
  )
    return "notBorrowable"
  if (collateral.isIsolated && Big(collateral.availableDebtCeilingUsd).lte(0))
    return "debtCeiling"
  if (Big(debt.borrowCap).gt(0) && Big(debt.totalDebt).gte(debt.borrowCap))
    return "borrowCap"

  return null
}
