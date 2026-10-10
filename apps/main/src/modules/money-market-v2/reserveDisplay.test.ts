import type {
  CustomMarket,
  MarketDescriptor,
} from "@galacticcouncil/money-market-v2/types"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import {
  reserveDisplay,
  ReserveDisplayRegistry,
} from "@/modules/money-market-v2/reserveDisplay"

const ADDRESS = "0x0000000000000000000000000000000000000001"
const HOLLAR_TOKEN = "0x531a654d1696ED52e7275A8cede955E82620f99a"

// the app's vitest cannot load the package's `markets`; only the market key
// and the Hollar token matter to the seam
const market = (key: CustomMarket): MarketDescriptor => ({
  market: key,
  marketTitle: key,
  addresses: {
    POOL_ADDRESSES_PROVIDER: ADDRESS,
    POOL: ADDRESS,
    UI_POOL_DATA_PROVIDER: ADDRESS,
    UI_INCENTIVE_DATA_PROVIDER: ADDRESS,
    WALLET_BALANCE_PROVIDER: ADDRESS,
    HOLLAR_TOKEN,
  },
})

const MAIN = market("hydration_v3")
const BIL = market("bil_v3")

const asset = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
})

const ASSETS = [
  asset("690", "2-Pool-GDOT", "2-Pool-GDOT"),
  asset("5", "DOT", "Polkadot"),
  asset("222", "HOLLAR", "Hydrated Dollar"),
]
const A_TOKENS: Record<string, ReturnType<typeof asset>> = {
  "690": asset("69", "GDOT", "Giga DOT"),
}

const registry = (
  aTokens: typeof A_TOKENS = A_TOKENS,
): ReserveDisplayRegistry => ({
  getAsset: (id) => ASSETS.find((a) => a.id === id),
  getRelatedAToken: (id) => aTokens[id],
})

const reserve = (underlyingAsset: string, symbol: string, name: string) => ({
  underlyingAsset: underlyingAsset as `0x${string}`,
  symbol,
  name,
})

const GDOT = reserve(getAddressFromAssetId("690"), "2-Pool-GDOT", "chain GDOT")
const DOT = reserve(getAddressFromAssetId("5"), "chainDOT", "chain Polkadot")

describe("reserveDisplay", () => {
  it("shows a pool-share reserve as its aToken", () => {
    expect(reserveDisplay(GDOT, MAIN, registry())).toEqual({
      name: "Giga DOT",
      symbol: "GDOT",
      logoId: "69",
    })
  })

  it("shows a pool-share reserve without an aToken as any other reserve", () => {
    expect(reserveDisplay(GDOT, MAIN, registry({}))).toEqual({
      name: "2-Pool-GDOT",
      symbol: "2-Pool-GDOT",
      logoId: "690",
    })
  })

  it("shows an ordinary reserve as its registry asset", () => {
    expect(reserveDisplay(DOT, MAIN, registry())).toEqual({
      name: "Polkadot",
      symbol: "DOT",
      logoId: "5",
    })
  })

  it("falls back to the chain's name and symbol when the registry has no asset", () => {
    const unknown = reserve(getAddressFromAssetId("1234"), "UNK", "Unknown")

    expect(reserveDisplay(unknown, MAIN, registry())).toEqual({
      name: "Unknown",
      symbol: "UNK",
      logoId: "1234",
    })
  })

  it("shows a listed id on another market as an ordinary reserve", () => {
    expect(reserveDisplay(GDOT, BIL, registry())).toEqual({
      name: "2-Pool-GDOT",
      symbol: "2-Pool-GDOT",
      logoId: "690",
    })
  })

  it("resolves Hollar, whose token is not an asset precompile", () => {
    const hollar = reserve(HOLLAR_TOKEN, "HOLLAR", "chain Hollar")

    expect(reserveDisplay(hollar, MAIN, registry())).toEqual({
      name: "Hydrated Dollar",
      symbol: "HOLLAR",
      logoId: "222",
    })
  })
})
