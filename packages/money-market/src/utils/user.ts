import {
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
} from "@aave/math-utils"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"

import { ComputedReserveData, ExtendedFormattedUser } from "@/hooks"
import { isGho, weightedAverageAPY } from "@/utils/ghoUtilities"

export const getUserLoanToValue = (user: ExtendedFormattedUser) => {
  if (!user || user.totalCollateralMarketReferenceCurrency === "0") return "0"

  return Big(user.totalBorrowsMarketReferenceCurrency)
    .div(user.totalCollateralMarketReferenceCurrency)
    .toString()
}

type UserClaimableRewards = {
  claimableRewardsUsd: number
  assets: string[]
}

export const getUserClaimableRewards = (
  user: ExtendedFormattedUser,
): UserClaimableRewards => {
  const rewards = Object.entries(user.calculatedUserIncentives).reduce(
    (acc, [, incentive]) => {
      const rewardBalance = bigShift(
        incentive.claimableRewards.toString(),
        -incentive.rewardTokenDecimals,
      )

      const rewardBalanceUsd = rewardBalance.times(incentive.rewardPriceFeed)

      if (rewardBalanceUsd.gt(0)) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol)
        }

        acc.claimableRewardsUsd = rewardBalanceUsd.plus(acc.claimableRewardsUsd)
      }

      return acc
    },
    { claimableRewardsUsd: Big(0), assets: [] } as {
      claimableRewardsUsd: Big
      assets: string[]
    },
  )

  return {
    assets: rewards.assets,
    claimableRewardsUsd: rewards.claimableRewardsUsd.toNumber(),
  }
}

/**
 * Original AAVE calculation of earnedAPY, debtAPY, netAPY.
 * Touch at your own risk.
 */
export const getUserApyValues = (
  user: FormatUserSummaryAndIncentivesResponse,
  reserves: ComputedReserveData[],
  ghoUserData: FormattedGhoUserData,
  ghoReserve: FormattedGhoReserveData,
) => {
  const proportions = user.userReservesData.reduce(
    (acc, value) => {
      const reserve = reserves.find(
        (r) => r.underlyingAsset === value.reserve.underlyingAsset,
      )

      if (reserve) {
        if (value.underlyingBalanceUSD !== "0") {
          acc.positiveProportion = acc.positiveProportion.plus(
            Big(reserve.supplyAPY).mul(value.underlyingBalanceUSD),
          )
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                Big(incentive.incentiveAPR).mul(value.underlyingBalanceUSD),
              )
            })
          }
        }
        if (value.variableBorrowsUSD !== "0") {
          if (isGho(reserve)) {
            const borrowRateAfterDiscount = weightedAverageAPY(
              ghoReserve.ghoVariableBorrowAPY,
              ghoUserData.userGhoBorrowBalance,
              ghoUserData.userGhoAvailableToBorrowAtDiscount,
              ghoReserve.ghoBorrowAPYWithMaxDiscount,
            )
            acc.negativeProportion = acc.negativeProportion.plus(
              Big(borrowRateAfterDiscount).mul(
                ghoUserData.userGhoBorrowBalance,
              ),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  Big(incentive.incentiveAPR).mul(
                    ghoUserData.userGhoBorrowBalance,
                  ),
                )
              })
            }
          } else {
            acc.negativeProportion = acc.negativeProportion.plus(
              Big(reserve.variableBorrowAPY).mul(value.variableBorrowsUSD),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  Big(incentive.incentiveAPR).mul(value.variableBorrowsUSD),
                )
              })
            }
          }
        }
        if (value.stableBorrowsUSD !== "0") {
          acc.negativeProportion = acc.negativeProportion.plus(
            Big(value.stableBorrowAPY).mul(value.stableBorrowsUSD),
          )
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                Big(incentive.incentiveAPR).mul(value.stableBorrowsUSD),
              )
            })
          }
        }
      } else {
        throw new Error("not possible to calculate net apy")
      }

      return acc
    },
    {
      positiveProportion: Big(0),
      negativeProportion: Big(0),
    },
  )

  const earnedAPY = Big(user.totalLiquidityUSD).gt(0)
    ? proportions.positiveProportion.div(user.totalLiquidityUSD).toNumber()
    : 0
  const debtAPY = Big(user.totalBorrowsUSD).gt(0)
    ? proportions.negativeProportion.div(user.totalBorrowsUSD).toNumber()
    : 0

  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1")) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1"))

  return {
    earnedAPY,
    debtAPY,
    netAPY,
  }
}
