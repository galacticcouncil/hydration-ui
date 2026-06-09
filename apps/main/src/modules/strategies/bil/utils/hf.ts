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
