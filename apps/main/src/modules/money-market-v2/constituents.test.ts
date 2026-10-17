import { describe, expect, it } from "vitest"

import { ASSET_ID_TO_DEFILLAMA_ID } from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID } from "@/api/external/kamino"
import {
  ConstituentFeed,
  feedSource,
  poolProportion,
  resolveConstituents,
} from "@/modules/money-market-v2/constituents"
import { adjustedApy } from "@/modules/money-market-v2/effectiveApy"

const VDOT = "15"
const POOL = "690"
const ADOT = "1001"
const DOT = "5"

const known = (
  kind: ConstituentFeed["kind"],
  apy: string,
): ConstituentFeed => ({
  kind,
  reading: { status: "known", reading: { apy, asOf: 1_700_000_000_000 } },
})

const HYDRATION_SUPPLY_APYS = new Map([
  [VDOT, "0.0124"],
  [DOT, "0.02"],
])

const reserve = {
  supplyApy: "0.0124",
  variableBorrowApy: "0.012",
  borrowingEnabled: false,
  supplyIncentives: [],
}

describe("feedSource", () => {
  it("reads a DefiLlama id as a staking yield", () => {
    const [assetId, id] = Object.entries(ASSET_ID_TO_DEFILLAMA_ID)[0]!

    expect(feedSource(assetId)).toEqual({
      source: "defillama",
      id,
      kind: "stake",
    })
  })

  it("reads a Kamino id as a native yield", () => {
    const [assetId, id] = Object.entries(ASSET_ID_TO_KAMINO_ID)[0]!

    expect(feedSource(assetId)).toEqual({
      source: "kamino",
      id,
      kind: "nativeYield",
    })
  })

  it("has nothing for an asset without a configured feed", () => {
    expect(feedSource("not-configured")).toBeUndefined()
  })
})

describe("poolProportion", () => {
  const pool = {
    reserves: [
      { asset_id: 1001, displayAmount: "600" },
      { asset_id: 15, displayAmount: "400" },
    ],
    totalDisplayAmount: "1000",
  }

  it("is the asset's share of the pool's display value", () => {
    expect(poolProportion(ADOT, pool)).toBe("0.6")
    expect(poolProportion(VDOT, pool)).toBe("0.4")
  })

  it("is missing without pool data, without the asset or without a total", () => {
    expect(poolProportion(ADOT, undefined)).toBeUndefined()
    expect(poolProportion("999", pool)).toBeUndefined()
    expect(
      poolProportion(ADOT, { ...pool, totalDisplayAmount: "0" }),
    ).toBeUndefined()
  })
})

