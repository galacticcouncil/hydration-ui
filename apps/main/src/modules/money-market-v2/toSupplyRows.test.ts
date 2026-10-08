import type {
  CustomMarket,
  MarketDescriptor,
} from "@galacticcouncil/money-market-v2/types"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import {
  ToSupplyRow,
  toSupplyRows,
} from "@/modules/money-market-v2/toSupplyRows"

const ADDRESS = "0x0000000000000000000000000000000000000001"

// the app's vitest cannot load the package's `markets`; only the market key
// and the Hollar token matter here
const market = (key: CustomMarket): MarketDescriptor => ({
  market: key,
  marketTitle: key,
  addresses: {
    POOL_ADDRESSES_PROVIDER: ADDRESS,
    POOL: ADDRESS,
    UI_POOL_DATA_PROVIDER: ADDRESS,
    UI_INCENTIVE_DATA_PROVIDER: ADDRESS,
    WALLET_BALANCE_PROVIDER: ADDRESS,
    HOLLAR_TOKEN: "0x531a654d1696ED52e7275A8cede955E82620f99a",
  },
})

const MAIN = market("hydration_v3")
const BIL = market("bil_v3")

type Row = ToSupplyRow & { symbol: string }

const row = (
  symbol: string,
  assetId: string,
  balanceUsd?: string,
  isIsolated = false,
): Row => ({
  symbol,
  reserve: {
    underlyingAsset: getAddressFromAssetId(assetId) as `0x${string}`,
    isIsolated,
  },
  balance: balanceUsd,
  balanceUsd,
})

// chain order, deliberately not the pinned order
const DOT = row("DOT", "5", "10")
const USDC = row("USDC", "22", "300")
const WETH = row("WETH", "20")
const PRIME = row("PRIME", "43", undefined, true)
const APYUSD = row("apyUSD", "46", "50", true)
const HUSDC = row("HUSDC", "110")
const GETH = row("GETH", "4200")
const GDOT = row("GDOT", "690")
const ROWS = [DOT, PRIME, HUSDC, USDC, GETH, WETH, APYUSD, GDOT]

const symbols = (args: Partial<Parameters<typeof toSupplyRows<Row>>[0]> = {}) =>
  toSupplyRows({
    rows: ROWS,
    market: MAIN,
    showZeroBalance: false,
    inCategory: () => true,
    ...args,
  }).rows.map((r) => r.symbol)

describe("toSupplyRows", () => {
  it("leads with isolated reserves, then pool-share ones in list order", () => {
    expect(symbols().slice(0, 5)).toEqual([
      "PRIME",
      "apyUSD",
      "GDOT",
      "GETH",
      "HUSDC",
    ])
  })

  it("flags the pinned rows only", () => {
    const { rows } = toSupplyRows({
      rows: ROWS,
      market: MAIN,
      showZeroBalance: true,
      inCategory: () => true,
    })
    expect(rows.filter((r) => r.pinned).map((r) => r.symbol)).toEqual([
      "PRIME",
      "apyUSD",
      "GDOT",
      "GETH",
      "HUSDC",
    ])
  })

  it("keeps a pinned row without a balance and hides an ordinary one", () => {
    expect(symbols()).toEqual([
      "PRIME",
      "apyUSD",
      "GDOT",
      "GETH",
      "HUSDC",
      "USDC",
      "DOT",
    ])
  })

  it("shows ordinary rows without a balance when asked, largest first", () => {
    expect(symbols({ showZeroBalance: true }).slice(5)).toEqual([
      "USDC",
      "DOT",
      "WETH",
    ])
  })

  it("shows every ordinary row to a wallet that holds nothing", () => {
    const rows = [row("DOT", "5"), row("GDOT", "690"), row("WETH", "20")]
    const result = toSupplyRows({
      rows,
      market: MAIN,
      showZeroBalance: false,
      inCategory: () => true,
    })
    expect(result.rows.map((r) => r.symbol)).toEqual(["GDOT", "DOT", "WETH"])
    expect(result.hidesZeroBalance).toBe(false)
  })

  it("applies the category filter to pinned rows too", () => {
    expect(symbols({ inCategory: (r) => r.symbol.includes("DOT") })).toEqual([
      "GDOT",
      "DOT",
    ])
  })

  it("reports a held-back row only for ordinary reserves", () => {
    const args = { market: MAIN, showZeroBalance: false }
    expect(
      toSupplyRows({ ...args, rows: ROWS, inCategory: () => true })
        .hidesZeroBalance,
    ).toBe(true)
    // every zero-balance row in the category is pinned: nothing is held back
    expect(
      toSupplyRows({
        ...args,
        rows: ROWS,
        inCategory: (r) => r.symbol.includes("DOT"),
      }).hidesZeroBalance,
    ).toBe(false)
  })

  it("pins nothing on another market", () => {
    const { rows } = toSupplyRows({
      rows: ROWS,
      market: BIL,
      showZeroBalance: false,
      inCategory: () => true,
    })
    expect(rows.some((r) => r.pinned)).toBe(false)
    expect(rows.map((r) => r.symbol)).toEqual(["USDC", "apyUSD", "DOT"])
  })
})
