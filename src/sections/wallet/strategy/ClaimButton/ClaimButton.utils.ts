import { ProtocolAction } from "@aave/contract-helpers"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { useUserRewards } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"

export const useClaimGdotReward = () => {
  const { user, loading } = useAppDataContext()
  const reward = useUserRewards([GDOT_STABLESWAP_ASSET_ID])
  const incentive = !loading
    ? user.calculatedUserIncentives?.[reward.rewardTokenAddress]
    : undefined

  const claimRewards = useRootStore((state) => state.claimRewards)

  const { action } = useTransactionHandler({
    protocolAction: ProtocolAction.claimRewards,
    tryPermit: false,
    handleGetTxns: async () => {
      return claimRewards({
        selectedReward: reward,
        isWrongNetwork: false,
        blocked: false,
        claimableUsd: reward.balanceUsd,
      })
    },
    deps: [reward],
  })

  return {
    action,
    reward,
    incentive,
  }
}
