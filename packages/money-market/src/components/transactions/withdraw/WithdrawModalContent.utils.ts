import Big from "big.js"

import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "@/hooks/commonTypes"

export const calculateMaxWithdrawAmount = (
  user: ExtendedFormattedUser,
  userReserve: ComputedUserReserveData,
  poolReserve: ComputedReserveData,
) => {
  const underlyingBalance = Big(userReserve?.underlyingBalance || "0")
  const unborrowedLiquidity = Big(poolReserve.unborrowedLiquidity)
  let maxAmountToWithdraw = Big.min(underlyingBalance, unborrowedLiquidity)
  let maxCollateralToWithdrawInETH = Big("0")
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold
  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    poolReserve.reserveLiquidationThreshold !== "0" &&
    user.totalBorrowsMarketReferenceCurrency !== "0"
  ) {
    // if we have any borrowings we should check how much we can withdraw to a minimum HF of 1.01
    const excessHF = Big(user.healthFactor).minus("1.01")
    if (excessHF.gt("0")) {
      maxCollateralToWithdrawInETH = excessHF
        .mul(user.totalBorrowsMarketReferenceCurrency)
        .div(reserveLiquidationThreshold)
    }
    maxAmountToWithdraw = Big.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.div(
        poolReserve.formattedPriceInMarketReferenceCurrency,
      ),
    )
  }

  return maxAmountToWithdraw
}
