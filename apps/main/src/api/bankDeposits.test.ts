import { describe, expect, it } from "vitest"

import { filterBankDeposits } from "@/modules/portfolio/deposits/PortfolioBankDeposits.utils"
import { exampleDeposits } from "@/modules/ramp/deposit.mock"

import { bankDepositHistoryQuery, isBankDeposit } from "./bankDeposits"
import { getBankDepositPreviewHistory } from "./bankDeposits.preview"

describe("bank deposit history adapter", () => {
  it("uses the bank-flow records and preserves fiat amounts without inventing settlement values", () => {
    const history = getBankDepositPreviewHistory()
    expect(history.source).toBe("preview")
    expect(history.deposits).toHaveLength(exampleDeposits.length)
    history.deposits.forEach((record, i) => {
      const original = exampleDeposits[i]!
      expect(record).toMatchObject({
        id: original.id,
        amount: original.amount,
        currency: original.currency,
        symbol: original.currency,
        providerStatus: original.status,
        sentAt: original.sentAt,
        destinationSymbol: "HOLLAR",
      })
      expect(Number.isFinite(record.sentAt)).toBe(true)
      expect(isBankDeposit(record)).toBe(true)
    })
  })

  it("maps provider states into portfolio filters", () => {
    const { deposits } = getBankDepositPreviewHistory()
    expect(
      filterBankDeposits(deposits, "completed", "").map((row) => row.id),
    ).toEqual(["deposit-002"])
    expect(
      filterBankDeposits(deposits, "attention", "").map((row) => row.id),
    ).toEqual(["deposit-001", "deposit-003"])
    expect(filterBankDeposits(deposits, "pending", "")).toEqual([])
    expect(
      filterBankDeposits(deposits, "all", " EUR ").map((row) => row.id),
    ).toEqual(["deposit-002"])
    expect(
      filterBankDeposits(deposits, "all", "Returned").map((row) => row.id),
    ).toEqual(["deposit-003"])
  })

  it("keeps bank records distinct from on-chain claims", () => {
    expect(isBankDeposit(null)).toBe(false)
    expect(isBankDeposit({ correlationId: "on-chain-journey" })).toBe(false)
    expect(bankDepositHistoryQuery("alice").queryKey).not.toEqual(
      bankDepositHistoryQuery("bob").queryKey,
    )
  })
})
