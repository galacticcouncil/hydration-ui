import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import type {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "@galacticcouncil/money-market/hooks"
import {
  calculateHFAfterWithdraw,
  calculateMaxWithdrawAmount,
  formatHealthFactorResult,
  type HealthFactorResult,
} from "@galacticcouncil/money-market/utils"
import Big from "big.js"

import type {
  HdclPoolPosition,
  HdclReserveConfig,
} from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"

type HdclWithdrawHfContext = {
  poolPosition: HdclPoolPosition
  reserveConfig: HdclReserveConfig
  suppliedBalance: string
  exchangeRate: number
}

const buildHdclWithdrawContext = ({
  poolPosition,
  reserveConfig,
  suppliedBalance,
  exchangeRate,
}: HdclWithdrawHfContext) => {
  const formattedLiqThreshold = (
    reserveConfig.liquidationThresholdPct / 100
  ).toString()
  const reserveLiqThresholdBps = (
    reserveConfig.liquidationThresholdPct * 100
  ).toString()
  const healthFactor =
    poolPosition.healthFactor === Infinity
      ? "-1"
      : poolPosition.healthFactor.toString()

  const user = {
    healthFactor,
    totalCollateralMarketReferenceCurrency:
      poolPosition.totalCollateralUsd.toString(),
    totalBorrowsMarketReferenceCurrency: poolPosition.totalDebtUsd.toString(),
    currentLiquidationThreshold: (
      poolPosition.liquidationThresholdPct / 100
    ).toString(),
    isInEmode: false,
    userEmodeCategoryId: 0,
  } as ExtendedFormattedUser

  const userReserve = {
    underlyingBalance: suppliedBalance,
    usageAsCollateralEnabledOnUser: true,
  } as ComputedUserReserveData

  const poolReserve = {
    unborrowedLiquidity: suppliedBalance,
    eModeCategoryId: 0,
    formattedEModeLiquidationThreshold: formattedLiqThreshold,
    formattedReserveLiquidationThreshold: formattedLiqThreshold,
    reserveLiquidationThreshold: reserveLiqThresholdBps,
    formattedPriceInMarketReferenceCurrency: exchangeRate.toString(),
  } as ComputedReserveData

  return { user, userReserve, poolReserve }
}

export const getHdclMaxWithdrawable = (context: HdclWithdrawHfContext): Big => {
  const { user, userReserve, poolReserve } = buildHdclWithdrawContext(context)
  return calculateMaxWithdrawAmount(user, userReserve, poolReserve)
}

export const getHdclWithdrawHealthFactor = (
  context: HdclWithdrawHfContext & { withdrawAmount: string },
): HealthFactorResult => {
  const { withdrawAmount, poolPosition, ...rest } = context
  const { user, userReserve, poolReserve } = buildHdclWithdrawContext({
    poolPosition,
    ...rest,
  })

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve,
    poolReserve,
    withdrawAmount,
  })

  const currentHealthFactor =
    poolPosition.healthFactor === Infinity
      ? "-1"
      : poolPosition.healthFactor.toString()

  return formatHealthFactorResult({
    currentHF: currentHealthFactor,
    futureHF: healthFactorAfterWithdraw.toString(),
  })
}

const toHdclHealthFactor = (healthFactor: number) =>
  healthFactor === Infinity ? "-1" : healthFactor.toString()

const toHdclLiquidationThreshold = (liquidationThresholdPct: number) =>
  (liquidationThresholdPct / 100).toString()

export const getHdclBorrowHealthFactor = (
  poolPosition: HdclPoolPosition,
  borrowAmountUsd: number,
): HealthFactorResult => {
  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      poolPosition.totalCollateralUsd.toString(),
    borrowBalanceMarketReferenceCurrency: Big(poolPosition.totalDebtUsd)
      .plus(borrowAmountUsd)
      .toString(),
    currentLiquidationThreshold: toHdclLiquidationThreshold(
      poolPosition.liquidationThresholdPct,
    ),
  })

  return formatHealthFactorResult({
    currentHF: toHdclHealthFactor(poolPosition.healthFactor),
    futureHF: newHealthFactor.toString(),
  })
}

export const getHdclRepayHealthFactor = (
  poolPosition: HdclPoolPosition,
  repayAmountUsd: number,
): HealthFactorResult => {
  const remainingBorrowBalance = Big.max(
    Big(poolPosition.totalDebtUsd).minus(repayAmountUsd),
    0,
  )

  const calculatedHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      poolPosition.totalCollateralUsd.toString(),
    borrowBalanceMarketReferenceCurrency: remainingBorrowBalance.toString(),
    currentLiquidationThreshold: toHdclLiquidationThreshold(
      poolPosition.liquidationThresholdPct,
    ),
  })

  const futureHealthFactor =
    calculatedHealthFactor.isLessThan(0) && !calculatedHealthFactor.eq(-1)
      ? "0"
      : calculatedHealthFactor.toString()

  return formatHealthFactorResult({
    currentHF: toHdclHealthFactor(poolPosition.healthFactor),
    futureHF: futureHealthFactor,
  })
}
