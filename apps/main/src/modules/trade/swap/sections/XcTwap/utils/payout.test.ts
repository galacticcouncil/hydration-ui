import { describe, expect, it, vi } from "vitest"

import {
  getMinDelivery,
  getPayoutCount,
  getYouReceive,
} from "@/modules/trade/swap/sections/XcTwap/utils/payout"

// The helpers are pure; stub the modules payout.ts imports so the app graph isn't loaded.
vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }))
vi.mock("@/states/tradeSettings", () => ({}))

describe("getMinDelivery", () => {
  it("never goes under the route minimum at the end", () => {
    expect(
      getMinDelivery({
        payoutEvery: "end",
        amountOut: 0n,
        tranches: 3,
        routeMin: 6_400n,
      }),
    ).toBe(6_400n)
  })

  it("is the whole amount at the end", () => {
    expect(
      getMinDelivery({
        payoutEvery: "end",
        amountOut: 1_000n,
        tranches: 10,
        routeMin: 300n,
      }),
    ).toBe(1_000n)
  })

  it("is N orders' worth of output", () => {
    expect(
      getMinDelivery({
        payoutEvery: 4,
        amountOut: 1_000n,
        tranches: 10,
        routeMin: 300n,
      }),
    ).toBe(400n)
  })

  it("never goes below the route minimum", () => {
    expect(
      getMinDelivery({
        payoutEvery: 2,
        amountOut: 1_000n,
        tranches: 10,
        routeMin: 300n,
      }),
    ).toBe(300n)
  })

  it("follows N when there is no route minimum (NEAR)", () => {
    expect(
      getMinDelivery({
        payoutEvery: 1,
        amountOut: 1_000n,
        tranches: 10,
        routeMin: 0n,
      }),
    ).toBe(100n)
  })
})

describe("getPayoutCount", () => {
  it("rounds up", () => {
    expect(getPayoutCount(1_000n, 300n)).toBe(4)
    expect(getPayoutCount(1_000n, 250n)).toBe(4)
  })

  it("is one payout at the end", () => {
    expect(getPayoutCount(1_000n, 1_000n)).toBe(1)
  })

  it("is 0 without a minimum delivery", () => {
    expect(getPayoutCount(1_000n, 0n)).toBe(0)
  })
})

describe("getYouReceive", () => {
  it("subtracts the payout fees", () => {
    expect(getYouReceive(1_000n, 4, 20n)).toBe(920n)
  })

  it("is the full amount with no payout fee (NEAR)", () => {
    expect(getYouReceive(1_000n, 10, 0n)).toBe(1_000n)
  })

  it("never goes below 0", () => {
    expect(getYouReceive(50n, 4, 20n)).toBe(0n)
  })
})
