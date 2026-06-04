import {
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
} from "@aave/math-utils"
import {
  bigShift,
  getAddressFromAssetId,
  getAssetIdFromAddress,
} from "@galacticcouncil/utils"
import Big from "big.js"

import { ComputedReserveData, ExtendedFormattedUser } from "@/hooks"
import { ExternalApyData } from "@/types"
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
  user: FormatUserSummaryAndIncentivesResponse<ComputedReserveData>,
  ghoUserData: FormattedGhoUserData,
  ghoReserve: FormattedGhoReserveData,
  externalApyData: ExternalApyData = new Map(),
) => {
  const externalApyAddresses = new Set(
    [...externalApyData.keys()].map(getAddressFromAssetId),
  )

  let positiveProportion = Big(0)
  let negativeProportion = Big(0)

  for (const value of user.userReservesData) {
    const { reserve } = value

    const hasExternalApy = externalApyAddresses.has(reserve.underlyingAsset)
    const externalApy = externalApyData.get(
      getAssetIdFromAddress(reserve.underlyingAsset),
    )
    const isInvalidApy =
      hasExternalApy &&
      (externalApy?.supplyApy === null || externalApy?.borrowApy === null)

    if (isInvalidApy) {
      return { earnedAPY: null, debtAPY: null, netAPY: null }
    }

    if (value.underlyingBalanceUSD !== "0") {
      positiveProportion = positiveProportion.plus(
        Big(reserve.supplyAPY).mul(value.underlyingBalanceUSD),
      )
      if (!hasExternalApy && reserve.aIncentivesData) {
        reserve.aIncentivesData.forEach((incentive) => {
          positiveProportion = positiveProportion.plus(
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
        negativeProportion = negativeProportion.plus(
          Big(borrowRateAfterDiscount).mul(ghoUserData.userGhoBorrowBalance),
        )
        if (!hasExternalApy && reserve.vIncentivesData) {
          reserve.vIncentivesData.forEach((incentive) => {
            positiveProportion = positiveProportion.plus(
              Big(incentive.incentiveAPR).mul(ghoUserData.userGhoBorrowBalance),
            )
          })
        }
      } else {
        negativeProportion = negativeProportion.plus(
          Big(reserve.variableBorrowAPY).mul(value.variableBorrowsUSD),
        )
        if (!hasExternalApy && reserve.vIncentivesData) {
          reserve.vIncentivesData.forEach((incentive) => {
            positiveProportion = positiveProportion.plus(
              Big(incentive.incentiveAPR).mul(value.variableBorrowsUSD),
            )
          })
        }
      }
    }
    if (value.stableBorrowsUSD !== "0") {
      negativeProportion = negativeProportion.plus(
        Big(value.stableBorrowAPY).mul(value.stableBorrowsUSD),
      )
      if (!hasExternalApy && reserve.sIncentivesData) {
        reserve.sIncentivesData.forEach((incentive) => {
          positiveProportion = positiveProportion.plus(
            Big(incentive.incentiveAPR).mul(value.stableBorrowsUSD),
          )
        })
      }
    }
  }

  const earnedAPY = Big(user.totalLiquidityUSD).gt(0)
    ? positiveProportion.div(user.totalLiquidityUSD).toNumber()
    : 0
  const debtAPY = Big(user.totalBorrowsUSD).gt(0)
    ? negativeProportion.div(user.totalBorrowsUSD).toNumber()
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
