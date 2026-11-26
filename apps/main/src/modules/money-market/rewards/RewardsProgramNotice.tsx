import { Alert } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRewardsProgram } from "@/api/rewardsDistributor"
import { getRewardsProgramNoticeValues } from "@/modules/money-market/rewards/RewardsProgramNotice.utils"

/**
 * Why a supplier of an earning asset earns nothing, or that it earns again
 * after a HOLLAR repay. Silent until its positions are read.
 */
export const RewardsProgramNotice: FC = () => {
  const { t } = useTranslation("borrow")
  const program = useRewardsProgram()
  const { latest, notEarningReason, earningResumes, suppliesEarningAsset } =
    program

  if (
    !latest ||
    !suppliesEarningAsset ||
    (!notEarningReason && !earningResumes)
  ) {
    return null
  }

  const values = getRewardsProgramNoticeValues(program)

  if (earningResumes) {
    return (
      <Alert
        variant="info"
        description={t("distributorRewards.earningResumes", values)}
      />
    )
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
