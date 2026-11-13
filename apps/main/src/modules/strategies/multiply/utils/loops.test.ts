import { describe, expect, it } from "vitest"

import {
  canRemoveLoop,
  getFillsUpTo,
  getLoopsToRestore,
  getSwapLossBps,
  sortDebtLoops,
  summarizeCollaterals,
} from "@/modules/strategies/multiply/utils/loops"

const loop = (
  collateralAssetId: string,
  maxNetApy: number | null,
  unavailable = false,
) => ({ collateralAssetId, maxNetApy, unavailable })

describe("sortDebtLoops", () => {
  it("sorts available loops by APY, unavailable last", () => {
    const sorted = sortDebtLoops([
      loop("5", 0.02),
      loop("5", -0.1),
      loop("5", 0.3, true),
      loop("5", 0.1),
      loop("5", null),
    ])
    expect(sorted.map((l) => [l.maxNetApy, l.unavailable])).toEqual([
      [0.1, false],
      [0.02, false],
      [-0.1, false],
      [null, false],
      [0.3, true],
    ])
  })
})

describe("summarizeCollaterals", () => {
  it("gives an unloopable collateral its most common block reason", () => {
    const [row] = summarizeCollaterals([
      { ...loop("A", 0.1, true), reason: "no liquidity" },
      { ...loop("A", 0.2, true), reason: "can't borrow" },
      { ...loop("A", 0.3, true), reason: "no liquidity" },
    ])
    expect(row!.reason).toBe("no liquidity")
  })

  it("ranks collaterals by their best valid APY, unloopable ones last", () => {
    const rows = summarizeCollaterals([
      loop("A", 0.05),
      loop("A", 0.2),
      loop("B", 0.9, true),
      loop("C", 0.1),
    ])
    expect(rows.map((r) => [r.collateralAssetId, r.valid.length])).toEqual([
      ["A", 2],
      ["C", 1],
      ["B", 0],
    ])
    expect(rows[0]!.best!.maxNetApy).toBe(0.2)
  })
})

describe("getSwapLossBps", () => {
  it("is positive for a loss and negative when the swap beats the oracle", () => {
    expect(getSwapLossBps(100, 99)).toBeCloseTo(100, 6)
    expect(getSwapLossBps(5.05, 5.26)).toBeLessThan(0)
  })
})

describe("getFillsUpTo", () => {
  // USDT/HYPE on mainnet: 68 bps at $100, 195 at $1k
  const hype = [
    { usd: 1000, rampLossBps: 195, unwindLossBps: 151 },
    { usd: 100, rampLossBps: 68, unwindLossBps: 24 },
  ]

  it("returns the largest size where every smaller size fills both ways", () => {
    expect(getFillsUpTo(hype, 75)).toEqual({
      fillsUpTo: 100,
      unwindFills: true,
    })
    expect(
      getFillsUpTo(
        [
          { usd: 100, rampLossBps: 10, unwindLossBps: 10 },
          { usd: 1000, rampLossBps: 90, unwindLossBps: 10 },
          { usd: 10000, rampLossBps: 10, unwindLossBps: 10 },
        ],
        75,
      ).fillsUpTo,
    ).toBe(100)
  })

  it("flags a loop whose unwind fails even at the smallest size", () => {
    // apyUSD debt trades about 3.2% under its oracle
    expect(
      getFillsUpTo([{ usd: 100, rampLossBps: -300, unwindLossBps: 330 }], 75),
    ).toEqual({ fillsUpTo: 0, unwindFills: false })
  })
})

describe("getLoopsToRestore", () => {
  const isCustom = (p: { slug: string }) => p.slug.startsWith("custom-")
  const preset = { slug: "vdot-dot", collateralAssetId: "15", debtAssetId: "5" }
  const custom = {
    slug: "custom-22-1001355",
    collateralAssetId: "22",
    debtAssetId: "1001355",
  }

  it("restores a custom loop held in a position but missing from the list", () => {
    expect(getLoopsToRestore([custom, custom], [preset], isCustom)).toEqual([
      { collateralAssetId: "22", debtAssetId: "1001355" },
    ])
  })

  it("ignores presets and loops already listed", () => {
    expect(
      getLoopsToRestore([preset, custom], [preset, custom], isCustom),
    ).toEqual([])
  })
})

describe("canRemoveLoop", () => {
  it("blocks removal while a position is open on the loop", () => {
    expect(canRemoveLoop("custom-22-10", ["custom-22-10"])).toBe(false)
    expect(canRemoveLoop("custom-22-10", ["vdot-dot"])).toBe(true)
  })
})
