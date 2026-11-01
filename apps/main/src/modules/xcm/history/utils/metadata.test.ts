import type { XcAssetOperation, XcJourney } from "@galacticcouncil/xc-scan"
import { describe, expect, it, vi } from "vitest"

import type { XcScanAssets, XcScanChains } from "@/api/xcScanMetadata"

import { resolveAssetIcon } from "./assets"
import {
  enrichJourneyAsset,
  enrichJourneyAssets,
  getJourneyChainName,
} from "./metadata"

vi.mock("@/modules/xcm/history/utils/claim", () => ({
  resolveChainFromUrn: (urn: string) =>
    urn === "urn:ocn:polkadot:2034" ? { name: "Hydration" } : undefined,
}))
vi.mock("@galacticcouncil/money-market/ui-config", () => ({
  AaveV3HydrationMainnet: {
    GHO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
}))

const chains: XcScanChains = {
  "urn:ocn:paseo:0": {
    urn: "urn:ocn:paseo:0",
    runtimeChain: "Paseo Testnet",
    chainTokens: ["PAS"],
    chainDecimals: [10],
  },
  "urn:ocn:paseo:1000": {
    urn: "urn:ocn:paseo:1000",
    runtimeChain: "Paseo Asset Hub",
    chainTokens: ["PAS"],
    chainDecimals: [10],
  },
}

describe("journey metadata enrichment", () => {
  it("resolves empty native identifiers to the same registered logo as explicit native identifiers", () => {
    expect(resolveAssetIcon("urn:ocn:polkadot:2034|")).toEqual(
      resolveAssetIcon("urn:ocn:polkadot:2034|native"),
    )
    expect(resolveAssetIcon("urn:ocn:polkadot:2034|")).toMatchObject({
      assetId: "0",
    })
  })

  it("resolves the example's chain names by their complete network URNs", () => {
    expect(getJourneyChainName("urn:ocn:paseo:0", chains)).toBe("Paseo Testnet")
    expect(getJourneyChainName("urn:ocn:paseo:1000", chains)).toBe(
      "Paseo Asset Hub",
    )
    expect(getJourneyChainName("urn:ocn:polkadot:1000", chains)).toBe(
      "urn:ocn:polkadot:1000",
    )
  })

  it("preserves known SDK chain names and raw identifiers when metadata is unavailable", () => {
    expect(getJourneyChainName("urn:ocn:polkadot:2034", chains)).toBe(
      "Hydration",
    )
    expect(getJourneyChainName("urn:ocn:unknown:1000", chains)).toBe(
      "urn:ocn:unknown:1000",
    )
  })

  it.each(["native", ""])(
    "fills a native %s asset without changing raw amounts or inventing prices",
    (id) => {
      const asset: XcAssetOperation = {
        asset: `urn:ocn:paseo:0|${id}`,
        amount: "100000000",
        role: "transfer",
      }
      expect(enrichJourneyAsset(asset, chains)).toEqual({
        ...asset,
        symbol: "PAS",
        decimals: 10,
      })
      expect(asset).not.toHaveProperty("decimals")
    },
  )

  it("keeps the example's supplied PAS values intact", () => {
    const asset = {
      asset: "urn:ocn:paseo:0|native",
      amount: "100000000",
      symbol: "PAS",
      decimals: 10,
      role: "transfer" as const,
    }
    expect(enrichJourneyAsset(asset, chains)).toBe(asset)
  })

  it("matches asset metadata by network and identifier, never by symbol or para ID alone", () => {
    const asset = { asset: "urn:ocn:paseo:1000|42", amount: "900" }
    const metadata: XcScanAssets = {
      "urn:ocn:polkadot:1000|42": {
        chainId: "urn:ocn:polkadot:1000",
        id: "42",
        symbol: "WRONG",
        decimals: 12,
      },
      "urn:ocn:paseo:1000|42": {
        chainId: "urn:ocn:paseo:1000",
        id: "42",
        symbol: "TEST",
        decimals: 0,
      },
    }
    expect(enrichJourneyAsset(asset, chains, metadata)).toEqual({
      ...asset,
      symbol: "TEST",
      decimals: 0,
    })
  })

  it("does not treat arbitrary asset IDs as the network's native token", () => {
    const asset = { asset: "urn:ocn:paseo:1000|999", amount: "100" }
    expect(enrichJourneyAsset(asset, chains)).toBe(asset)
  })

  it("leaves unknown networks untouched rather than borrowing another network's decimals", () => {
    const asset = { asset: "urn:ocn:other:0|native", amount: "100" }
    expect(enrichJourneyAsset(asset, chains)).toBe(asset)
  })

  it("preserves a supplied symbol and zero decimals when filling another field", () => {
    const asset = {
      asset: "urn:ocn:paseo:0|native",
      amount: "100",
      decimals: 0,
    }
    expect(enrichJourneyAsset(asset, chains)).toEqual({
      ...asset,
      symbol: "PAS",
    })
    expect(
      enrichJourneyAsset(
        { ...asset, decimals: undefined, symbol: "CUSTOM" },
        chains,
      ),
    ).toMatchObject({ symbol: "CUSTOM", decimals: 10 })
  })

  it("does not mutate the shared history records", () => {
    const journey = {
      correlationId: "example",
      assets: [{ asset: "urn:ocn:paseo:0|native", amount: "100000000" }],
    } as XcJourney
    const result = enrichJourneyAssets([journey], chains)
    expect(result[0]?.assets[0]).toMatchObject({ symbol: "PAS", decimals: 10 })
    expect(journey.assets[0]).not.toHaveProperty("symbol")
    expect(enrichJourneyAssets(result, chains)[0]).toBe(result[0])
  })
})
