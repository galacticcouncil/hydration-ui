import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  UserReserveData,
} from "@aave/math-utils"
import { bigMax, bigMin } from "@galacticcouncil/utils"
import Big, { BigSource } from "big.js"

import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "@/hooks/commonTypes"

interface CalculateHFAfterSwapProps {
  fromAmount: BigSource
  fromAssetData: ComputedReserveData
  fromAssetUserData: ComputedUserReserve
  toAmountAfterSlippage: BigSource
  toAssetData: ComputedReserveData
  user: ExtendedFormattedUser
}

interface CalculateHFAfterSwapRepayProps {
  amountToReceiveAfterSwap: BigSource
  amountToSwap: BigSource
  fromAssetData: ComputedReserveData
  toAssetData: ComputedReserveData
  user: ExtendedFormattedUser
  repayWithUserReserve?: UserReserveData
  debt: string
}

interface CalculateHFAfterWithdrawProps {
  user: ExtendedFormattedUser
  userReserve: ComputedUserReserveData
  poolReserve: ComputedReserveData
  withdrawAmount: string
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  toAmountAfterSlippage,
  toAssetData,
  user,
}: CalculateHFAfterSwapProps) {
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  // it takes into account if in emode as threshold is different
  let hfEffectOfFromAmount = "0"

  if (
    fromAssetUserData.usageAsCollateralEnabledOnUser &&
    fromAssetData.reserveLiquidationThreshold !== "0"
  ) {
    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: Big(fromAmount)
        .mul(fromAssetData.formattedPriceInMarketReferenceCurrency)
        .toString(),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString()
  }

  // HF after swap (same as supply calcs as it needs to calculate as if we where supplying new reserve)
  let hfEffectOfToAmount = "0"
  if (
    (!user.isInIsolationMode && !toAssetData.isIsolated) ||
    (user.isInIsolationMode &&
      user.isolatedReserve?.underlyingAsset === toAssetData.underlyingAsset)
  ) {
    hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: Big(toAmountAfterSlippage)
        .mul(toAssetData.formattedPriceInMarketReferenceCurrency)
        .toString(),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold:
        user.isInEmode &&
        user.userEmodeCategoryId === toAssetData.eModeCategoryId
          ? toAssetData.formattedEModeLiquidationThreshold
          : toAssetData.formattedReserveLiquidationThreshold,
    }).toString()
  }

  return {
    hfEffectOfFromAmount,
    hfAfterSwap:
      user.healthFactor === "-1"
        ? Big("-1")
        : Big(user.healthFactor)
            .plus(hfEffectOfToAmount)
            .minus(hfEffectOfFromAmount),
  }
}

export const calculateHFAfterRepay = ({
  user,
  amountToReceiveAfterSwap,
  amountToSwap,
  fromAssetData,
  toAssetData,
  repayWithUserReserve,
  debt,
}: CalculateHFAfterSwapRepayProps) => {
  // it takes into account if in emode as threshold is different
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  let hfInitialEffectOfFromAmount = "0"

  if (
    repayWithUserReserve?.usageAsCollateralEnabledOnUser &&
    fromAssetData.usageAsCollateralEnabled
  ) {
    hfInitialEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: Big(amountToSwap)
        .mul(fromAssetData.formattedPriceInMarketReferenceCurrency)
        .toString(),
      borrowBalanceMarketReferenceCurrency:
        user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString()
  }

  const fromAmountInMarketReferenceCurrency = Big(
    bigMin(amountToReceiveAfterSwap, debt),
  )
    .mul(toAssetData.priceInUSD)
    .toString()
  let debtLeftInMarketReference = Big(user.totalBorrowsUSD).minus(
    fromAmountInMarketReferenceCurrency,
  )

  debtLeftInMarketReference = bigMax(debtLeftInMarketReference, Big("0"))

  const hfAfterRepayBeforeWithdraw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: debtLeftInMarketReference.toString(),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  })

  const hfRealEffectOfFromAmount =
    fromAssetData.reserveLiquidationThreshold !== "0" &&
    repayWithUserReserve?.usageAsCollateralEnabledOnUser
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: Big(amountToSwap)
            .mul(fromAssetData.priceInUSD)
            .toString(),
          borrowBalanceMarketReferenceCurrency:
            debtLeftInMarketReference.toString(),
          currentLiquidationThreshold:
            fromAssetData.formattedReserveLiquidationThreshold,
        }).toString()
      : "0"

  const hfAfterSwap = hfAfterRepayBeforeWithdraw.eq(-1)
    ? hfAfterRepayBeforeWithdraw
    : hfAfterRepayBeforeWithdraw.minus(hfRealEffectOfFromAmount)

  return {
    hfEffectOfFromAmount: Big(hfInitialEffectOfFromAmount),
    hfAfterSwap:
      hfAfterSwap.isLessThan(0) && !hfAfterSwap.eq(-1) ? 0 : hfAfterSwap,
  }
}

