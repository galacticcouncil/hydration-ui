import { describe, expect, it } from "vitest"

import {
  claimableInSeconds,
  formatEta,
  notStartedEquity,
  reserveCoversExit,
} from "./withdrawalEta"

// 0.lark block 57873 (2026-10-27): four withdrawals in both vaults started,
// 12,220 HOLLAR to free, one 2,500 aPRIME slice per ~65 s freeing ~548
const LARK_57873 = {
  backlogHollar: 11_673,
  freedPerSlice: 547.8,
  sliceSeconds: 65,
  stalled: false,
}

describe("claimableInSeconds", () => {
  it("drains the whole shared backlog, not just the queue ahead", () => {
    // 21.3 slices x 65 s + 30 s ≈ 23.6 min; all four settled 23.2 min later
    const s = claimableInSeconds({
      backlog: LARK_57873,
      notStartedHollar: 0,
      cooldownLeftSeconds: 0,
      started: true,
    })!
    expect(s / 60).toBeCloseTo(23.6, 1)
  })

  it("adds the cooldown, a keeper turn to start and the requests not started", () => {
    const backlog = { ...LARK_57873, backlogHollar: 0, freedPerSlice: 600 }
    // 60 s cooldown + 30 s start + 2 slices x 65 s + 30 s settle
    expect(
      claimableInSeconds({
        backlog,
        notStartedHollar: 1200,
        cooldownLeftSeconds: 60,
        started: false,
      }),
    ).toBe(250)
  })

  it("gives no countdown while unknown or stalled", () => {
    const base = { notStartedHollar: 0, cooldownLeftSeconds: 0, started: true }
    expect(claimableInSeconds({ ...base, backlog: null })).toBeNull()
    expect(
      claimableInSeconds({
        ...base,
        backlog: { ...LARK_57873, stalled: true },
      }),
    ).toBeNull()
  })
})

describe("notStartedEquity", () => {
  it("counts only requests the keeper has not started, in every vault", () => {
    expect(
      notStartedEquity([
        {
          queued: [
            { remaining: 1, started: true },
            { remaining: 2, started: false },
          ],
          debtPerCollateral: 1800,
        },
        {
          queued: [{ remaining: 0.06, started: false }],
          debtPerCollateral: 50_000,
        },
      ]),
    ).toBe(2 * 1800 + 0.06 * 50_000)
  })
})

describe("reserveCoversExit", () => {
  const live = { carry: 0.0044, reserveHollar: 735, debtPerCollateral: 2700 }

  it("covers a normal exit from the reserve", () => {
    // 1 ETH ≈ 2,700 HOLLAR debt x 0.44% ≈ 12 HOLLAR
    expect(reserveCoversExit({ ...live, collateral: 1 })).toBe(true)
  })

  it("warns once the queue's shortfall exceeds the reserve", () => {
    // 70 ETH ≈ 832 HOLLAR shortfall
    expect(reserveCoversExit({ ...live, collateral: 70 })).toBe(false)
  })

  it("never warns without a shortfall or on unknown inputs", () => {
    expect(reserveCoversExit({ ...live, carry: 0, collateral: 70 })).toBe(true)
    expect(
      reserveCoversExit({ ...live, reserveHollar: null, collateral: 70 }),
    ).toBe(true)
  })
})

describe("formatEta", () => {
  it("rounds to coarse units", () => {
    expect(formatEta(40)).toBe("~1 min")
    expect(formatEta(380)).toBe("~6 min")
    expect(formatEta(4 * 3600)).toBe("~4 h")
  })
})
