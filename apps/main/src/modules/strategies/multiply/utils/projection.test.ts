import { describe, expect, it } from "vitest"

import {
  estimateRampRungs,
  getEntryCost,
  getExitCost,
  getIntentFloors,
  getMaxDeposit,
  getMaxLeverage,
  getSliderMaxLeverage,
  getWithdrawDebtRepay,
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
  // expected rung counts at LT 80% / minHf 1.15, floored at 1% of the deposit
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

describe("getEntryCost", () => {
  // position #3 on lark3: 1 PRIME at ~3.4×, 2.5213 HOLLAR swapped for 2.3554 PRIME
  it("is the swap shortfall against the oracle, as a share of the deposit", () => {
    const { cost, percent } = getEntryCost({
      amount: 1,
      debt: 2.52134149,
      quotedOut: 2.355359,
      collateralPriceInDebt: 1.06695069,
    })
    expect(cost).toBeCloseTo(0.00777, 5)
    expect(percent).toBeCloseTo(0.777, 3)
  })

  it("is zero without a deposit, negative when the swaps beat the oracle", () => {
    expect(
      getEntryCost({
        amount: 0,
        debt: 1,
        quotedOut: 1,
        collateralPriceInDebt: 1,
      }).cost,
    ).toBe(0)
    expect(
      getEntryCost({
        amount: 1,
        debt: 1,
        quotedOut: 2,
        collateralPriceInDebt: 1,
      }).cost,
    ).toBe(-1)
  })
})

describe("getWithdrawDebtRepay", () => {
  it("repays the share of the debt that the withdraw takes of the net value", () => {
    expect(getWithdrawDebtRepay({ amount: 25, nav: 100, debt: 200 })).toBe(50)
  })

  it("repays all of it, never more, when withdrawing everything", () => {
    expect(getWithdrawDebtRepay({ amount: 120, nav: 100, debt: 200 })).toBe(200)
    expect(getWithdrawDebtRepay({ amount: 1, nav: 0, debt: 200 })).toBe(0)
  })
})

describe("getExitCost", () => {
  it("is the shortfall of the swap against the oracle, in collateral", () => {
    // 100 PRIME at 1.067 should buy 106.7 HOLLAR; 106.35 buys back ~0.328 PRIME less
    expect(
      getExitCost({
        sold: 100,
        quotedOut: 106.35,
        collateralPriceInDebt: 1.067,
      }),
    ).toBeCloseTo(100 - 106.35 / 1.067, 9)
  })

  it("is negative when the swap beats the oracle", () => {
    expect(
      getExitCost({ sold: 1, quotedOut: 2, collateralPriceInDebt: 1 }),
    ).toBe(-1)
  })
})

describe("getMaxDeposit", () => {
  const base = {
    leverage: 3,
    collateralPriceUsd: 2,
    debtPriceUsd: 1,
    supplyRoom: null,
    debtRoom: null,
    ceilingRoomUsd: null,
  }

  it("is uncapped without rooms", () => {
    expect(getMaxDeposit(base)).toBeNull()
  })

  it("takes the tightest of supply, debt and ceiling room", () => {
    // supply: 300 / 3 = 100; debt: 200 * 1 / (2 * 2) = 50; ceiling: 80 / 4 = 20
    expect(getMaxDeposit({ ...base, supplyRoom: 300 })).toBe(100)
    expect(getMaxDeposit({ ...base, supplyRoom: 300, debtRoom: 200 })).toBe(50)
    expect(
      getMaxDeposit({
        ...base,
        supplyRoom: 300,
        debtRoom: 200,
        ceilingRoomUsd: 80,
      }),
    ).toBe(20)
  })

  it("never goes negative", () => {
    expect(getMaxDeposit({ ...base, supplyRoom: -5 })).toBe(0)
  })
})
