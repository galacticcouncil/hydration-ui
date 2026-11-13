import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import Big from "big.js"

export type MultiplyUnavailableReason =
  | "sameAsset"
  | "reserveFrozen"
  | "notCollateral"
  | "notBorrowable"
  | "noPrice"
  | "noAToken"
  | "supplyCap"
  | "isolated"
  | "debtCeiling"
  | "borrowCap"
  | "hollarBucket"
  | "noLiquidity"

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
  | "supplyCap"
  | "totalLiquidity"
  | "availableLiquidity"
  | "priceInUsd"
>

export type AvailabilityContext = {
  sameAsset: boolean
  maxLeverage: number
  hasAToken: boolean
  // HOLLAR is minted, so its room is the facilitator bucket; undefined when the
  // debt is not HOLLAR, null while the bucket loads
  hollarRoom?: string | null
}

const isFull = (cap: string, used: string) =>
  Big(cap).gt(0) && Big(used).gte(cap)

/**
 * Why a new position on this collateral/debt could not open or ramp, or null
 * when it can. Ordered: the factory's own checks first (open reverts), then a
 * full supply cap (open reverts inside Aave), then what lets open succeed but
 * stalls the ramp at 1×, which the chain does not stop.
 */
export const getMultiplyUnavailableReason = (
  collateral: AvailabilityReserve,
  debt: AvailabilityReserve,
  { sameAsset, maxLeverage, hasAToken, hollarRoom }: AvailabilityContext,
): MultiplyUnavailableReason | null => {
  const halted = (r: AvailabilityReserve) =>
    !r.isActive || r.isFrozen || r.isPaused

  if (sameAsset) return "sameAsset"
  if (halted(collateral) || halted(debt)) return "reserveFrozen"
  if (maxLeverage <= 1) return "notCollateral"
  if (!debt.borrowingEnabled) return "notBorrowable"
  if (!Number(collateral.priceInUsd) || !Number(debt.priceInUsd))
    return "noPrice"
  if (!hasAToken) return "noAToken"
  if (isFull(collateral.supplyCap, collateral.totalLiquidity))
    return "supplyCap"
  if (collateral.isIsolated && !debt.borrowableInIsolation) return "isolated"
  if (collateral.isIsolated && Big(collateral.availableDebtCeilingUsd).lte(0))
    return "debtCeiling"
  if (isFull(debt.borrowCap, debt.totalDebt)) return "borrowCap"
  if (hollarRoom !== undefined) {
    if (hollarRoom !== null && Big(hollarRoom).lte(0)) return "hollarBucket"
  } else if (Big(debt.availableLiquidity).lte(0)) return "noLiquidity"

  return null
}
