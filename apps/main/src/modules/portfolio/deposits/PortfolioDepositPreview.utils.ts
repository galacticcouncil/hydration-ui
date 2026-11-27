import type { SortingState } from "@tanstack/react-table"

import type { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"

export type PortfolioDepositPreviewFilter =
  | "all"
  | "pending"
  | "completed"
  | "attention"

export const getPortfolioDepositSamples = (
  samples: PortfolioDepositSample[],
  claimedIds: readonly string[],
): PortfolioDepositSample[] =>
  samples.map((sample) =>
    sample.status === "claimable" && claimedIds.includes(sample.id)
      ? { ...sample, status: "completed" }
      : sample,
  )

export const getClaimablePortfolioDepositSamples = (
  samples: PortfolioDepositSample[],
) => samples.filter(({ status }) => status === "claimable")

export const filterPortfolioDepositSamples = (
  samples: PortfolioDepositSample[],
  filter: PortfolioDepositPreviewFilter,
) =>
  samples.filter(({ status }) => {
    if (filter === "completed") return status === "completed"
    if (filter === "attention")
      return (
        status === "claimable" || status === "attention" || status === "failed"
      )
    if (filter === "pending")
      return ["awaiting", "processing", "confirming", "claimable"].includes(
        status,
      )
    return true
  })

export const PORTFOLIO_DEPOSIT_CLAIM_PRIORITY = "claimPriority"

export const prioritizeClaimableDepositSorting = (
  sorting: SortingState,
): SortingState => [
  { id: PORTFOLIO_DEPOSIT_CLAIM_PRIORITY, desc: true },
  ...sorting.filter(({ id }) => id !== PORTFOLIO_DEPOSIT_CLAIM_PRIORITY),
]
