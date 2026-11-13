import { describe, expect, it } from "vitest"

import {
  type AvailabilityContext,
  getMultiplyUnavailableReason,
} from "@/modules/strategies/multiply/utils/availability"

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
  supplyCap: "0",
  totalLiquidity: "0",
  availableLiquidity: "1000",
  priceInUsd: "1",
}

const prime = {
  ...reserve,
  isIsolated: true,
  availableDebtCeilingUsd: "5671942",
}
const hollar = { ...reserve, borrowableInIsolation: true }

const ok: AvailabilityContext = {
  sameAsset: false,
  maxLeverage: 5,
  hasAToken: true,
  hollarRoom: "1000",
}
const check = (
  c: typeof reserve,
  d: typeof reserve,
  ctx: Partial<AvailabilityContext> = {},
) => getMultiplyUnavailableReason(c, d, { ...ok, ...ctx })

describe("getMultiplyUnavailableReason", () => {
  it("is available for PRIME/HOLLAR with ceiling and bucket headroom", () => {
    expect(check(prime, hollar)).toBeNull()
  })

  it("rejects the same asset on both sides first", () => {
    expect(check(prime, prime, { sameAsset: true })).toBe("sameAsset")
  })

  it("flags a frozen or paused reserve", () => {
    expect(check({ ...prime, isFrozen: true }, hollar)).toBe("reserveFrozen")
    expect(check(prime, { ...hollar, isPaused: true })).toBe("reserveFrozen")
  })

  it("flags a collateral with no leverage (LTV or LT of 0)", () => {
    expect(check(prime, hollar, { maxLeverage: 1 })).toBe("notCollateral")
  })

  it("flags debt with borrowing disabled", () => {
    expect(check(prime, { ...hollar, borrowingEnabled: false })).toBe(
      "notBorrowable",
    )
  })

  it("flags a zero price and a missing aToken", () => {
    expect(check(prime, { ...hollar, priceInUsd: "0" })).toBe("noPrice")
    expect(check(prime, hollar, { hasAToken: false })).toBe("noAToken")
  })

  it("flags a full collateral supply cap before ramp stalls", () => {
    expect(
      check(
        { ...prime, supplyCap: "100", totalLiquidity: "100" },
        { ...hollar, borrowableInIsolation: false },
      ),
    ).toBe("supplyCap")
    expect(check({ ...prime, totalLiquidity: "100" }, hollar)).toBeNull()
  })

  it("flags debt that cannot be borrowed against isolated collateral", () => {
    expect(check(prime, { ...hollar, borrowableInIsolation: false })).toBe(
      "isolated",
    )
  })

  it("flags a full isolation debt ceiling", () => {
    expect(check({ ...prime, availableDebtCeilingUsd: "0" }, hollar)).toBe(
      "debtCeiling",
    )
  })

  it("flags a reached borrow cap, and ignores an uncapped reserve", () => {
    expect(
      check(prime, { ...hollar, borrowCap: "100", totalDebt: "100" }),
    ).toBe("borrowCap")
    expect(check(prime, { ...hollar, totalDebt: "100" })).toBeNull()
  })

  it("uses the HOLLAR bucket instead of reserve liquidity", () => {
    expect(check(prime, hollar, { hollarRoom: "0" })).toBe("hollarBucket")
    expect(check(prime, { ...hollar, availableLiquidity: "0" })).toBeNull()
    expect(check(prime, hollar, { hollarRoom: null })).toBeNull()
  })

  it("flags a debt reserve with no cash", () => {
    expect(
      check(
        reserve,
        { ...reserve, availableLiquidity: "0" },
        {
          hollarRoom: undefined,
        },
      ),
    ).toBe("noLiquidity")
  })
})
