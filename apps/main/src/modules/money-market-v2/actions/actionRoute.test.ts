import type {
  CustomMarket,
  MarketDescriptor,
} from "@galacticcouncil/money-market-v2/types"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import { actionRoute } from "@/modules/money-market-v2/actions/actionRoute"

const ADDRESS = "0x0000000000000000000000000000000000000001"

// the app's vitest cannot load the package's `markets`; only the market key
// and the Hollar token matter to the route
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

const reserve = (assetId: string, isIsolated = false) => ({
  underlyingAsset: getAddressFromAssetId(assetId) as `0x${string}`,
  isIsolated,
})

const GDOT = reserve("690")
const PRIME = reserve("43", true)
const DOT = reserve("5")

describe("actionRoute", () => {
  it("opens the stablepool modal for pool-share supply", () => {
    expect(actionRoute("supply", GDOT, MAIN, true)).toBe("addStablepool")
  })

  it("opens the isolated-supply modal for isolated supply on the main market", () => {
    expect(actionRoute("supply", PRIME, MAIN, true)).toBe("supplyIsolated")
  })

  it("opens the remove modal for pool-share withdraw", () => {
    expect(actionRoute("withdraw", GDOT, MAIN, true)).toBe("removeMoneyMarket")
  })

  it("treats an isolated pool-share reserve as pool-share", () => {
    const isolatedGdot = { ...GDOT, isIsolated: true }

    expect(actionRoute("supply", isolatedGdot, MAIN, true)).toBe(
      "addStablepool",
    )
  })

  it("falls back to the form when the aToken is missing", () => {
    expect(actionRoute("supply", GDOT, MAIN, false)).toBe("form")
    expect(actionRoute("supply", PRIME, MAIN, false)).toBe("form")
    expect(actionRoute("withdraw", GDOT, MAIN, false)).toBe("form")
  })

  it("withdraws an isolated reserve through the form", () => {
    expect(actionRoute("withdraw", PRIME, MAIN, true)).toBe("form")
  })

  it("supplies an isolated reserve on another market through the form", () => {
    expect(actionRoute("supply", PRIME, BIL, true)).toBe("form")
  })

  it("keeps pool-share reserves on another market on the form", () => {
    expect(actionRoute("supply", GDOT, BIL, true)).toBe("form")
    expect(actionRoute("withdraw", GDOT, BIL, true)).toBe("form")
  })

  it("keeps a plain reserve on the form", () => {
    expect(actionRoute("supply", DOT, MAIN, true)).toBe("form")
    expect(actionRoute("withdraw", DOT, MAIN, true)).toBe("form")
  })

  it("keeps borrow, repay and collateral on the form", () => {
    for (const r of [GDOT, PRIME]) {
      expect(actionRoute("borrow", r, MAIN, true)).toBe("form")
      expect(actionRoute("repay", r, MAIN, true)).toBe("form")
      expect(actionRoute("collateral", r, MAIN, true)).toBe("form")
    }
  })
})
