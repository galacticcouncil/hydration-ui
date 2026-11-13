import type { Address } from "viem"

import { isAsset } from "@/core/assets"
import { Decimal } from "@/core/big"
import type { ClaimableReward, Finding } from "@/types"

export type AssessClaimRequest = {
  /** What the user has accrued, from `summarizeRewards`. */
  claimable: ClaimableReward[]
  /** Every reward token, or the one reward token to claim. */
  reward: "all" | Address
}

export type ClaimAssessment = {
  /** The claimable rewards the selection covers, in `claimable` order. */
  rewards: ClaimableReward[]
  /** The selected rewards' combined USD value. */
  totalUsd: string
  findings: Finding[]
}

/**
 * What claiming `reward` would collect. The controller pays whatever is owed
 * and nothing else can stop it, so the only blocker is having nothing owed.
 */
export function assessClaim({
  claimable,
  reward,
}: AssessClaimRequest): ClaimAssessment {
  const rewards =
    reward === "all"
      ? claimable
      : claimable.filter((entry) => isAsset(entry.rewardTokenAddress, reward))

  const totalAmount = rewards.reduce(
    (total, entry) => total.plus(entry.amount),
    Decimal(0),
  )
  const totalUsd = rewards.reduce(
    (total, entry) => total.plus(entry.amountUsd),
    Decimal(0),
  )

  return {
    rewards,
    totalUsd: totalUsd.toFixed(),
    findings: totalAmount.eq(0)
      ? [{ kind: "blocker", code: "nothingToClaim", params: {} }]
      : [],
  }
}
