import { type getUserClaimableRewards } from "@galacticcouncil/money-market/utils"
import Big from "big.js"

import { scaleHuman } from "@/utils/formatting"

type UserIncentives = Parameters<
  typeof getUserClaimableRewards
>[0]["calculatedUserIncentives"]

// in dollars; the controller's rewards below it are treated as none
export const MIN_CLAIMABLE_INCENTIVES_USDT = 0.01

export type ControllerReward = {
  rewardTokenAddress: string
  symbol: string
  /** In the reward token's own units. */
  balance: string
  balanceUsd: string
}

/**
 * What the money market's incentives controller holds for the account, one
 * entry per reward token that is worth anything.
 */
export const getControllerRewards = (
  incentives: UserIncentives,
): ControllerReward[] =>
  Object.entries(incentives).flatMap(([rewardTokenAddress, incentive]) => {
    const balance = scaleHuman(
      incentive.claimableRewards.toString(),
      incentive.rewardTokenDecimals,
    )
    const balanceUsd = Big(balance).times(incentive.rewardPriceFeed)

    if (balanceUsd.lte(0)) return []

    return {
      rewardTokenAddress,
      symbol: incentive.rewardTokenSymbol,
      balance,
      balanceUsd: balanceUsd.toString(),
    }
  })

export const getRewardsTotalUsd = (rewards: ControllerReward[]) =>
  rewards.reduce((sum, { balanceUsd }) => sum.plus(balanceUsd), Big(0))
