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
  BilPoolPosition,
  BilReserveConfig,
} from "@/modules/strategies/bil/hooks/useBilPoolPosition"

type BilWithdrawHfContext = {
  poolPosition: BilPoolPosition
  reserveConfig: BilReserveConfig
  suppliedBalance: string
  exchangeRate: number
}

const buildBilWithdrawContext = ({
  poolPosition,
  reserveConfig,
  suppliedBalance,
  exchangeRate,
}: BilWithdrawHfContext) => {
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

export const getBilMaxWithdrawable = (context: BilWithdrawHfContext): Big => {
  const { user, userReserve, poolReserve } = buildBilWithdrawContext(context)
  return calculateMaxWithdrawAmount(user, userReserve, poolReserve)
}

export const getBilWithdrawHealthFactor = (
  context: BilWithdrawHfContext & { withdrawAmount: string },
): HealthFactorResult => {
  const { withdrawAmount, poolPosition, ...rest } = context
  const { user, userReserve, poolReserve } = buildBilWithdrawContext({
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

const toBilHealthFactor = (healthFactor: number) =>
  healthFactor === Infinity ? "-1" : healthFactor.toString()

const toBilLiquidationThreshold = (liquidationThresholdPct: number) =>
  (liquidationThresholdPct / 100).toString()

export const getBilBorrowHealthFactor = (
  poolPosition: BilPoolPosition,
  borrowAmountUsd: number,
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
