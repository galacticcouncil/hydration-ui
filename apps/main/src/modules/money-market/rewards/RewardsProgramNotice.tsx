import { Alert } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRewardsProgram } from "@/api/rewardsDistributor"

/** Tells a supplier of an earning asset why the reward program pays it nothing. */
export const RewardsProgramNotice: FC = () => {
  const { t } = useTranslation("borrow")
  const { latest, notEarningReason, maxHollarDebtUsd } = useRewardsProgram()

  if (!latest || !notEarningReason) return null

  // not `symbol`: the currency formatter would print the allowance in it
  const values = {
    reward: latest.reward.symbol,
    assets: Object.keys(latest.assets).join(", "),
    value: maxHollarDebtUsd,
  }

  return (
    <Alert
      variant="warning"
      description={
        notEarningReason === "hollar_debt"
          ? t("distributorRewards.notEarning.hollarDebt", values)
          : t("distributorRewards.notEarning.excluded", values)
      }
    />
  )
}
