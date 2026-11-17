import { type TFunction } from "i18next"

import { type RewardsDistributorAccrued } from "@/api/rewardsDistributor"

type AccruedStage = RewardsDistributorAccrued["stages"][number]

/** One line for rewards that are not claimable yet: how much, and from when. */
export const getAccruedStageText = (
  t: TFunction,
  { stage, amount, claimableAt }: AccruedStage,
  symbol: string,
): string => {
  const values = { value: amount, symbol, date: claimableAt }

  switch (stage) {
    case "pending":
      // past its time the root still has to be accepted, by anyone
      return claimableAt
        ? t("distributorRewards.accrued.pendingFrom", values)
        : t("distributorRewards.accrued.pendingDue", values)
    case "closed":
      return t("distributorRewards.accrued.closed", values)
    case "accruing":
      return claimableAt
        ? t("distributorRewards.accrued.accruingFrom", values)
        : t("distributorRewards.accrued.accruing", values)
  }
}
