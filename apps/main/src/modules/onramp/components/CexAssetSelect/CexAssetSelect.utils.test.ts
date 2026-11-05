import { describe, expect, it } from "vitest"

import {
  getCexAssetChainKeys,
  getCexAssetsForChain,
} from "./CexAssetSelect.utils"

const assets = [
  { assetId: "hdx", depositChain: "hydration", withdrawalChain: "hydration" },
  { assetId: "dot", depositChain: "assethub", withdrawalChain: "assethub" },
  { assetId: "usdc", depositChain: "assethub", withdrawalChain: "hydration" },
]

describe("CEX asset network selection", () => {
  it("shows only the networks supported by the selected exchange, without duplicates", () => {
    expect(getCexAssetChainKeys(assets, "deposit")).toEqual([
      "hydration",
      "assethub",
    ])
    expect(getCexAssetChainKeys(assets.slice(1, 2), "deposit")).toEqual([
      "assethub",
    ])
    expect(getCexAssetChainKeys([], "deposit")).toEqual([])
  })

  it("selects only assets available on the chosen network for the correct direction", () => {
    expect(
      getCexAssetsForChain(assets, "deposit", "assethub").map(
        ({ assetId }) => assetId,
      ),
    ).toEqual(["dot", "usdc"])
    expect(
      getCexAssetsForChain(assets, "withdraw", "assethub").map(
        ({ assetId }) => assetId,
      ),
    ).toEqual(["dot"])
  })

  it("keeps all assets for the desktop picker and never invents a network match", () => {
    expect(getCexAssetsForChain(assets, "deposit", null)).toBe(assets)
    expect(getCexAssetsForChain(assets, "deposit", "ethereum")).toEqual([])
    expect(assets).toHaveLength(3)
  })
})
