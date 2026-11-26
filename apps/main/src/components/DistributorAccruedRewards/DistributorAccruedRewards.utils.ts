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

/**
 * The same line in two parts, for a layout that sets them apart: how much,
 * and when it becomes claimable, absent for an estimate whose time is unknown.
 */
export const getAccruedStageParts = (
  t: TFunction,
  { stage, amount, claimableAt }: AccruedStage,
  symbol: string,
): { amount: string; when: string | undefined } => {
  const values = { value: amount, symbol, date: claimableAt }
  const from = claimableAt
    ? t("distributorRewards.accrued.claimableFrom", values)
    : undefined

  switch (stage) {
    case "pending":
      return {
        amount: t("distributorRewards.accrued.pendingAmount", values),
        // past its time the root still has to be accepted, by anyone
        when: from ?? t("distributorRewards.accrued.claimableShortly"),
      }
    case "closed":
      return {
        amount: t("distributorRewards.accrued.closedAmount", values),
        when: t("distributorRewards.accrued.notClaimableYet"),
      }
    case "accruing":
      return {
        amount: t("distributorRewards.accrued.accruing", values),
        when: from,
      }
  }
}
