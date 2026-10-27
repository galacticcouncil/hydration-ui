import { describe, expect, it } from "vitest"

import { getMultiplyUnavailableReason } from "@/modules/strategies/multiply/utils/availability"

const reserve = {
  isActive: true,
  isFrozen: false,
  isPaused: false,
  isIsolated: false,
  borrowingEnabled: true,
  borrowableInIsolation: false,
  availableDebtCeilingUsd: "0",
  borrowCap: "0",
  totalDebt: "0",
}

const prime = {
  ...reserve,
  isIsolated: true,
  availableDebtCeilingUsd: "5671942",
}
const hollar = { ...reserve, borrowableInIsolation: true }

describe("getMultiplyUnavailableReason", () => {
  it("is available for PRIME/HOLLAR with ceiling headroom", () => {
    expect(getMultiplyUnavailableReason(prime, hollar)).toBeNull()
  })

  it("flags a frozen or paused reserve", () => {
    expect(
      getMultiplyUnavailableReason({ ...prime, isFrozen: true }, hollar),
    ).toBe("reserveFrozen")
    expect(
      getMultiplyUnavailableReason(prime, { ...hollar, isPaused: true }),
    ).toBe("reserveFrozen")
  })

  it("flags debt that cannot be borrowed against isolated collateral", () => {
    expect(
      getMultiplyUnavailableReason(prime, {
        ...hollar,
        borrowableInIsolation: false,
      }),
    ).toBe("notBorrowable")
  })

  it("flags a full isolation debt ceiling", () => {
    expect(
      getMultiplyUnavailableReason(
        { ...prime, availableDebtCeilingUsd: "0" },
        hollar,
      ),
    ).toBe("debtCeiling")
  })

  it("flags a reached borrow cap, and ignores an uncapped reserve", () => {
    expect(
      getMultiplyUnavailableReason(prime, {
        ...hollar,
        borrowCap: "100",
        totalDebt: "100",
      }),
    ).toBe("borrowCap")
    expect(
      getMultiplyUnavailableReason(prime, { ...hollar, totalDebt: "100" }),
    ).toBeNull()
  })
})
