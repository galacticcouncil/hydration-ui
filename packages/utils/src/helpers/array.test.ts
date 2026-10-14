import { describe, expect, it } from "vitest"

import { arraySearch } from "./array"

interface Asset {
  symbol: string
  name: string
  decimals: number
}

const ZEC: Asset = { symbol: "ZEC", name: "Zcash", decimals: 8 }
const WBTC: Asset = { symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8 }
const ETH: Asset = { symbol: "ETH", name: "Ether", decimals: 18 }
const WETH: Asset = { symbol: "WETH", name: "Wrapped Ether", decimals: 18 }
const USDC: Asset = { symbol: "USDC", name: "USD Coin", decimals: 6 }

const assets = [ZEC, WBTC, ETH, WETH, USDC]

describe("arraySearch", () => {
  it("finds an item by a key other than the first one", () => {
    expect(arraySearch(assets, "zcash", ["symbol", "name"])).toEqual([ZEC])
  })

  it("matches partial words regardless of case", () => {
    expect(arraySearch(assets, "bitc", ["symbol", "name"])).toEqual([WBTC])
  })

  it("returns every item for an empty or blank search", () => {
    expect(arraySearch(assets, "", ["symbol", "name"])).toEqual(assets)
    expect(arraySearch(assets, "  ", ["symbol", "name"])).toEqual(assets)
  })

  it("returns nothing when no key matches", () => {
    expect(arraySearch(assets, "doge", ["symbol", "name"])).toEqual([])
  })

  it("orders matches by key order, not by input order", () => {
    expect(arraySearch([WBTC, ETH], "e", ["symbol", "name"])).toEqual([
      ETH,
      WBTC,
    ])
    expect(arraySearch([WBTC, ETH], "e", ["name", "symbol"])).toEqual([
      WBTC,
      ETH,
    ])
  })

  it("returns an item once even when several keys match", () => {
    expect(arraySearch([WETH], "eth", ["symbol", "name"])).toEqual([WETH])
  })

  it("only looks at the given keys", () => {
    expect(arraySearch(assets, "zcash", ["symbol"])).toEqual([])
  })

  it("searches every string property when no keys are given", () => {
    expect(arraySearch(assets, "zcash")).toEqual([ZEC])
    expect(arraySearch(assets, "18")).toEqual([])
  })

  it("matches when any word of a multi-word search matches", () => {
    expect(arraySearch(assets, "usd ether", ["name"])).toEqual([
      ETH,
      WETH,
      USDC,
    ])
  })

  it("treats dashes, dots and underscores as word separators", () => {
    const items = [{ name: "polkadot-js" }, { name: "talisman" }]

    expect(arraySearch(items, "js.wallet", ["name"])).toEqual([items[0]])
  })

  it("ignores diacritics on both sides", () => {
    const items = [{ name: "Müller" }, { name: "Astrom" }]

    expect(arraySearch(items, "muller", ["name"])).toEqual([items[0]])
    expect(arraySearch(items, "Åström", ["name"])).toEqual([items[1]])
  })

  it("skips items whose searched key is empty", () => {
    const items = [{ name: "" }, { name: "Alice" }]

    expect(arraySearch(items, "", ["name"])).toEqual([items[1]])
  })
})
