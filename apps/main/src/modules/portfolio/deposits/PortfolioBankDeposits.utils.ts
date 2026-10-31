import type { BankDepositHistoryEntry } from "@/api/bankDeposits"

import type { PortfolioTransferFilter } from "./PortfolioTransferHistory.utils"

export const filterBankDeposits = (
  samples: readonly BankDepositHistoryEntry[],
  filter: PortfolioTransferFilter,
  search: string,
): BankDepositHistoryEntry[] => {
  const query = search.trim().toLowerCase()

  return samples.filter((sample) => {
    if (
      filter === "pending" &&
      sample.status !== "awaiting" &&
      sample.status !== "processing"
    )
      return false
    if (filter === "completed" && sample.status !== "completed") return false
    if (
      filter === "attention" &&
      sample.status !== "attention" &&
      sample.status !== "failed"
    )
      return false
    if (!query) return true

    return [
      "bank",
      sample.id,
      sample.symbol,
      sample.currency,
      sample.rail,
      sample.status,
      sample.providerStatus,
      sample.amount,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  })
}
