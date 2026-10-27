import { describe, expect, it } from "vitest"

import {
  estimateRampRungs,
  getIntentFloors,
  getMaxLeverage,
  getSliderMaxLeverage,
  projectMultiplyPosition,
} from "@/modules/strategies/multiply/utils/projection"

const PRIME = { lt: 0.88, ltv: 0.85 }

describe("getMaxLeverage", () => {
  it("is bound by minHf for PRIME/HOLLAR", () => {
    expect(getMaxLeverage({ ...PRIME, minHf: 1.1 })).toBeCloseTo(5, 6)
    expect(getMaxLeverage({ ...PRIME, minHf: 1.15 })).toBeCloseTo(4.259, 3)
  })

  it("is bound by LTV when minHf sits close to LT", () => {
    expect(getMaxLeverage({ ...PRIME, minHf: 1 })).toBeCloseTo(1 / 0.15, 6)
  })

  it("is 0 when the threshold reaches minHf", () => {
    expect(getMaxLeverage({ lt: 1.1, ltv: 0.85, minHf: 1.1 })).toBe(0)
  })
})

describe("getSliderMaxLeverage", () => {
  it("keeps 1.10 / 0.22 at 5.0 despite float error", () => {
    expect(getSliderMaxLeverage(getMaxLeverage({ ...PRIME, minHf: 1.1 }))).toBe(
      5,
    )
  })

  it("floors to 0.1", () => {
    expect(getSliderMaxLeverage(4.259)).toBe(4.2)
  })
})

describe("projectMultiplyPosition", () => {
  it("sizes a 3× PRIME/HOLLAR position", () => {
    const p = projectMultiplyPosition({
      amount: 1000,
      collateralPriceUsd: 1,
      debtPriceUsd: 1,
      leverage: 3,
      ...PRIME,
      minHf: 1.1,
      supplyApy: 0.095,
      borrowApy: 0.05,
    })
    expect(p.collateral).toBe(3000)
    expect(p.debt).toBe(2000)
    expect(p.healthFactor).toBeCloseTo(1.32, 6)
    expect(p.liquidationPriceUsd).toBeCloseTo(0.7576, 4)
    expect(p.netApy).toBeCloseTo(0.185, 6)
  })
})

describe("estimateRampRungs", () => {
  // the research table: LT 80% / minHf 1.15, floors at 1% of the deposit
  it.each([
    [1.5, 4],
    [2, 6],
    [3, 11],
    [3.28, 12],
  ])("%s× takes %s rungs", (leverage, rungs) => {
    expect(estimateRampRungs({ leverage, lt: 0.8, minHf: 1.15 })).toBe(rungs)
  })

  it("is 0 without leverage", () => {
    expect(estimateRampRungs({ leverage: 1, lt: 0.8, minHf: 1.15 })).toBe(0)
  })
})

describe("getIntentFloors", () => {
  const base = {
    collateralDecimals: 6,
    debtDecimals: 18,
    collateralPriceInDebt: 1,
    debtEd: 2n * 10n ** 16n,
    aCollateralEd: 9_901n,
  }

  it("takes 1% of a large deposit", () => {
    expect(getIntentFloors({ ...base, amount: 1000n * 10n ** 6n })).toEqual({
      minIntentDebt: 10n * 10n ** 18n,
      minIntentAToken: 10n * 10n ** 6n,
    })
  })

  it("falls back to 2 × ED for a small deposit", () => {
    expect(getIntentFloors({ ...base, amount: 10n ** 6n })).toEqual({
      minIntentDebt: 4n * 10n ** 16n,
      minIntentAToken: 19_802n,
    })
  })
})
