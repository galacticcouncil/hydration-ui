import { normalize, UserIncentiveData } from "@aave/math-utils"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useClaimableRewards = () => {
  const { user, loading } = useAppDataContext()

  const rewards = Object.keys(user.calculatedUserIncentives).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData =
        user.calculatedUserIncentives[rewardTokenAddress]
      const rewardBalance = normalize(
        incentive.claimableRewards,
        incentive.rewardTokenDecimals,
      )

      const tokenPrice = Number(incentive.rewardPriceFeed)
      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice

      if (rewardBalanceUsd > 0) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol)
        }

        acc.claimableRewardsUsd += Number(rewardBalanceUsd)
      }

      return acc
    },
    { claimableRewardsUsd: 0, assets: [] } as {
      claimableRewardsUsd: number
      assets: string[]
    },
  )

  return {
    ...rewards,
    loading,
  }
}
