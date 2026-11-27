import { Destination } from "@galacticcouncil/xc-intents"
import { describe, expect, it } from "vitest"

import { toXcDestinationPairs } from "@/modules/trade/swap/sections/XcTwap/utils/destinations"

const destination = (
  symbol: string,
  asset: string,
  decimals: number,
): Destination => ({
  symbol,
  asset,
  decimals,
  outPerIn: 1n,
  routeMin: 0n,
  payoutFee: 0n,
})

const logos = {
  chain: (chainKey: string) => `chain:${chainKey}`,
  asset: (chainKey: string, symbol: string) => `asset:${chainKey}:${symbol}`,
}

describe("toXcDestinationPairs", () => {
  it("maps ZEC, BTC and NEAR to their chains", () => {
    const pairs = toXcDestinationPairs(
      [
        destination("ZEC", "nep141:zec.omft.near", 8),
        destination("BTC", "nep141:nbtc.bridge.near", 8),
        destination("NEAR", "nep141:wrap.near", 24),
      ],
      logos,
    )

    expect(
      pairs.map(({ chain, asset }) => ({
        chainKey: chain.key,
        platform: chain.platform,
        chainName: chain.name,
        chainLogo: chain.logo,
        symbol: asset.symbol,
        oneClickId: asset.oneClickId,
        decimals: asset.decimals,
        assetLogo: asset.logo,
      })),
    ).toEqual([
      {
        chainKey: "zec",
        platform: "zec",
        chainName: "Zcash",
        chainLogo: "chain:zec",
        symbol: "ZEC",
        oneClickId: "nep141:zec.omft.near",
        decimals: 8,
        assetLogo: "asset:zec:ZEC",
      },
      {
        chainKey: "btc",
        platform: "btc",
        chainName: "Bitcoin",
        chainLogo: "chain:btc",
        symbol: "BTC",
        oneClickId: "nep141:nbtc.bridge.near",
        decimals: 8,
        assetLogo: "asset:btc:BTC",
      },
      {
        chainKey: "near",
        platform: "near",
        chainName: "NEAR",
        chainLogo: "chain:near",
        symbol: "NEAR",
        oneClickId: "nep141:wrap.near",
        decimals: 24,
        assetLogo: "asset:near:NEAR",
      },
    ])
  })

  it("drops symbols missing from the table", () => {
    const pairs = toXcDestinationPairs(
      [
        destination("SOL", "nep141:sol.omft.near", 9),
        destination("ZEC", "nep141:zec.omft.near", 8),
      ],
      logos,
    )

    expect(pairs.map(({ asset }) => asset.symbol)).toEqual(["ZEC"])
  })

  it("validates the recipient with the chain's address check", () => {
    const [btc] = toXcDestinationPairs(
      [destination("BTC", "nep141:nbtc.bridge.near", 8)],
      logos,
    )

    expect(
      btc?.chain.addressValidator("bc1q8x6u5y28vajpgnks5nvfqlqave9kgwyp8f6x92"),
    ).toBe(true)
    expect(btc?.chain.addressValidator("alice.near")).toBe(false)
  })
})
