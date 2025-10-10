import { Reward } from "sections/lending/helpers/types"

import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { useClaimMoneyMarketRewards } from "sections/lending/components/transactions/ClaimRewards/ClaimRewardsActions.utils"

export type ClaimRewardsActionsProps = {
  isWrongNetwork?: boolean
  blocked: boolean
  claimableUsd: string
  selectedReward: Reward
}

export const ClaimRewardsActions = ({
  isWrongNetwork = false,
  blocked,
  claimableUsd,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const { t } = useTranslation()

  const { mutate, isLoading } = useClaimMoneyMarketRewards()

  return (
    <Button
      variant="primary"
      disabled={isLoading}
      onClick={() =>
        mutate({
          isWrongNetwork,
          blocked,
          selectedReward,
          claimableUsd,
        })
      }
      size="medium"
      type="button"
      isLoading={isLoading}
    >
      {selectedReward.symbol === "all"
        ? t("lending.claimAllRewards.cta")
        : t("lending.claimRewards.cta", { symbol: selectedReward.symbol })}
    </Button>
  )
}
