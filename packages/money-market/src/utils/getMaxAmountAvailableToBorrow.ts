import { InterestRate } from "@aave/contract-helpers"
import { FormatUserSummaryAndIncentivesResponse } from "@aave/math-utils"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { ethers } from "ethers"

import { ComputedReserveData, ExtendedFormattedUser } from "@/hooks/commonTypes"

import { roundToTokenDecimals } from "./utils"

// Subset of ComputedReserveData
interface PoolReserveBorrowSubset {
  borrowCap: string
  availableLiquidityUSD: string
  totalDebt: string
  isFrozen: boolean
  decimals: number
  formattedAvailableLiquidity: string
  formattedPriceInMarketReferenceCurrency: string
  borrowCapUSD: string
}

/**
 * Calculates the maximum amount a user can borrow.
 * @param poolReserve
 * @param userReserve
 * @param user
 */
export function getMaxAmountAvailableToBorrow(
  poolReserve: PoolReserveBorrowSubset,
  user: FormatUserSummaryAndIncentivesResponse,
  rateMode: InterestRate,
): string {
  const availableInPoolUSD = poolReserve.availableLiquidityUSD
  const availableForUserUSD = Big.min(
    user.availableBorrowsUSD,
    availableInPoolUSD,
  )

  const availableBorrowCap =
    poolReserve.borrowCap === "0"
      ? Big(ethers.constants.MaxUint256.toString())
      : Big(Number(poolReserve.borrowCap)).minus(poolReserve.totalDebt)
  const availableLiquidity = Big.max(
    Big.min(
      poolReserve.formattedAvailableLiquidity,
      availableBorrowCap.toString(),
    ),
    0,
  )

  const availableForUserMarketReferenceCurrency = Big(
    user?.availableBorrowsMarketReferenceCurrency || 0,
  ).div(poolReserve.formattedPriceInMarketReferenceCurrency)

  let maxUserAmountToBorrow = Big.min(
    availableForUserMarketReferenceCurrency.toString(),
    availableLiquidity,
  )

  if (rateMode === InterestRate.Stable) {
    maxUserAmountToBorrow = Big.min(
      maxUserAmountToBorrow,
      // TODO: put MAX_STABLE_RATE_BORROW_SIZE_PERCENT on uipooldataprovider instead of using the static value here
      Big(poolReserve.formattedAvailableLiquidity).mul(0.25),
    )
  }

  const shouldAddMargin =
    /**
     * When the user is trying to do a max borrow
     */
    maxUserAmountToBorrow.gte(availableForUserMarketReferenceCurrency) ||
    /**
     * When a user has borrows we assume the debt is increasing faster then the supply.
     * That's a simplification that might not be true, but doesn't matter in most cases.
     */
    (user.totalBorrowsMarketReferenceCurrency !== "0" &&
      availableForUserUSD.lt(availableInPoolUSD)) ||
    /**
     * When the user could in theory borrow all, but the debt accrues the available decreases from block to block.
     */
    (availableForUserUSD.eq(availableInPoolUSD) &&
      poolReserve.totalDebt !== "0") ||
    /**
     * When borrow cap could be reached and debt accumulates the debt would be surpassed.
     */
    (poolReserve.borrowCapUSD &&
      poolReserve.totalDebt !== "0" &&
      availableForUserUSD.gte(availableInPoolUSD)) ||
    /**
     * When the user would be able to borrow all the remaining ceiling we need to add a margin as existing debt.
     */
    (user.isInIsolationMode &&
      user.isolatedReserve?.isolationModeTotalDebt !== "0" &&
      // TODO: would be nice if userFormatter contained formatted reserve as this math is done twice now
      bigShift(
        Big(user.isolatedReserve?.debtCeiling || "0").minus(
          user.isolatedReserve?.isolationModeTotalDebt || "0",
        ),
        -(user.isolatedReserve?.debtCeilingDecimals || 0),
      )
        .mul("0.99")
        .lt(user.availableBorrowsUSD))

  const amountWithMargin = shouldAddMargin
    ? maxUserAmountToBorrow.mul("0.99")
    : maxUserAmountToBorrow
  return roundToTokenDecimals(amountWithMargin.toString(), poolReserve.decimals)
}

/**
 * Calculates the maximum amount of GHO a user can mint
 * @param user
 */
export function getMaxGhoMintAmount(
  user: FormatUserSummaryAndIncentivesResponse,
  poolReserve: PoolReserveBorrowSubset,
) {
  const userAvailableBorrows = Big(
    user?.availableBorrowsMarketReferenceCurrency || 0,
  )

  const availableBorrowCap =
    poolReserve.borrowCap === "0"
      ? Big(ethers.constants.MaxUint256.toString())
      : Big(Number(poolReserve.borrowCap)).minus(poolReserve.totalDebt)

  const maxAmountUserCanMint = Big.max(
    Big.min(userAvailableBorrows, availableBorrowCap),
    0,
  )

  const shouldAddMargin =
    /**
     * When a user has borrows we assume the debt is increasing faster then the supply.
     * That's a simplification that might not be true, but doesn't matter in most cases.
     */
    user.totalBorrowsMarketReferenceCurrency !== "0" ||
    /**
     * When borrow cap could be reached and debt accumulates the debt would be surpassed.
     */
    (poolReserve.borrowCapUSD &&
      poolReserve.totalDebt !== "0" &&
      maxAmountUserCanMint.gte(availableBorrowCap)) ||
    /**
     * When the user would be able to borrow all the remaining ceiling we need to add a margin as existing debt.
     */
    (user.isInIsolationMode &&
      user.isolatedReserve?.isolationModeTotalDebt !== "0" &&
      // TODO: would be nice if userFormatter contained formatted reserve as this math is done twice now
      bigShift(
        Big(user.isolatedReserve?.debtCeiling || "0").minus(
          user.isolatedReserve?.isolationModeTotalDebt || "0",
        ),
        -(user.isolatedReserve?.debtCeilingDecimals || 0),
      )
        .mul("0.99")
        .lt(user.availableBorrowsUSD))

  const amountWithMargin = shouldAddMargin
    ? maxAmountUserCanMint.mul("0.99")
    : maxAmountUserCanMint
  return roundToTokenDecimals(amountWithMargin.toString(), 18)
}

export function assetCanBeBorrowedByUser(
  {
    borrowingEnabled,
    isActive,
    borrowableInIsolation,
    eModeCategoryId,
    isFrozen,
    isPaused,
  }: ComputedReserveData,
  user: ExtendedFormattedUser,
) {
  if (!borrowingEnabled || !isActive || isFrozen || isPaused) return false
  if (user?.isInEmode && eModeCategoryId !== user.userEmodeCategoryId)
    return false
  if (user?.isInIsolationMode && !borrowableInIsolation) return false
  return true
}
