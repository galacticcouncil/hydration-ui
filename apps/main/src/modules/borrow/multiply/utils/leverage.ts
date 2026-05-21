import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import Big from "big.js"

export function getReservePairLtv(
  collateralReserve: ComputedReserveData,
  debtReserve: ComputedReserveData,
) {
  const useEMode =
    collateralReserve.eModeCategoryId > 0 &&
    collateralReserve.eModeCategoryId === debtReserve.eModeCategoryId
  return useEMode
    ? collateralReserve.formattedEModeLtv
    : collateralReserve.formattedBaseLTVasCollateral
}

export function getReservePairLiquidationLtv(
  collateralReserve: ComputedReserveData,
  debtReserve: ComputedReserveData,
) {
  const useEMode =
    collateralReserve.eModeCategoryId > 0 &&
    collateralReserve.eModeCategoryId === debtReserve.eModeCategoryId
  return useEMode
    ? collateralReserve.formattedEModeLiquidationThreshold
    : collateralReserve.formattedReserveLiquidationThreshold
}

export function getMaxReservePairLeverage(
  collateralReserve: ComputedReserveData,
  debtReserve: ComputedReserveData,
  factor?: number,
) {
  const ltv = getReservePairLtv(collateralReserve, debtReserve)
  return calculateMaxLeverage(Number(ltv), factor)
}

export function calculateMaxLeverage(ltv: number, factor: number = 1): number {
  const theoretical = 1 / (1 - ltv)
  const reduced = theoretical * factor
  return Math.floor(reduced * 10) / 10
}

export function calculateEffectiveLeverage(
  collateralAmount: string,
  debtAmount: string,
): number | null {
  const collateral = new Big(collateralAmount || "0")
  const debt = new Big(debtAmount || "0")
  const difference = collateral.minus(debt)

  if (difference.lte(0)) return null

  return collateral.div(difference).toNumber()
}
