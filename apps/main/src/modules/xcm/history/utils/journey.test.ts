import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { describe, expect, it, vi } from "vitest"

import {
  fromXcScanChainId,
  getChainXcScanUrn,
} from "@/modules/xcm/history/utils/journey"

// The urn helpers are pure; stub the ui modules so the icon graph isn't loaded.
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))

const getChain = (key: string) => {
  const chain = chainsMap.get(key)
  if (!chain) throw new Error(`Unknown chain: ${key}`)
  return chain
}

describe("getChainXcScanUrn", () => {
  it("files NEAR mainnet under the indexer's id", () => {
    expect(getChainXcScanUrn(getChain("near"))).toBe("urn:ocn:near:397")
  })

  it("keeps near_testnet off the mainnet urn", () => {
    expect(getChainXcScanUrn(getChain("near_testnet"))).toBe(
      "urn:ocn:near:near_testnet",
    )
  })

  it.each([
    ["hydration", "urn:ocn:polkadot:2034"],
    ["assethub_kusama", "urn:ocn:kusama:1000"],
    ["ethereum", "urn:ocn:ethereum:1"],
    ["base", "urn:ocn:ethereum:8453"],
    ["solana", "urn:ocn:solana:101"],
    ["sui", "urn:ocn:sui:0x35834a8a"],
  ])("builds the %s urn from its chain id", (key, urn) => {
    expect(getChainXcScanUrn(getChain(key))).toBe(urn)
  })
})

describe("fromXcScanChainId", () => {
  it("maps the NEAR indexer id back to the chain key", () => {
    const network = { ecosystem: ChainEcosystem.Near, chainId: "397" }

    expect(fromXcScanChainId(network)).toBe("near")
  })

  it.each([
    [ChainEcosystem.Ethereum, "397"],
    [ChainEcosystem.Polkadot, "2034"],
  ])("passes the %s id %s through", (ecosystem, chainId) => {
    expect(fromXcScanChainId({ ecosystem, chainId })).toBe(chainId)
  })
})
