import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Ntt, Wormhole } from "@galacticcouncil/xc-core"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { Hex, hexToBytes, pad } from "viem"
import { describe, expect, it, vi } from "vitest"

import {
  isJourneyClaimable,
  isJourneyPendingClaim,
  resolveChainFromUrn,
} from "@/modules/xcm/history/utils/claim"
import { getChainXcScanUrn } from "@/modules/xcm/history/utils/journey"

// The claim checks are pure; stub the ui and money-market modules so their
// graphs aren't loaded. assets.ts reads the GHO address when it loads.
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))
vi.mock("@galacticcouncil/money-market/ui-config", () => ({
  AaveV3HydrationMainnet: {
    GHO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
}))

const getChain = (key: string) => {
  const chain = chainsMap.get(key)
  if (!chain) throw new Error(`Unknown chain: ${key}`)
  return chain
}

// Unsigned VAA with an empty payload: the claim checks read only the header.
const toVaa = (emitterChain: number, emitter: string, timestamp: number) => {
  const body = new Uint8Array(51)
  const view = new DataView(body.buffer)
  view.setUint32(0, timestamp)
  view.setUint16(8, emitterChain)
  body.set(hexToBytes(pad(emitter as Hex, { size: 32 })), 10)
  view.setBigUint64(42, 1n)

  // version 1, guardian set 0, no signatures
  const vaa = Uint8Array.of(1, 0, 0, 0, 0, 0, ...body)
  return btoa(String.fromCharCode(...vaa))
}

// Hydration -> NEAR ZEC transfer as xc-scan lists it, awaiting redemption.
const toNearJourney = (destination: string): XcJourney => {
  const hydration = getChain("hydration")
  const ntt = Ntt.find(hydration, "zec")
  if (!ntt) throw new Error("No ZEC NTT deployment on hydration")

  const sentAt = Date.now() - 120_000
  const raw = toVaa(
    Wormhole.fromChain(hydration).getWormholeId(),
    ntt.transceiver.wormhole,
    Math.floor(sentAt / 1000),
  )

  return {
    id: 1,
    correlationId: "near-claim",
    status: "waiting",
    type: "transfer",
    originProtocol: "wh_ntt",
    destinationProtocol: "wh_ntt",
    origin: "urn:ocn:polkadot:2034",
    destination,
    from: "0x0000000000000000000000000000000000000001",
    to: "alice.near",
    sentAt,
    createdAt: sentAt,
    stops: JSON.stringify([
      {
        type: "wormhole",
        from: {},
        to: {},
        instructions: {
          type: "WormholeVAA",
          value: { raw, guardianSetIndex: 0, isDuplicated: false },
        },
      },
    ]),
    instructions: "",
    transactCalls: "",
    totalUsd: 0,
    assets: [
      {
        asset: `${destination}|zec.omft.near`,
        symbol: "ZEC",
        amount: "100000",
        decimals: 8,
        role: "transfer",
      },
    ],
  }
}

describe("resolveChainFromUrn", () => {
  it("resolves the xc-scan NEAR urn to NEAR mainnet", () => {
    const chain = resolveChainFromUrn("urn:ocn:near:397")

    expect(chain?.key).toBe("near")
    expect(chain?.isTestChain).toBe(false)
  })

  it("never resolves to near_testnet", () => {
    expect(resolveChainFromUrn("urn:ocn:near:near_testnet")).toBeUndefined()
    expect(resolveChainFromUrn("urn:ocn:near:398")).toBeUndefined()
    expect(resolveChainFromUrn("urn:ocn:near:near")).toBeUndefined()
  })

  it("resolves the urn optimistic NEAR journeys carry", () => {
    const urn = getChainXcScanUrn(getChain("near"))

    expect(resolveChainFromUrn(urn)?.key).toBe("near")
  })

  it.each([
    ["urn:ocn:polkadot:2034", "hydration"],
    ["urn:ocn:ethereum:1", "ethereum"],
    ["urn:ocn:ethereum:8453", "base"],
    ["urn:ocn:solana:101", "solana"],
    ["urn:ocn:sui:0x35834a8a", "sui"],
  ])("resolves %s to %s", (urn, key) => {
    expect(resolveChainFromUrn(urn)?.key).toBe(key)
  })
})

describe("NEAR claims", () => {
  it("offers the claim for a journey xc-scan files under NEAR", () => {
    const journey = toNearJourney("urn:ocn:near:397")

    expect(isJourneyPendingClaim(journey)).toBe(true)
    expect(isJourneyClaimable(journey)).toBe(true)
  })

  it("offers no claim when the urn names no mainnet NEAR chain", () => {
    const journey = toNearJourney("urn:ocn:near:near_testnet")

    expect(isJourneyPendingClaim(journey)).toBe(false)
  })
})
