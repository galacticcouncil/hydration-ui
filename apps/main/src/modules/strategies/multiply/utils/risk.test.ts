import { describe, expect, it } from "vitest"

import {
  getLargestFall,
  getLiquidationBuffer,
  getRiskLevel,
  toPriceRatios,
} from "@/modules/strategies/multiply/utils/risk"

const DAY = 24 * 60 * 60
const series = (ratios: number[], stepS = DAY) =>
  ratios.map((ratio, i) => ({ time: i * stepS, ratio }))

describe("getLiquidationBuffer", () => {
  it("is about 9.1% at HF 1.10", () => {
    expect(getLiquidationBuffer(1.1)).toBeCloseTo(0.0909, 4)
  })
})

describe("getLargestFall", () => {
  it("measures the fall from the running peak, not from the start", () => {
    const r = getLargestFall(series([1, 1.2, 0.9, 1.1]))!
    expect(r.fall).toBeCloseTo(0.25, 6)
    expect(r.spanS).toBe(3 * DAY)
  })

  it("is zero for a rising series and null without data", () => {
    expect(getLargestFall(series([1, 2, 3]))!.fall).toBe(0)
    expect(getLargestFall(series([1]))).toBeNull()
  })
})

describe("getRiskLevel", () => {
  const full = (fall: number) => ({ fall, spanS: 30 * DAY })

  it("makes every correlated loop Low", () => {
    expect(getRiskLevel({ correlated: true, largestFall: null, hf: 1.1 })).toBe(
      "low",
    )
  })

  it("splits volatile loops at a third of the buffer (~3% at 1.10)", () => {
    // PRIME/HOLLAR measured 0.35%, the first apyUSD pair 3.31%
    expect(
      getRiskLevel({
        correlated: false,
        largestFall: full(0.0035),
        hf: 1.1,
      }),
    ).toBe("medium")
    expect(
      getRiskLevel({
        correlated: false,
        largestFall: full(0.0331),
        hf: 1.1,
      }),
    ).toBe("high")
  })

  it("is High without a full 30-day window", () => {
    expect(
      getRiskLevel({ correlated: false, largestFall: null, hf: 1.1 }),
    ).toBe("high")
    expect(
      getRiskLevel({
        correlated: false,
        largestFall: { fall: 0.001, spanS: 24 * DAY },
        hf: 1.1,
      }),
    ).toBe("high")
  })
})

describe("toPriceRatios", () => {
  it("divides closes at matching times and skips gaps", () => {
    expect(
      toPriceRatios(
        [
          { time: 1, close: 10 },
          { time: 2, close: 12 },
          { time: 3, close: 9 },
        ],
        [
          { time: 1, close: 2 },
          { time: 3, close: 3 },
        ],
      ),
    ).toEqual([
      { time: 1, ratio: 5 },
      { time: 3, ratio: 3 },
    ])
  })
})
