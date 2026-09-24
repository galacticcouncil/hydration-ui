import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { beforeAll, describe, expect, it, vi } from "vitest"

import {
  eModeCategories,
  getMarket,
  readReserves,
  summarizeReserves,
} from "@/core"
import {
  fixtureTimestamp,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
} from "@/fixtures"
import type { EModeCategory, ReserveSummary } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const symbolsOf = (category: EModeCategory) =>
  category.assets.map((asset) => asset.symbol)

const categoryOf = (categories: EModeCategory[], symbol: string) => {
  const category = categories.find((c) => symbolsOf(c).includes(symbol))
  if (!category) throw new Error(`${symbol} is in no e-mode category`)
  return category
}

describe("eModeCategories", () => {
  let summaries: ReserveSummary[]
  let categories: EModeCategory[]

  beforeAll(async () => {
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getReservesData") return getReservesDataFixture()
      if (functionName === "getReservesIncentivesData")
        return getReservesIncentivesDataFixture()
      throw new Error(`Unexpected call to ${functionName}`)
    })

    const chain = await readReserves({} as Config, getMarket("hydration_v3"))
    summaries = summarizeReserves({
      ...chain,
      currentTimestamp: fixtureTimestamp,
    })
    categories = eModeCategories(summaries)
  })

  it("returns the five categories the market offers, sorted by id", () => {
    expect(categories.map((c) => c.id)).toEqual([1, 2, 3, 4, 5])
  })

  it("never returns category 0", () => {
    expect(summaries.some((s) => s.eModeCategoryId === 0)).toBe(true)
    expect(categories.find((c) => c.id === 0)).toBeUndefined()
    expect(categories.flatMap(symbolsOf)).not.toContain("WBTC")
  })

  it("groups correlated assets into one category", () => {
    expect(categoryOf(categories, "USDC")).toBe(categoryOf(categories, "USDT"))
    expect(categoryOf(categories, "DOT")).toBe(categoryOf(categories, "vDOT"))
    expect(categoryOf(categories, "USDC")).not.toBe(
      categoryOf(categories, "DOT"),
    )
  })

  it("lists every member reserve exactly once", () => {
    const members = categories.flatMap((c) => c.assets)
    const expected = summaries.filter((s) => s.eModeCategoryId !== 0)

    expect(members.map((m) => m.underlyingAsset).sort()).toEqual(
      expected.map((s) => s.underlyingAsset).sort(),
    )
    for (const category of categories) {
      for (const asset of category.assets) {
        const summary = summaries.find(
          (s) => s.underlyingAsset === asset.underlyingAsset,
        )
        expect(summary?.eModeCategoryId).toBe(category.id)
        expect(summary?.symbol).toBe(asset.symbol)
      }
    }
  })

  it("uses the on-chain label verbatim", () => {
    for (const category of categories) {
      const member = summaries.find((s) => s.eModeCategoryId === category.id)
      expect(category.label).toBe(member?.eModeLabel)
      expect(category.label).not.toMatch(/ Correlated$/)
    }
    expect(categoryOf(categories, "SOL").label).toBe("SOL correlated")
  })

  it("carries the category's ltv and liquidation threshold as fractions", () => {
    const stablecoins = categoryOf(categories, "USDC")
    expect(stablecoins.ltv).toBe(
      summaries.find((s) => s.symbol === "USDC")?.eModeLtv,
    )
    expect(Number(stablecoins.ltv)).toBe(0.9)
    expect(Number(stablecoins.liquidationThreshold)).toBe(0.93)
  })

  it("returns nothing for a market without e-mode", () => {
    expect(eModeCategories([])).toEqual([])
    expect(
      eModeCategories(summaries.filter((s) => s.eModeCategoryId === 0)),
    ).toEqual([])
  })
})
