import {
  AnyChain,
  Asset,
  AssetRoute,
  ChainRoutes,
  ConfigService,
} from "@galacticcouncil/xc-core"
import { Transfer, Wallet } from "@galacticcouncil/xc-sdk"
import { describe, expect, it, vi } from "vitest"

import type { XcmTransferArgs } from "@/api/xcm"
import { buildXcmTransfer } from "@/api/xcmRoute"

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

const sourceChain = { key: "ethereum" } as AnyChain
const destinationChain = { key: "hydration" } as AnyChain
const sourceAsset = new Asset({ key: "usdc", originSymbol: "USDC" })
const destinationAsset = new Asset({ key: "usdc_eth", originSymbol: "USDC" })
const otherAsset = new Asset({ key: "usdc_wh", originSymbol: "USDC" })

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

const setup = (routes: AssetRoute[], reverseRoutes: AssetRoute[] = []) => {
  const config = new ConfigService({
    assets: new Map(
      [sourceAsset, destinationAsset, otherAsset].map((asset) => [
        asset.key,
        asset,
      ]),
    ),
    chains: new Map(
      [sourceChain, destinationChain].map((chain) => [chain.key, chain]),
    ),
    routes: new Map([
      [sourceChain.key, new ChainRoutes({ chain: sourceChain, routes })],
      [
        destinationChain.key,
        new ChainRoutes({ chain: destinationChain, routes: reverseRoutes }),
      ],
    ]),
  })
  const transfer = {} as Transfer
  const getTransferData = vi.fn().mockResolvedValue(transfer)
  const wallet = { config, getTransferData } as unknown as Wallet
  const args: XcmTransferArgs = {
    srcAddress: "source-address",
    srcAsset: sourceAsset.key,
    srcChain: sourceChain.key,
    destAddress: "destination-address",
    destAsset: destinationAsset.key,
    destChain: destinationChain.key,
    automaticBridgeSelection: true,
  }
  return { wallet, args, transfer, getTransferData }
}

describe("XCM transfer route building", () => {
  it("passes the exact V2 route to the Wallet even with V1 first and a stale V1 tag", async () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    const v2 = route(["Snowbridge"])
    const { wallet, args, transfer, getTransferData } = setup([v1, v2])

    await expect(
      buildXcmTransfer(wallet, { ...args, bridgeTag: "SnowbridgeV1" }),
    ).resolves.toBe(transfer)
    expect(getTransferData).toHaveBeenCalledExactlyOnceWith(
      { origin: { chain: sourceChain, route: v2 }, reversible: false },
      args.srcAddress,
      args.destAddress,
    )
    expect(getTransferData.mock.calls[0]?.[0].origin.route).toBe(
      wallet.config
        .getAssetRoutes(sourceAsset, sourceChain, destinationChain)
        .find((candidate) => !candidate.tags?.includes("SnowbridgeV1")),
    )
    expect(wallet.config.getChainRoutes(sourceChain).getRoutes()).toEqual([
      v1,
      v2,
    ])
  })

  it("uses V1 when it is the only supported version for the selected asset", async () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    const { wallet, args, getTransferData } = setup([
      route(["Snowbridge"], otherAsset),
      v1,
    ])
    await buildXcmTransfer(wallet, args)
    expect(getTransferData.mock.calls[0]?.[0].origin.route).toEqual(v1)
  })

  it("never substitutes a different token when no exact destination route exists", async () => {
    const { wallet, args, getTransferData } = setup([
      route(["Wormhole", "NttExecutor"], otherAsset),
    ])
    await expect(buildXcmTransfer(wallet, args)).rejects.toThrow(
      "No supported route for the selected destination asset",
    )
    expect(getTransferData).not.toHaveBeenCalled()
  })

  it("retains the selected token despite a stale tag belonging to another representation", async () => {
    const executor = route(["Wormhole", "NttExecutor"], otherAsset)
    const { wallet, args, getTransferData } = setup([
      route(["Snowbridge", "SnowbridgeV1"]),
      route(["Wormhole"], otherAsset),
      executor,
    ])
    await buildXcmTransfer(wallet, {
      ...args,
      destAsset: otherAsset.key,
      bridgeTag: "SnowbridgeV1",
    })
    expect(getTransferData.mock.calls[0]?.[0].origin.route).toEqual(executor)
  })

  it("preserves the SDK's explicit manual route selection", async () => {
    const v1 = route(["Snowbridge", "SnowbridgeV1"])
    const v2 = route(["Snowbridge"])
    const { wallet, args, getTransferData } = setup([v2, v1])
    await buildXcmTransfer(wallet, {
      ...args,
      automaticBridgeSelection: undefined,
      bridgeTag: "SnowbridgeV1",
    })
    expect(getTransferData.mock.calls[0]?.[0].origin.route).toEqual(v1)
  })

  it("derives reversibility from the selected route's actual destination", async () => {
    const v2 = route(["Snowbridge"])
    const reverse = new AssetRoute({
      source: { asset: destinationAsset },
      destination: {
        chain: sourceChain,
        asset: sourceAsset,
        fee: { asset: sourceAsset, amount: 0 },
      },
      tags: ["Snowbridge"],
    })
    const { wallet, args, getTransferData } = setup([v2], [reverse])
    await buildXcmTransfer(wallet, args)
    expect(getTransferData.mock.calls[0]?.[0].reversible).toBe(true)
  })
})
