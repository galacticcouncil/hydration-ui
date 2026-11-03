import { describe, expect, it } from "vitest"

import {
  claimableInSeconds,
  formatEta,
  notStartedUnwind,
  reserveCoversExit,
  typicalSliceSeconds,
} from "./withdrawalEta"

// 0.lark block 57873 (2026-10-27): four withdrawals in both vaults started,
// 12,220 HOLLAR to free, one 2,500 aPRIME slice per ~65 s freeing ~548
const LARK_57873 = {
  backlogHollar: 11_673,
  comingSoonHollar: 0,
  freedPerSlice: 547.8,
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

  it("frees an exit from the loop's idle cash before selling", () => {
    // 4.lark: Deep2's 0.3 tBTC claimed 17,245 of a loop holding 25,888 idle
    // HOLLAR; 11,380 came at once, the rest at 1,175 a slice: 7.8 min real
    const backlog = {
      backlogHollar: 0,
      comingSoonHollar: 11_380,
      freedPerSlice: 1_175,
      equityShare: 0.44,
      sliceSeconds: 65,
      stalled: false,
    }
    const seconds = claimableInSeconds({
      backlog,
      notStartedHollar: 17_245,
      cooldownLeftSeconds: 60,
      started: false,
    })
    expect(seconds! / 60).toBeCloseTo(7.4, 1)
    // cash the keeper deploys before the start is idle there too
    expect(
      claimableInSeconds({
        backlog: { ...backlog, comingSoonHollar: 0 },
        notStartedHollar: 17_245,
        deployment: { byStart: 11_380 / 0.44, later: 0, perSecond: 0 },
        cooldownLeftSeconds: 60,
        started: false,
      })! / 60,
    ).toBeCloseTo(7.4, 1)
  })

  it("counts cash the keeper keeps deploying while the slices sell", () => {
    const backlog = {
      backlogHollar: 0,
      comingSoonHollar: 0,
      freedPerSlice: 600,
      equityShare: 0.5,
      sliceSeconds: 60,
      stalled: false,
    }
    const after = (deployment?: {
      byStart: number
      later: number
      perSecond: number
    }) =>
      claimableInSeconds({
        backlog,
        notStartedHollar: 6_000,
        deployment,
        cooldownLeftSeconds: 0,
        started: true,
      })! - 30
    // 6,000 at 10/s from sales alone
    expect(after()).toBe(600)
    // 2,500 deployed every 25 s frees 50/s more until 5,000 have gone in
    expect(after({ byStart: 0, later: 5_000, perSecond: 100 })).toBe(
      (6_000 - 2_500) / 10,
    )
    expect(after({ byStart: 0, later: 50_000, perSecond: 100 })).toBe(100)
    // an unmeasured keeper deploys it at once
    expect(after({ byStart: 0, later: 5_000, perSecond: Infinity })).toBe(350)
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

describe("notStartedUnwind", () => {
  it("counts only requests the keeper has not started, in every vault", () => {
    expect(
      notStartedUnwind([
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
  it("counts the slow gaps a withdrawal waits through", () => {
    // 4.lark 2026-11-02, request #18: 24 slices in 33.8 min
    const gaps = [
      168, 54, 12, 228, 60, 72, 48, 12, 108, 192, 102, 66, 72, 60, 42, 66, 132,
      108, 60, 186, 66, 102, 12,
    ]
    expect(typicalSliceSeconds(gaps, 60)).toBeCloseTo(2028 / 23)
  })

  it("never runs faster than the pacing interval", () => {
    expect(typicalSliceSeconds([30, 40, 45], 60)).toBe(60)
  })

  it("assumes the interval plus a keeper turn without sales", () => {
    expect(typicalSliceSeconds([], 60)).toBe(65)
  })
})
