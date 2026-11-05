import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { describe, expect, it, vi } from "vitest"

import {
  getAutomaticBridgeProvider,
  resolveAutomaticBridgeRoute,
} from "@/modules/xcm/transfer/utils/automaticRoute"

vi.mock("@galacticcouncil/ui/assets/icons", () => ({
  WormholeLogo: () => null,
  ZapIcon: () => null,
}))
vi.mock("@/i18n", () => ({ default: { t: (key: string) => key } }))
vi.mock("@/states/transactions", () => ({
  XcmTag: {
    Basejump: "Basejump",
    NttExecutor: "NttExecutor",
    Wormhole: "Wormhole",
    Snowbridge: "Snowbridge",
    SnowbridgeV1: "SnowbridgeV1",
  },
  BRIDGE_PROVIDER_TAGS: ["Basejump", "NttExecutor", "Wormhole", "Snowbridge"],
}))

const sourceAsset = new Asset({ key: "usdc", originSymbol: "USDC" })
const destinationAsset = new Asset({ key: "usdc_eth", originSymbol: "USDC" })
const otherAsset = new Asset({ key: "usdc_wh", originSymbol: "USDC" })
const destinationChain = { key: "hydration" } as AnyChain

const route = (tags: string[], asset = destinationAsset): AssetRoute =>
  new AssetRoute({
    source: { asset: sourceAsset },
    destination: {
      asset,
      chain: destinationChain,
      fee: { asset, amount: 0 },
    },
    tags,
  })

describe("automatic bridge route", () => {
  it("prefers Snowbridge V2 even when V1 is configured first", () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    const v2 = route(["Snowbridge"])
    const routes = [v1, v2]

    expect(resolveAutomaticBridgeRoute(routes, destinationAsset)).toBe(v2)
    expect(getAutomaticBridgeProvider(v2)).toBe("Snowbridge")
    expect(routes).toEqual([v1, v2])
  })

  it("supports V1-only routes with an explicit version provider", () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    expect(resolveAutomaticBridgeRoute([v1], destinationAsset.key)).toBe(v1)
    expect(getAutomaticBridgeProvider(v1)).toBe("SnowbridgeV1")
  })

  it("supports V2 alone and does not select an unrelated arriving token", () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    const v2ForOtherAsset = route(["Snowbridge"], otherAsset)
    expect(
      resolveAutomaticBridgeRoute([v2ForOtherAsset, v1], destinationAsset),
    ).toBe(v1)
    expect(resolveAutomaticBridgeRoute([v2ForOtherAsset], otherAsset)).toBe(
      v2ForOtherAsset,
    )
    expect(
      resolveAutomaticBridgeRoute([v2ForOtherAsset], destinationAsset),
    ).toBeNull()
    expect(getAutomaticBridgeProvider(null)).toBeNull()
  })

  it("prefers the executor over manual Wormhole for the same arriving token", () => {
    const manual = route(["Wormhole"], otherAsset)
    const executor = route(["Wormhole", "NttExecutor"], otherAsset)
    const snowbridge = route(["Snowbridge"])
    expect(
      resolveAutomaticBridgeRoute([manual, snowbridge, executor], otherAsset),
    ).toBe(executor)
    expect(getAutomaticBridgeProvider(executor)).toBe("NttExecutor")
  })

  it("keeps the existing bridge priority and stable ties", () => {
    const executor = route(["Wormhole", "NttExecutor"], otherAsset)
    const first = route(["Basejump"], otherAsset)
    const second = route(["Basejump"], otherAsset)
    expect(
      resolveAutomaticBridgeRoute([executor, first, second], otherAsset),
    ).toBe(first)
    expect(resolveAutomaticBridgeRoute([], destinationAsset)).toBeNull()
  })
})
