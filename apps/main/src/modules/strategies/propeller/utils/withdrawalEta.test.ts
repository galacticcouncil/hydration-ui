import { describe, expect, it } from "vitest"

import {
  claimableInSeconds,
  formatEta,
  measureSettlePace,
  reserveCoversExit,
} from "./withdrawalEta"

// request #29 on 0.lark (2026-10-26): a keeper sliver, then ~0.257 per cycle
const LARK_29 = [
  { requestId: 29, collateral: 0.000025, blockNumber: 48032n },
  { requestId: 29, collateral: 0.138456, blockNumber: 48037n },
  { requestId: 29, collateral: 0.256625, blockNumber: 48039n },
  { requestId: 29, collateral: 0.256605, blockNumber: 48052n },
  { requestId: 29, collateral: 0.256584, blockNumber: 48063n },
  { requestId: 29, collateral: 0.172844, blockNumber: 48067n },
]
const BLOCK = 8.6

describe("measureSettlePace", () => {
  it("measures the busy pace and keeper cycle", () => {
    const pace = measureSettlePace(LARK_29, BLOCK)!
    // 0.942658 settled over 30 blocks after the first tranche
    expect(pace.perSecond * 60).toBeCloseTo(0.2192, 3)
    expect(pace.cycleSeconds).toBeCloseTo(11 * BLOCK)
  })

  it("leaves the time between withdrawals out", () => {
    const later = LARK_29.map((l) => ({
      ...l,
      requestId: 30,
      blockNumber: l.blockNumber + 40n,
    }))
    const a = measureSettlePace(LARK_29, BLOCK)!
    const b = measureSettlePace([...LARK_29, ...later], BLOCK)!
    expect(b.perSecond).toBeCloseTo(a.perSecond)
  })

  it("follows the keeper's latest tranches", () => {
    // an old, slow request: one tranche every 60 blocks
    const old = [0n, 60n, 120n, 180n].map((at, i) => ({
      requestId: 1,
      collateral: 0.25,
      blockNumber: 10_000n + at + BigInt(i),
    }))
    const recent = Array.from({ length: 21 }, (_, i) => ({
      requestId: 2 + Math.floor(i / 7),
      collateral: 0.25,
      blockNumber: 40_000n + BigInt(i * 7),
    }))
    const pace = measureSettlePace([...old, ...recent], BLOCK)!
    expect(pace.cycleSeconds).toBeCloseTo(7 * BLOCK)
  })

  it("needs more than one tranche gap", () => {
    expect(measureSettlePace(LARK_29.slice(0, 3), BLOCK)).toBeNull()
    expect(measureSettlePace([], BLOCK)).toBeNull()
  })
})

describe("claimableInSeconds", () => {
  const pace = { perSecond: 0.25 / 60, cycleSeconds: 60 }

  it("adds cooldown and a start cycle before the unwind starts", () => {
    // 1 min cooldown + 1 cycle + 1.0811 / 0.25 per min ≈ 6.3 min
    const s = claimableInSeconds({
      pace,
      remaining: 1.0811,
      ahead: 0,
      cooldownLeftSeconds: 60,
      started: false,
      sinceLastSettleSeconds: null,
    })!
    expect(s / 60).toBeCloseTo(6.32, 1)
  })

  it("waits for everything ahead in the queue", () => {
    const s = claimableInSeconds({
      pace,
      remaining: 0.5,
      ahead: 1,
      cooldownLeftSeconds: 0,
      started: true,
      sinceLastSettleSeconds: 30,
    })!
    expect(s / 60).toBeCloseTo(6)
  })

  it("gives no countdown without a pace or once stalled", () => {
    const base = {
      remaining: 1,
      ahead: 0,
      cooldownLeftSeconds: 0,
      started: true,
      sinceLastSettleSeconds: 30,
    }
    expect(claimableInSeconds({ ...base, pace: null })).toBeNull()
    expect(
      claimableInSeconds({ ...base, pace, sinceLastSettleSeconds: 301 }),
    ).toBeNull()
    expect(claimableInSeconds({ ...base, pace, remaining: 0 })).toBeNull()
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
