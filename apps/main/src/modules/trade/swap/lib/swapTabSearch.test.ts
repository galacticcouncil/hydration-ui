import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
  normalizeSearchForSwapTab,
} from "@/modules/trade/swap/lib/swapTabSearch"
import { XcPlatform } from "@/utils/trade"

const ZEC_OUT = "nep141:zec.omft.near"
const BTC_OUT = "nep141:nbtc.bridge.near"

const search = (destPlatform: XcPlatform, assetOut: string, assetIn = "5") => ({
  assetIn,
  assetOut,
  destPlatform,
  allPairs: true,
})

const hydrationDefaults = () =>
  search(HYDRATION_CHAIN_KEY, DEFAULT_TRADE_ASSET_OUT_ID)

describe("normalizeSearchForSwapTab", () => {
  it("keeps BTC on the TWAP tab", () => {
    const input = search("btc", BTC_OUT)
    expect(normalizeSearchForSwapTab("twap", input)).toBe(input)
  })

  it("keeps ZEC on the TWAP tab", () => {
    const input = search("zec", ZEC_OUT)
    expect(normalizeSearchForSwapTab("twap", input)).toBe(input)
  })

  it("falls back to a Hydration sell asset for a Intent TWAP", () => {
    expect(
      normalizeSearchForSwapTab("twap", search("near", "wrap.near", "eth")),
    ).toEqual(search("near", "wrap.near", DEFAULT_TRADE_ASSET_IN_ID))
  })

  it("normalises BTC on the Market tab, which only TWAP supports", () => {
    expect(normalizeSearchForSwapTab("market", search("btc", BTC_OUT))).toEqual(
      hydrationDefaults(),
    )
  })

  it("keeps ZEC on the Market tab", () => {
    const input = search("zec", ZEC_OUT, "eth")
    expect(normalizeSearchForSwapTab("market", input)).toBe(input)
  })

  it("normalises ZEC on the Limit tab", () => {
    expect(normalizeSearchForSwapTab("limit", search("zec", ZEC_OUT))).toEqual(
      hydrationDefaults(),
    )
  })

  it("keeps an on-chain search on every tab", () => {
    const input = search(HYDRATION_CHAIN_KEY, "0")
    for (const tab of ["market", "limit", "twap"]) {
      expect(normalizeSearchForSwapTab(tab, input)).toBe(input)
    }
  })

  it("leaves an unknown tab alone", () => {
    const input = search("btc", BTC_OUT)
    expect(normalizeSearchForSwapTab("xc", input)).toBe(input)
  })
})