export const calculateHFAfterWithdraw = ({
  user,
  userReserve,
  poolReserve,
  withdrawAmount,
}: CalculateHFAfterWithdrawProps) => {
  let totalCollateralInETHAfterWithdraw = Big(
    user.totalCollateralMarketReferenceCurrency,
  )
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold
  let healthFactorAfterWithdraw = Big(user.healthFactor)

  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold

  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    poolReserve.reserveLiquidationThreshold !== "0"
  ) {
    const amountToWithdrawInEth = Big(withdrawAmount || "0").mul(
      poolReserve.formattedPriceInMarketReferenceCurrency,
    )
    totalCollateralInETHAfterWithdraw = totalCollateralInETHAfterWithdraw.minus(
      amountToWithdrawInEth,
    )

    liquidationThresholdAfterWithdraw = Big(
      user.totalCollateralMarketReferenceCurrency,
    )
      .mul(user.currentLiquidationThreshold)
      .minus(Big(amountToWithdrawInEth).mul(reserveLiquidationThreshold))
      .div(totalCollateralInETHAfterWithdraw)
      .toFixed(4, Big.roundDown)

    const calculatedHFAfterWithdraw = calculateHealthFactorFromBalancesBigUnits(
      {
        collateralBalanceMarketReferenceCurrency:
          totalCollateralInETHAfterWithdraw.toString(),
        borrowBalanceMarketReferenceCurrency:
          user.totalBorrowsMarketReferenceCurrency,
        currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
      },
    ).toString()

    healthFactorAfterWithdraw = Big(calculatedHFAfterWithdraw)
  }

  return healthFactorAfterWithdraw
}

interface CalculateHFAfterSupplyProps {
  user: ExtendedFormattedUser
  poolReserve: ComputedReserveData
  supplyAmount: string
}

export const calculateHFAfterSupply = ({
  user,
  poolReserve,
  supplyAmount,
}: CalculateHFAfterSupplyProps) => {
  const supplyAmountInEth = Big(supplyAmount).mul(
    poolReserve.formattedPriceInMarketReferenceCurrency,
  )

  let healthFactorAfterDeposit = user ? Big(user.healthFactor) : Big("-1")

  const totalCollateralMarketReferenceCurrencyAfter = user
    ? Big(user.totalCollateralMarketReferenceCurrency).plus(supplyAmountInEth)
    : Big("-1")

  const liquidationThresholdAfter = user
    ? Big(user.totalCollateralMarketReferenceCurrency)
        .mul(user.currentLiquidationThreshold)
        .plus(
          supplyAmountInEth.mul(
            poolReserve.formattedReserveLiquidationThreshold,
          ),
        )
        .div(totalCollateralMarketReferenceCurrencyAfter)
    : Big("-1")

  if (
    user &&
    ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  ) {
    const calculatedHFAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency:
        totalCollateralMarketReferenceCurrencyAfter.toString(),
      borrowBalanceMarketReferenceCurrency: Big(
        user.totalBorrowsMarketReferenceCurrency,
      ).toString(),
      currentLiquidationThreshold: liquidationThresholdAfter.toString(),
    }).toString()

    healthFactorAfterDeposit = Big(calculatedHFAfterDeposit)
  }

  return healthFactorAfterDeposit
}
