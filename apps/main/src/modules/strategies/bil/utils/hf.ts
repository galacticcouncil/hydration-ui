import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import {
  formatHealthFactorResult,
  type HealthFactorResult,
} from "@galacticcouncil/money-market/utils"
import Big from "big.js"

import type { BilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"

const toBilHealthFactor = (healthFactor: number) =>
  healthFactor === Infinity ? "-1" : healthFactor.toString()

const toBilLiquidationThreshold = (liquidationThresholdPct: number) =>
  (liquidationThresholdPct / 100).toString()

export const getBilBorrowHealthFactor = (
  poolPosition: BilPoolPosition,
  borrowAmountUsd: string,
): HealthFactorResult => {
  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      poolPosition.totalCollateralUsd.toString(),
    borrowBalanceMarketReferenceCurrency: Big(poolPosition.totalDebtUsd)
      .plus(borrowAmountUsd)
      .toString(),
    currentLiquidationThreshold: toBilLiquidationThreshold(
      poolPosition.liquidationThresholdPct,
    ),
  })

  return formatHealthFactorResult({
    currentHF: toBilHealthFactor(poolPosition.healthFactor),
    futureHF: newHealthFactor.toString(),
  })
}

export const getBilRepayHealthFactor = (
  poolPosition: BilPoolPosition,
  repayAmountUsd: string,
): HealthFactorResult => {
  const remainingBorrowBalance = Big.max(
    Big(poolPosition.totalDebtUsd).minus(repayAmountUsd),
    0,
  )

  const calculatedHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      poolPosition.totalCollateralUsd.toString(),
    borrowBalanceMarketReferenceCurrency: remainingBorrowBalance.toString(),
    currentLiquidationThreshold: toBilLiquidationThreshold(
      poolPosition.liquidationThresholdPct,
    ),
  })

  const futureHealthFactor =
    calculatedHealthFactor.isLessThan(0) && !calculatedHealthFactor.eq(-1)
      ? "0"
      : calculatedHealthFactor.toString()

  return formatHealthFactorResult({
    currentHF: toBilHealthFactor(poolPosition.healthFactor),
    futureHF: futureHealthFactor,
  })
}
