import type {
  CustomMarket,
  MarketDescriptor,
} from "@galacticcouncil/money-market-v2/types"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import {
  isPoolShareReserve,
  isSwapInReserve,
} from "@/modules/money-market-v2/reserves"

const ADDRESS = "0x0000000000000000000000000000000000000001"

// the app's vitest cannot load the package's `markets`; only the market key
// and the Hollar token matter to the predicates
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
const GIGAHDX = market("gigahdx_v3")

const GDOT = getAddressFromAssetId("690")
const POOL_PRIME = getAddressFromAssetId("143")
const PRIME = getAddressFromAssetId("43")
const DOT = getAddressFromAssetId("5")

const reserve = (underlyingAsset: string, isIsolated = false) => ({
  underlyingAsset: underlyingAsset as `0x${string}`,
  isIsolated,
})

describe("isPoolShareReserve", () => {
  it("is true for a listed id on the main market", () => {
    expect(isPoolShareReserve(GDOT, MAIN)).toBe(true)
  })

  it("is false for the same address on another market", () => {
    expect(isPoolShareReserve(GDOT, BIL)).toBe(false)
    expect(isPoolShareReserve(GDOT, GIGAHDX)).toBe(false)
  })

  it("is false for a pool share that is not listed", () => {
    expect(isPoolShareReserve(POOL_PRIME, MAIN)).toBe(false)
  })

  it("is false for a plain reserve", () => {
    expect(isPoolShareReserve(DOT, MAIN)).toBe(false)
  })
})

describe("isSwapInReserve", () => {
  it("is true for a pool-share reserve on the main market only", () => {
    expect(isSwapInReserve(reserve(GDOT), MAIN)).toBe(true)
    expect(isSwapInReserve(reserve(GDOT), BIL)).toBe(false)
  })

  it("is true for an isolated reserve that is not listed, on the main market only", () => {
    expect(isSwapInReserve(reserve(PRIME, true), MAIN)).toBe(true)
    expect(isSwapInReserve(reserve(PRIME, true), BIL)).toBe(false)
    expect(isSwapInReserve(reserve(PRIME, true), GIGAHDX)).toBe(false)
  })

  it("is false for a plain reserve", () => {
    expect(isSwapInReserve(reserve(DOT), MAIN)).toBe(false)
  })
})
