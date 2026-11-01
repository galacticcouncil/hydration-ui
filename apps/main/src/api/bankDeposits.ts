import { queryOptions } from "@tanstack/react-query"

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
  recipientAddress?: string
}

export type BankDepositHistory = {
  source: "unconfigured" | "provider"
  deposits: BankDepositHistoryEntry[]
}

export const isBankDeposit = (
  entry: unknown,
): entry is BankDepositHistoryEntry =>
  typeof entry === "object" &&
  entry !== null &&
  "kind" in entry &&
  entry.kind === "bank"

// Return no records until the authenticated backend is connected.
// Keep provider credentials server-side and gate that request on the wallet session.
export const bankDepositHistoryQuery = (address: string) =>
  queryOptions({
    queryKey: ["bankDeposits", "history", "unconfigured", address],
    staleTime: Infinity,
    queryFn: async (): Promise<BankDepositHistory> => ({
      source: "unconfigured",
      deposits: [],
    }),
  })
