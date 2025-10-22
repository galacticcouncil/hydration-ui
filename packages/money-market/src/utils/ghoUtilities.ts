import { FormattedGhoReserveData } from "@aave/math-utils"
import Big from "big.js"

import { ComputedReserveData } from "@/hooks/commonTypes"

export const GHO_SYMBOL = "HOLLAR"
export const GHO_ASSET_ID = "222"

/**
 * Determines if GHO is available for borrowing (minting) on the provided network, also based off the token symbol being borrowed
 * @param {GhoUtilMintingAvailableParams} - The reserve symbol and current market name
 * @returns {bool} - If the GHO token is available for minting
 */

export const GHO_SUPPORTED_MARKETS = ["hydration_v3", "hydration_testnet_v3"]

export const isGho = (reserve: ComputedReserveData) => {
  return reserve.symbol === GHO_SYMBOL
}

export const getGhoReserve = (reserves: ComputedReserveData[]) => {
  return reserves.find(isGho)
}

/**
 * Calculates the weighted average APY
 * @param baseVariableBorrowRate - The base variable borrow rate, normalized
 * @param totalBorrowAmount - The total amount of the asset that is being borrowed
 * @param discountableAmount - The amount that can be discounted for the user
 * @param borrowRateAfterDiscount - The borrow rate after the discount is applied
 * @returns
 */
export const weightedAverageAPY = (
  baseVariableBorrowRate: number,
  totalBorrowAmount: number,
  discountableAmount: number,
  borrowRateAfterDiscount: number,
) => {
  if (discountableAmount === 0) return baseVariableBorrowRate
  if (totalBorrowAmount <= discountableAmount) return borrowRateAfterDiscount

  const nonDiscountableAmount = totalBorrowAmount - discountableAmount

  return (
    (nonDiscountableAmount * baseVariableBorrowRate +
      discountableAmount * borrowRateAfterDiscount) /
    totalBorrowAmount
  )
}

/**
 * This helps display the discountable amount of GHO based off of how much is being borrowed and how much is discountable.
 * This is used in both the borrow modal and the discount rate calculator.
 * @param discountableGhoAmount - The amount of GHO that is discountable
 * @param amountGhoBeingBorrowed - The amount of GHO requesting to be borrowed
 * @returns The amount of discountable GHO as a number in a display-friendly form
 */
export const displayDiscountableAmount = (
  discountableGhoAmount: number,
  amountGhoBeingBorrowed: number,
): number => {
  return discountableGhoAmount >= amountGhoBeingBorrowed
    ? amountGhoBeingBorrowed
    : discountableGhoAmount
}

/**
 * This helps display the non-discountable amount of GHO based off of how much is being borrowed and how much is discountable.
 * This is used in both the borrow modal and the discount rate calculator.
 * @param discountableGhoAmount - The amount of GHO that is discountable
 * @param amountGhoBeingBorrowed - The amount of GHO requesting to be borrowed
 * @returns The amount of non-discountable GHO as a number in a display-friendly form
 */
export const displayNonDiscountableAmount = (
  discountableGhoAmount: number,
  amountGhoBeingBorrowed: number,
): number => {
  return discountableGhoAmount >= amountGhoBeingBorrowed
    ? 0
    : amountGhoBeingBorrowed - discountableGhoAmount
}

interface ReserveWithSymbol {
  symbol: string
}

type FindAndFilterReturn<T> = {
  value: T | undefined
  filtered: Array<T>
}

export const findAndFilterGhoReserve = <T extends ReserveWithSymbol>(
  reserves: Array<T>,
) => {
  return reserves.reduce<FindAndFilterReturn<T>>(
    (acum, reserve) => {
      if (reserve.symbol === GHO_SYMBOL)
        return { value: reserve, filtered: acum.filtered }
      else return { ...acum, filtered: acum.filtered.concat(reserve) }
    },
    {
      value: undefined,
      filtered: [],
    },
  )
}

export const formatGhoReserve = (
  reserve: ComputedReserveData,
  ghoReserveData: FormattedGhoReserveData,
) => {
  const borrowCap = Big(ghoReserveData.aaveFacilitatorBucketMaxCapacity)

  return {
    ...reserve,
    borrowCap: borrowCap.toString(),
    borrowCapUSD: borrowCap.times(reserve.priceInUSD).toString(),
  }
}
