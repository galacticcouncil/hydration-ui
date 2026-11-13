import { describe, expect, it } from "vitest"

import {
  canPayProportionally,
  getProportionalEntry,
} from "@/modules/strategies/multiply/utils/proportional"

// HUSDT (pool 111): HOLLAR (222, 18 dec) + aUSDT (1002, 6 dec)
const HOLLAR = { assetId: "222", decimals: 18 }
const AUSDT = { assetId: "1002", decimals: 6 }

describe("canPayProportionally", () => {
  it("offers it when the pay asset is one of several pool reserves", () => {
    expect(canPayProportionally(["222", "1002"], "222")).toBe(true)
  })

  it("doesn't offer it for an asset outside the pool", () => {
    expect(canPayProportionally(["222", "1002"], "10")).toBe(false)
  })

  it("doesn't offer it for a single-reserve pool", () => {
    expect(canPayProportionally(["222"], "222")).toBe(false)
  })
})

describe("getProportionalEntry", () => {
  it("is idle with no amounts", () => {
    const entry = getProportionalEntry({
      inputs: [
        { ...HOLLAR, amount: "", maxBalance: "100" },
        { ...AUSDT, amount: "0", maxBalance: "100" },
      ],
      shares: "0",
      slippagePct: 1,
    })
    expect(entry.state).toBe("idle")
    expect(entry.assets).toEqual([])
  })

  it("builds the add-liquidity assets and a slippage floor on the shares", () => {
    const entry = getProportionalEntry({
      inputs: [
        { ...HOLLAR, amount: "100", maxBalance: "500" },
        { ...AUSDT, amount: "50.5", maxBalance: "500" },
      ],
      shares: "150000000000000000000",
      slippagePct: 1,
    })
    expect(entry.state).toBe("ready")
    expect(entry.assets).toEqual([
      { asset_id: 222, amount: 100_000000000000000000n },
      { asset_id: 1002, amount: 50_500000n },
    ])
    expect(entry.shares).toBe(150_000000000000000000n)
    expect(entry.minShares).toBe(148_500000000000000000n)
  })

  it("leaves out reserves with no amount", () => {
    const entry = getProportionalEntry({
      inputs: [
        { ...HOLLAR, amount: "10", maxBalance: "500" },
        { ...AUSDT, amount: "", maxBalance: "500" },
      ],
      shares: "1e+19",
      slippagePct: 0.5,
    })
    expect(entry.state).toBe("ready")
    expect(entry.assets).toEqual([
      { asset_id: 222, amount: 10_000000000000000000n },
    ])
    expect(entry.minShares).toBe(9_950000000000000000n)
  })

  it("flags each reserve over its balance", () => {
    const entry = getProportionalEntry({
      inputs: [
        { ...HOLLAR, amount: "100", maxBalance: "500" },
        { ...AUSDT, amount: "600", maxBalance: "500" },
      ],
      shares: "700000000000000000000",
      slippagePct: 1,
    })
    expect(entry.state).toBe("insufficientBalance")
    expect(entry.overBalanceIds).toEqual(["1002"])
  })

  it("is too small when the amounts mint no shares", () => {
    const entry = getProportionalEntry({
      inputs: [{ ...AUSDT, amount: "0.000001", maxBalance: "500" }],
      shares: "0",
      slippagePct: 1,
    })
    expect(entry.state).toBe("tooSmall")
  })
})
