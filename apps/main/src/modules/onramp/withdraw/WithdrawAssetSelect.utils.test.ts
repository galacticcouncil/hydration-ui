import type { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import {
  getWithdrawDestinationOptions,
  WithdrawDestinationRoute,
} from "./WithdrawAssetSelect.utils"

const asset = (key: string) => ({ key }) as Asset
const chain = (key: string) => ({ key }) as AnyChain
const route = (
  source: string,
  destinationChain: string,
  destination: string,
): WithdrawDestinationRoute => ({
  sourceAsset: asset(source),
  destinationChain: chain(destinationChain),
  destinationAsset: asset(destination),
})

const registryId = (source: Asset) =>
  ({ usdc: "22", weth: "20" })[source.key as "usdc" | "weth"] ?? null

const supported = new Set(["ethereum", "assethub", "zec"])

describe("withdrawal destination options", () => {
  it("includes direct Hydration transfers without requiring a bridge route", () => {
    const [option] = getWithdrawDestinationOptions(
      [route("hdx", "hydration", "hdx")],
      (source) => (source.key === "hdx" ? "0" : null),
      new Set([...supported, "hydration"]),
    )
    expect(option).toMatchObject({
      assetId: "0",
      sourceAssetKey: "hdx",
      destinationChainKey: "hydration",
      destinationAssetKey: "hdx",
    })
    expect(option?.route).toBeUndefined()
  })

  it("keeps the exact source and destination tuple", () => {
    const [option] = getWithdrawDestinationOptions(
      [route("weth", "ethereum", "eth")],
      registryId,
      supported,
    )
    expect(option).toMatchObject({
      assetId: "20",
      sourceAssetKey: "weth",
      destinationChainKey: "ethereum",
      destinationAssetKey: "eth",
    })
  })

  it("collapses duplicate bridge routes while keeping distinct destinations", () => {
    const options = getWithdrawDestinationOptions(
      [
        route("usdc", "ethereum", "usdc"),
        route("usdc", "ethereum", "usdc"),
        route("usdc", "assethub", "usdc"),
        route("usdc", "ethereum", "wrapped-usdc"),
      ],
      registryId,
      supported,
    )
    expect(options).toHaveLength(3)
    expect(
      options.map(({ destinationChainKey }) => destinationChainKey),
    ).toEqual(["ethereum", "assethub", "ethereum"])
  })

  it("excludes unsupported destinations and sources absent from Hydration", () => {
    expect(
      getWithdrawDestinationOptions(
        [
          route("usdc", "testnet", "usdc"),
          route("unknown", "ethereum", "eth"),
          route("usdc", "zec", "zec"),
        ],
        registryId,
        supported,
      ).map(({ destinationChainKey }) => destinationChainKey),
    ).toEqual(["zec"])
  })
})
