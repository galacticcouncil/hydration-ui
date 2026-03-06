import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"

export function getMaxReserveLtv(reserve: ComputedReserveData) {
  return reserve.eModeCategoryId > 0
    ? reserve.formattedEModeLtv
    : reserve.formattedBaseLTVasCollateral
}

export function getMaxReserveLeverage(
  reserve: ComputedReserveData,
  factor?: number,
) {
  const maxReserveLtv = getMaxReserveLtv(reserve)
  return calculateMaxLeverage(Number(maxReserveLtv), factor)
}

export function calculateMaxLeverage(ltv: number, factor: number = 1): number {
  const theoretical = 1 / (1 - ltv)
  const reduced = theoretical * factor
  return Math.floor(reduced * 10) / 10
}
