import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"

import { filterBankDeposits } from "@/modules/portfolio/deposits/PortfolioBankDeposits.utils"

import {
  BankDepositHistoryEntry,
  bankDepositHistoryQuery,
  isBankDeposit,
} from "./bankDeposits"

const deposits: BankDepositHistoryEntry[] = [
  {
    kind: "bank",
    id: "completed",
    amount: "250",
    symbol: "EUR",
    currency: "EUR",
    rail: "SEPA",
    status: "completed",
    providerStatus: "Credited",
    sentAt: 123,
    destinationAssetId: "222",
    destinationSymbol: "HOLLAR",
  },
  {
    kind: "bank",
    id: "returned",
    amount: "100",
    symbol: "USD",
    currency: "USD",
    rail: "ACH / wire",
    status: "failed",
    providerStatus: "Returned",
    sentAt: 456,
    destinationAssetId: "222",
    destinationSymbol: "HOLLAR",
  },
]

describe("bank deposit history", () => {
  it.each(["", "alice"])(
    "returns no samples for account %j while the API is unconfigured",
    async (address) => {
      const query = bankDepositHistoryQuery(address)
      const client = new QueryClient()
      expect(await client.fetchQuery(query)).toEqual({
        source: "unconfigured",
        deposits: [],
      })
      client.clear()
    },
  )

  it("filters bank records by status, currency and provider status", () => {
    expect(
      filterBankDeposits(deposits, "completed", "").map((row) => row.id),
    ).toEqual(["completed"])
    expect(
      filterBankDeposits(deposits, "attention", "").map((row) => row.id),
    ).toEqual(["returned"])
    expect(filterBankDeposits(deposits, "pending", "")).toEqual([])
    expect(
      filterBankDeposits(deposits, "all", " EUR ").map((row) => row.id),
    ).toEqual(["completed"])
    expect(
      filterBankDeposits(deposits, "all", "Returned").map((row) => row.id),
    ).toEqual(["returned"])
  })

  it("keeps bank records distinct from on-chain claims and isolates accounts", () => {
    expect(isBankDeposit(deposits[0])).toBe(true)
    expect(isBankDeposit(null)).toBe(false)
    expect(isBankDeposit({ correlationId: "on-chain-journey" })).toBe(false)
    expect(bankDepositHistoryQuery("alice").queryKey).not.toEqual(
      bankDepositHistoryQuery("bob").queryKey,
    )
  })
})
