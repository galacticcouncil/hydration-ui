import { queryOptions } from "@tanstack/react-query"

import { getBankDepositPreviewHistory } from "./bankDeposits.preview"

export type BankDepositHistoryEntry = {
  kind: "bank"
  id: string
  amount: string
  symbol: "USD" | "EUR"
  currency: "USD" | "EUR"
  rail: string
  status: "awaiting" | "processing" | "completed" | "attention" | "failed"
  providerStatus: string
  sentAt: number
  destinationAssetId: string
  destinationSymbol: string
}

export type BankDepositHistory = {
  source: "preview" | "provider"
  deposits: BankDepositHistoryEntry[]
}

export const isBankDeposit = (
  entry: unknown,
): entry is BankDepositHistoryEntry =>
  typeof entry === "object" &&
  entry !== null &&
  "kind" in entry &&
  entry.kind === "bank"

// Replace the preview adapter with the authenticated backend request here.
// Keep provider credentials server-side and gate that request on the wallet session.
export const bankDepositHistoryQuery = (address: string) =>
  queryOptions({
    queryKey: ["bankDeposits", "history", "preview", address],
    staleTime: Infinity,
    queryFn: async (): Promise<BankDepositHistory> =>
      getBankDepositPreviewHistory(),
  })
