import { describe, expect, it } from "vitest"

import {
  computeVaultApr,
  withdrawalComplete,
  withdrawalState,
} from "./accounting"

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
    expect(computeVaultApr(rates)).toBeCloseTo(6.594852842149837, 8)
  })

  it("discounts only the Main borrowing leg", () => {
    expect(computeVaultApr({ ...rates, mainDiscountBps: 10_000 })).toBeCloseTo(
      9.8948528421,
      8,
    )
    expect(computeVaultApr({ ...rates, mainDiscountBps: 5_000 })).toBeCloseTo(
      8.2448528421,
      8,
    )
  })

  it("retains the previous two-leg result at zero fee and zero discount", () => {
    expect(computeVaultApr({ ...rates, protocolFeeBps: 0 })).toBeCloseTo(
      7.115634570684039,
      8,
    )
  })

  it("does not invent fee or discount data when the read is missing", () => {
    expect(computeVaultApr({ ...rates, protocolFeeBps: null })).toBeNull()
    expect(computeVaultApr({ ...rates, mainDiscountBps: undefined })).toBeNull()
  })

  it("rejects invalid inputs and does not display positive return at a full fee", () => {
    expect(computeVaultApr({ ...rates, protocolFeeBps: 10_000 })).toBeCloseTo(
      -3.3,
    )
    expect(computeVaultApr({ ...rates, leverage: Number.NaN })).toBeNull()
    expect(computeVaultApr({ ...rates, mainDiscountBps: 10_001 })).toBeNull()
  })

  it("reports negative carry rather than hiding it and rejects impossible APY", () => {
    expect(computeVaultApr({ ...rates, primeSupplyApy: 0 })).toBeCloseTo(-16.5)
    expect(computeVaultApr({ ...rates, primeSupplyApy: -100 })).toBeNull()
  })
})

describe("Propeller withdrawal lifecycle", () => {
  it("does not round an unpaid wei to a fully settled withdrawal", () => {
    const debt = 10n ** 24n
    expect(Number(debt - 1n) / Number(debt)).toBe(1)
    expect(withdrawalComplete(true, debt - 1n, debt)).toBe(false)
    expect(withdrawalComplete(true, debt, debt)).toBe(true)
    expect(withdrawalComplete(false, 0n, 0n)).toBe(false)
    expect(withdrawalComplete(true, 0n, 0n)).toBe(true)
  })
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
