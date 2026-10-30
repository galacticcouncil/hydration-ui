import { describe, expect, it } from "vitest"

import {
  claimableInSeconds,
  formatEta,
  notStartedDebt,
  reserveCoversExit,
  typicalSliceSeconds,
} from "./withdrawalEta"

// 0.lark block 57873 (2026-10-27): four withdrawals in both vaults started,
// 12,220 HOLLAR to free, one 2,500 aPRIME slice per ~65 s freeing ~548
const LARK_57873 = {
  backlogHollar: 11_673,
  freedPerSlice: 547.8,
  // unit-neutral: these cases count in one unit
  equityShare: 1,
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

  it("never counts less than the withdrawal's own equity still to free", () => {
    // a backlog read before the keeper started the request reads 0: two
    // slices of its own equity remain, not a single keeper turn
    const backlog = { ...LARK_57873, backlogHollar: 0, freedPerSlice: 600 }
    expect(
      claimableInSeconds({
        backlog,
        notStartedHollar: 0,
        ownHollar: 1200,
        cooldownLeftSeconds: 0,
        started: true,
      }),
    ).toBe(2 * 65 + 30)
    // a fresh backlog already counts it, with everyone else's
    expect(
      claimableInSeconds({
        backlog: { ...backlog, backlogHollar: 3000 },
        notStartedHollar: 0,
        ownHollar: 1200,
        cooldownLeftSeconds: 0,
        started: true,
      }),
    ).toBe(5 * 65 + 30)
  })

  it("skips the backlog for an exit that does not wait for the unwind", () => {
    // 60 s cooldown + 30 s start + 30 s settle
    expect(
      claimableInSeconds({
        backlog: LARK_57873,
        notStartedHollar: 1200,
        cooldownLeftSeconds: 60,
        started: false,
        waitsOnUnwind: false,
      }),
    ).toBe(120)
  })

  it("counts a not-started exit's debt as the equity the keeper frees", () => {
    // 4.lark, 2026-10-30: 0.3 tBTC owing 17,290 HOLLAR of Main debt; a
    // 2,671 HOLLAR slice freed 855 of equity. Settled in 7.8 min; read as
    // debt it was estimated at 22.
    const backlog = {
      backlogHollar: 0,
      freedPerSlice: 855,
      equityShare: 855 / 2671,
      sliceSeconds: 65,
      stalled: false,
    }
    const seconds = claimableInSeconds({
      backlog,
      notStartedHollar: 17_290,
      cooldownLeftSeconds: 60,
      started: false,
    })
    expect(seconds! / 60).toBeCloseTo(9, 0)
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

describe("notStartedDebt", () => {
  it("counts only requests the keeper has not started, in every vault", () => {
    expect(
      notStartedDebt([
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

describe("typicalSliceSeconds", () => {
  it("follows the keeper's usual cadence, not the odd slow gap", () => {
    // 0.lark 2026-10-29: steady 60 s sales with a few missed turns between
    expect(typicalSliceSeconds([60, 114, 66, 234, 60, 60, 96, 60], 60)).toBe(63)
  })

  it("never runs faster than the pacing interval", () => {
    expect(typicalSliceSeconds([30, 40, 45], 60)).toBe(60)
  })

  it("assumes the interval plus a keeper turn without sales", () => {
    expect(typicalSliceSeconds([], 60)).toBe(65)
  })
})
