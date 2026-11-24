import { useMoneyMarket } from "@galacticcouncil/money-market/react"
import { useTranslation } from "react-i18next"

import {
  getHollarDebtChangeNotice,
  useRewardsProgram,
} from "@/api/rewardsDistributor"
import { getRewardsProgramNoticeValues } from "@/modules/money-market/rewards/RewardsProgramNotice.utils"

/**
 * The HOLLAR debt notice for a borrow or repay of `asset` worth `changeUsd`
 * (negative for a repay); undefined for other assets or no change in earning.
 */
export const useHollarDebtRewardsNotice = (
  asset: string,
  changeUsd: string,
) => {
  const { t } = useTranslation("borrow")
  const { market } = useMoneyMarket()
  const program = useRewardsProgram()

  const isHollar =
    asset.toLowerCase() === market.addresses.HOLLAR_TOKEN.toLowerCase()
  const notice = isHollar
    ? getHollarDebtChangeNotice(program, changeUsd)
    : undefined
  if (!notice) return undefined

  const values = getRewardsProgramNoticeValues(program)

  return notice === "notEarning"
    ? {
        variant: "warning" as const,
        description: t("distributorRewards.notEarning.hollarDebt", values),
      }
    : {
        variant: "info" as const,
        description: t("distributorRewards.earningResumes", values),
      }
}
