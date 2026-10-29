import type { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import {
  groupDepositAssetOptions,
  NamedDepositAssetPair,
} from "./DepositQuickAssetGroups"

const pair = (
  assetKey: string,
  symbol: string,
  chainKey: string,
  chainName: string,
  name = symbol,
): NamedDepositAssetPair => ({
  asset: { key: assetKey, originSymbol: symbol } as Asset,
  chain: { key: chainKey, name: chainName } as AnyChain,
  name,
})

const dotSources = [
  pair("dot", "DOT", "assethub", "AssetHub Polkadot", "Polkadot"),
  pair("dot", "DOT", "assethub_kusama", "AssetHub Kusama", "Polkadot"),
  pair("dot", "DOT", "bifrost", "Bifrost", "Polkadot"),
]

describe("quick deposit asset grouping", () => {
  it("shows DOT once while retaining the original asset and chain pair for every source", () => {
    const groups = groupDepositAssetOptions(dotSources)
    expect(groups).toHaveLength(1)
    expect(groups[0]?.name).toBe("Polkadot")
    expect(groups[0]?.sources.map(({ chain }) => chain.key)).toEqual([
      "assethub",
      "assethub_kusama",
      "bifrost",
    ])
    dotSources.forEach((source, index) => {
      expect(groups[0]?.sources[index]?.asset).toBe(source.asset)
      expect(groups[0]?.sources[index]?.chain).toBe(source.chain)
    })
  })
  it("never merges different token identities just because their symbols match", () => {
    const groups = groupDepositAssetOptions([
      pair("usdc", "USDC", "ethereum", "Ethereum"),
      pair("usdc.wh", "USDC", "solana", "Solana"),
    ])
    expect(groups.map(({ key }) => key)).toEqual(["usdc", "usdc.wh"])
    expect(groups.every(({ sources }) => sources.length === 1)).toBe(true)
  })
  it("a chain filter exposes only the pair on that exact source chain", () => {
    const groups = groupDepositAssetOptions(dotSources, "assethub_kusama")
    expect(groups).toHaveLength(1)
    expect(groups[0]?.sources).toEqual([
      { asset: dotSources[1]!.asset, chain: dotSources[1]!.chain },
    ])
  })
  it("searches by token name, symbol and source chain without duplicating the token", () => {
    expect(
      groupDepositAssetOptions(dotSources, "all", " DOT ")[0]?.sources,
    ).toHaveLength(3)
    expect(
      groupDepositAssetOptions(dotSources, "all", "polkadot"),
    ).toHaveLength(1)
    const kusama = groupDepositAssetOptions(dotSources, "all", "kusama")
    expect(kusama[0]?.sources.map(({ chain }) => chain.key)).toEqual([
      "assethub_kusama",
    ])
    expect(groupDepositAssetOptions(dotSources, "all", "missing")).toEqual([])
  })
  it("deduplicates repeated route pairs and keeps alphabetical ordering", () => {
    const groups = groupDepositAssetOptions([
      ...dotSources,
      dotSources[0]!,
      pair("aave", "AAVE", "ethereum", "Ethereum"),
    ])
    expect(groups.map(({ key }) => key)).toEqual(["aave", "dot"])
    expect(groups[1]?.sources).toHaveLength(3)
  })
})
