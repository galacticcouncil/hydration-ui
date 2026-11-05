import { describe, expect, it } from "vitest"

import { getBankDepositAmountError } from "./BankDepositV2.utils"

describe("bank deposit amount validation", () => {
  it("requires a positive decimal amount without exponent notation", () => {
    expect(getBankDepositAmountError("", "USD")).toBe("required")
    for (const value of [
      "0",
      "-1",
      "NaN",
      "Infinity",
      "1e3",
      "1,000",
      " ",
      "1".repeat(81),
    ])
      expect(getBankDepositAmountError(value, "USD")).toBe("invalid")
  })
  it("enforces the USD deposit minimum at its boundary", () => {
    expect(getBankDepositAmountError("0.99", "USD")).toBe("minimum")
    expect(getBankDepositAmountError("1", "USD")).toBeNull()
    expect(getBankDepositAmountError("1.01", "USD")).toBeNull()
  })
  it("does not invent a EUR minimum or reject supported decimal forms", () => {
    for (const value of [".5", "0.01", "500", "123.45", "1."])
      expect(getBankDepositAmountError(value, "EUR")).toBeNull()
  })
})
