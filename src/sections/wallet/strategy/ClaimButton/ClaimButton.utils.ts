import { useCallback } from "react"
import { useClaimRewards } from "sections/lending/components/transactions/ClaimRewards/ClaimRewardsActions.utils"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useUserRewards } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"

export const useClaimGdotReward = () => {
  const { user, loading } = useAppDataContext()
  const reward = useUserRewards([GDOT_STABLESWAP_ASSET_ID])
  const incentive = !loading
    ? user.calculatedUserIncentives?.[reward.rewardTokenAddress]
    : undefined

  const { mutate: claimRewards } = useClaimRewards()

  const action = useCallback(() => {
    claimRewards({
      selectedReward: reward,
      isWrongNetwork: false,
      blocked: false,
      claimableUsd: reward.balanceUsd,
    })
  }, [claimRewards, reward])

  return {
    action,
    reward,
    incentive,
  }
}
