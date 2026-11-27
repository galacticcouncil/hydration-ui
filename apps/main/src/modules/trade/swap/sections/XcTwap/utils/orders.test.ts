import { describe, expect, it } from "vitest"

import {
  getXcLeastInAfterSlippage,
  getXcMaxOrders,
  getXcMinBudget,
  getXcPeriod,
  getXcTranches,
} from "@/modules/trade/swap/sections/XcTwap/utils/orders"

const HOUR = 3_600_000
const DAY = 24 * HOUR

describe("getXcTranches", () => {
  it("clamps Auto to what the budget allows", () => {
    expect(
      getXcTranches({
        mode: "Auto",
        custom: 0,
        suggested: 48,
        amountIn: 1_000n,
        leastIn: 100n,
      }),
    ).toBe(10)
  })

  it("keeps the suggested Auto count when the budget covers it", () => {
    expect(
      getXcTranches({
        mode: "Auto",
        custom: 0,
        suggested: 48,
        amountIn: 10_000n,
        leastIn: 100n,
      }),
    ).toBe(48)
  })

  it("returns the custom count in Custom mode", () => {
    expect(
      getXcTranches({
        mode: "Custom",
        custom: 7,
        suggested: 48,
        amountIn: 1_000n,
        leastIn: 100n,
      }),
    ).toBe(7)
  })
})

describe("getXcPeriod", () => {
  it("spreads the duration over the orders", () => {
    // 1 day at 2.2 s = 39 272 blocks
    expect(getXcPeriod(DAY, 48)).toBe(818)
  })

  it("stretches the period when the count is clamped", () => {
    expect(getXcPeriod(DAY, 10)).toBe(3_927)
  })

  it("never goes below 15 blocks", () => {
    expect(getXcPeriod(HOUR, 1_000)).toBe(15)
  })
})

describe("getXcMaxOrders", () => {
  it("is limited by time", () => {
    // 1 hour / (15 blocks × 2.2 s) = 109
    expect(getXcMaxOrders(HOUR, 1_000_000n, 100n)).toBe(109)
  })

  it("is limited by budget", () => {
    expect(getXcMaxOrders(HOUR, 5_000n, 100n)).toBe(50)
  })
})

describe("getXcMinBudget", () => {
  it("is three times leastIn", () => {
    expect(getXcMinBudget(250n)).toBe(750n)
  })
})

describe("getXcLeastInAfterSlippage", () => {
  // Mainnet: 25 USDC / 5 orders = 5 USDC each passed leastIn 4.969115, but
  // after 1% slippage the order's WETH fell under `least` (OrderTooSmall)
  it("covers the slippage, so 5 USDC orders don't pass at 1%", () => {
    const leastIn = getXcLeastInAfterSlippage(4_969_115n, 1)

    expect(leastIn).toBe(5_019_309n)
    expect(5_000_000n >= leastIn).toBe(false)
    expect(getXcMaxOrders(3_600_000, 25_000_000n, leastIn)).toBe(4)
  })

  it("keeps leastIn without slippage", () => {
    expect(getXcLeastInAfterSlippage(4_969_115n, 0)).toBe(4_969_115n)
  })
})
