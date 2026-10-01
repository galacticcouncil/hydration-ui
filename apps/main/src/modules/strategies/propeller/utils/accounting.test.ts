import { describe, expect, it } from "vitest"

import { computeVaultApy, withdrawalState } from "./accounting"

const rates = {
  maxLtv: 0.75,
  leverage: 5,
  borrowRate: 0.044,
  primeSupplyApy: 6.5,
  protocolFeeBps: 500,
  mainDiscountBps: 0,
}

describe("Propeller return estimate", () => {
  it("charges the harvest fee before paying Main interest", () => {
    expect(computeVaultApy(rates)).toBeCloseTo(7.31625, 8)
  })

  it("discounts only the Main borrowing leg", () => {
    expect(computeVaultApy({ ...rates, mainDiscountBps: 10_000 })).toBeCloseTo(
      10.61625,
      8,
    )
    expect(computeVaultApy({ ...rates, mainDiscountBps: 5_000 })).toBeCloseTo(
      8.96625,
      8,
    )
  })

  it("retains the previous two-leg result at zero fee and zero discount", () => {
    expect(computeVaultApy({ ...rates, protocolFeeBps: 0 })).toBeCloseTo(
      7.875,
      8,
    )
  })

  it("does not invent fee or discount data when the read is missing", () => {
    expect(computeVaultApy({ ...rates, protocolFeeBps: null })).toBeNull()
    expect(computeVaultApy({ ...rates, mainDiscountBps: undefined })).toBeNull()
  })

  it("rejects invalid inputs and does not display positive return at a full fee", () => {
    expect(computeVaultApy({ ...rates, protocolFeeBps: 10_000 })).toBeNull()
    expect(computeVaultApy({ ...rates, leverage: Number.NaN })).toBeNull()
    expect(computeVaultApy({ ...rates, mainDiscountBps: 10_001 })).toBeNull()
  })
})

describe("Propeller withdrawal lifecycle", () => {
  const request = {
    active: true,
    started: false,
    eligibleAt: 43_200_000,
    now: 0,
    complete: false,
    settledAmount: 0,
  }

  it("keeps a request in cooldown before it can start", () => {
    expect(withdrawalState(request)).toBe("cooldown")
  })

  it("does not promise settlement when the cooldown expires", () => {
    expect(withdrawalState({ ...request, now: 43_200_000 })).toBe("pending")
  })

  it("keeps an unfunded started claim pending instead of writing it off", () => {
    expect(withdrawalState({ ...request, started: true })).toBe("pending")
    expect(
      withdrawalState({ ...request, started: true, settledAmount: 0.4 }),
    ).toBe("partial")
  })

  it("distinguishes settled collateral from a completed claim", () => {
    expect(withdrawalState({ ...request, started: true, complete: true })).toBe(
      "settled",
    )
    expect(
      withdrawalState({
        ...request,
        started: true,
        complete: true,
        active: false,
      }),
    ).toBe("claimed")
  })
})
