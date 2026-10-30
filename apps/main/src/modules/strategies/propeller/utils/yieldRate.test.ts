import { describe, expect, it } from "vitest"

import { borrowDeployedFraction, targetLoopLeverage, toApy } from "./yieldRate"

describe("targetLoopLeverage", () => {
  it("converges the loop series at 1/(1 - LT/targetHf)", () => {
    // PRIME LT 88%, target HF 1.05 — the lark configuration
    expect(targetLoopLeverage(1.05, 8800)).toBeCloseTo(6.176, 3)
  })

  it("returns null when the series diverges or inputs are missing", () => {
    expect(targetLoopLeverage(null, 8800)).toBeNull()
    expect(targetLoopLeverage(1.05, null)).toBeNull()
    expect(targetLoopLeverage(0.8, 8800)).toBeNull() // LT/hf >= 1
  })
})

describe("toApy", () => {
  it("compounds a simple annual rate continuously", () => {
    expect(toApy(8.22)).toBeCloseTo(8.567, 2)
    expect(toApy(0)).toBe(0)
    expect(toApy(null)).toBeNull()
  })
})

describe("borrowDeployedFraction", () => {
  it("measures the borrow against synthetic-stripped max-LTV capacity", () => {
    // live lark-4 state 2026-10-06: coll $18,962 incl. synthetic, debt $38.69
    const f = borrowDeployedFraction({
      mainCollUsd: 18_962,
      mainDebtUsd: 38.69,
      targetLtv: 0.75,
    })
    expect(f).toBeCloseTo(38.69 / ((18_962 - 38.69 / 0.98) * 0.75), 8)
  })

  it("caps at 1 when fully borrowed and nulls without inputs", () => {
    const real = 10_000
    const debt = real * 0.75
    expect(
      borrowDeployedFraction({
        mainCollUsd: real + debt / 0.98,
        mainDebtUsd: debt,
        targetLtv: 0.75,
      }),
    ).toBeCloseTo(1, 6)
    expect(
      borrowDeployedFraction({
        mainCollUsd: null,
        mainDebtUsd: 1,
        targetLtv: 0.75,
      }),
    ).toBeNull()
  })
})