describe("resolveConstituents", () => {
  it("resolves a plain asset with a feed to itself", () => {
    const result = resolveConstituents({
      assetId: VDOT,
      supplyApy: "0.0124",
      hydrationSupplyApys: new Map([[VDOT, "0.5"]]),
      feeds: new Map([[VDOT, known("stake", "0.0336")]]),
    })

    expect(result).toEqual({
      constituents: [
        {
          assetId: VDOT,
          proportion: "1",
          supplyApy: "0.0124",
          feed: { kind: "stake", apy: "0.0336" },
        },
      ],
      loading: false,
    })
  })

  it("resolves a plain asset without a configured feed to no feed", () => {
    const { constituents, loading } = resolveConstituents({
      assetId: DOT,
      supplyApy: "0.02",
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map([[VDOT, known("stake", "0.0336")]]),
    })

    expect(constituents).toEqual([
      { assetId: DOT, proportion: "1", supplyApy: "0.02", feed: undefined },
    ])
    expect(loading).toBe(false)
  })

  it("turns an unavailable feed into a null APY", () => {
    const { constituents, loading } = resolveConstituents({
      assetId: VDOT,
      supplyApy: "0.0124",
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map([
        [VDOT, { kind: "stake", reading: { status: "unavailable" } }],
      ]),
    })

    expect(constituents[0]?.feed).toEqual({ kind: "stake", apy: null })
    expect(loading).toBe(false)
    expect(
      adjustedApy({
        reserve,
        constituents,
        lpFeeApy: undefined,
        vaultApr: undefined,
      }).supply,
    ).toEqual({ status: "unavailable" })
  })

  it("resolves a two-asset pool with one fed asset", () => {
    const { constituents, loading } = resolveConstituents({
      assetId: POOL,
      supplyApy: "0.9",
      poolAssets: [
        { assetId: ADOT, underlyingAssetId: DOT, proportion: "0.6" },
        { assetId: VDOT, proportion: "0.4" },
      ],
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map([
        [VDOT, known("stake", "0.05")],
        // A feed keyed by the underlying, not the pool asset, is not matched.
        [DOT, known("nativeYield", "0.5")],
      ]),
    })

    expect(constituents).toEqual([
      { assetId: ADOT, proportion: "0.6", supplyApy: "0.02", feed: undefined },
      {
        assetId: VDOT,
        proportion: "0.4",
        supplyApy: "0.0124",
        feed: { kind: "stake", apy: "0.05" },
      },
    ])
    expect(loading).toBe(false)

    // 0.6 x 0.02 + 0.4 x (0.0124 + 0.05) + 0.004; the share's own 0.9 is unused
    const { supply } = adjustedApy({
      reserve,
      constituents,
      lpFeeApy: "0.004",
      vaultApr: undefined,
    })
    expect(supply).toMatchObject({ status: "known", total: "0.04096" })
  })

  it("leaves a pool asset with no hydration_v3 reserve without a base APY", () => {
    const { constituents } = resolveConstituents({
      assetId: POOL,
      supplyApy: "0",
      poolAssets: [{ assetId: "222", proportion: "1" }],
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map(),
    })

    expect(constituents).toEqual([
      {
        assetId: "222",
        proportion: "1",
        supplyApy: undefined,
        feed: undefined,
      },
    ])
  })

  it("passes a missing proportion through, never an equal split", () => {
    const { constituents, loading } = resolveConstituents({
      assetId: POOL,
      supplyApy: "0",
      poolAssets: [
        { assetId: ADOT, underlyingAssetId: DOT },
        { assetId: VDOT, proportion: "0.4" },
      ],
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map([[VDOT, known("stake", "0.05")]]),
    })

    expect(constituents.map(({ proportion }) => proportion)).toEqual([
      undefined,
      "0.4",
    ])
    expect(loading).toBe(false)
    expect(
      adjustedApy({
        reserve,
        constituents,
        lpFeeApy: "0.004",
        vaultApr: undefined,
      }).supply,
    ).toEqual({ status: "unavailable" })
  })

  it("flags a loading feed of one of its own constituents", () => {
    const feeds = new Map<string, ConstituentFeed>([
      [VDOT, { kind: "stake", reading: { status: "loading" } }],
    ])

    const pool = resolveConstituents({
      assetId: POOL,
      supplyApy: "0",
      poolAssets: [
        { assetId: ADOT, underlyingAssetId: DOT, proportion: "0.6" },
        { assetId: VDOT, proportion: "0.4" },
      ],
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds,
    })

    expect(pool.loading).toBe(true)
    expect(pool.constituents[1]?.feed).toEqual({ kind: "stake", apy: null })

    const plain = resolveConstituents({
      assetId: VDOT,
      supplyApy: "0.0124",
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds,
    })

    expect(plain.loading).toBe(true)
  })

  it("does not wait on a feed that is not its own", () => {
    const { loading } = resolveConstituents({
      assetId: DOT,
      supplyApy: "0.02",
      hydrationSupplyApys: HYDRATION_SUPPLY_APYS,
      feeds: new Map([
        [VDOT, { kind: "stake", reading: { status: "loading" } }],
      ]),
    })

    expect(loading).toBe(false)
  })
})
