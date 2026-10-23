import { describe, expect, it } from "vitest"

import {
  getBankWithdrawalAmountError,
  getBankWithdrawalQuote,
  getDemoWithdrawalBank,
} from "./BankWithdraw.utils"

describe("bank withdrawal preview", () => {
  it("subtracts the illustrative fee before conversion and rounds the bank amount down", () => {
    expect(getBankWithdrawalQuote("100.01", "EUR")).toEqual({
      amount: "100.01",
      fee: "0.50005",
      rate: "0.92",
      received: "91.54",
      currency: "EUR",
    })
    expect(getBankWithdrawalQuote("100", "USD")?.received).toBe("99.50")
  })
  it("keeps decimal arithmetic exact", () => {
    expect(getBankWithdrawalQuote("0.1", "USD")).toMatchObject({
      fee: "0.0005",
      received: "0.09",
    })
  })
  it("does not create a preview quote for empty, negative, invalid, or zero amounts", () => {
    for (const value of [
      "",
      "0",
      "-1",
      "1e6",
      "Infinity",
      "NaN",
      "12.4.5",
      "0x123",
      " ",
    ]) {
      expect(getBankWithdrawalQuote(value, "USD")).toBeNull()
    }
    expect(getBankWithdrawalAmountError("", "USD")).toBe("required")
    expect(getBankWithdrawalAmountError("-1", "USD")).toBe("invalid")
  })
  it("rejects an amount that rounds to no bank proceeds", () => {
    expect(getBankWithdrawalQuote("0.001", "EUR")).toBeNull()
    expect(getBankWithdrawalAmountError("0.001", "EUR")).toBe("tooSmall")
    expect(getBankWithdrawalAmountError("10", "EUR")).toBeNull()
  })
  it("uses distinct, non-routable demo payout details for each currency", () => {
    expect(getDemoWithdrawalBank("USD").account).toBe("DEMO-USD-ACCOUNT")
    expect(getDemoWithdrawalBank("EUR").account).toBe("DEMO-IBAN-NOT-VALID")
    expect(getDemoWithdrawalBank("USD").routing).not.toBe(
      getDemoWithdrawalBank("EUR").routing,
    )
  })
})
