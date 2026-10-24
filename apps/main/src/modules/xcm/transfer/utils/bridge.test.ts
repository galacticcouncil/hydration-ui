import { AssetRoute } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import {
  isPausedBridgeRoute,
  isPausedBridgeTag,
  resolveRouteBuilderArgs,
  resolveValidBridgeProvider,
  shouldPreserveSnowbridgeSubSelection,
  SNOWBRIDGE_PAUSED,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmTag } from "@/states/transactions"

const route = (tags: string[], destAssetKey = "eth"): AssetRoute =>
  ({
    tags,
    destination: { asset: { key: destAssetKey } },
  }) as unknown as AssetRoute

describe("Snowbridge pause", () => {
  it("is enabled", () => {
    expect(SNOWBRIDGE_PAUSED).toBe(true)
  })

  it("marks Snowbridge tags and routes as paused", () => {
    expect(isPausedBridgeTag(XcmTag.Snowbridge)).toBe(true)
    expect(isPausedBridgeTag(XcmTag.SnowbridgeV1)).toBe(true)
    expect(isPausedBridgeTag(XcmTag.Wormhole)).toBe(false)
    expect(isPausedBridgeTag(null)).toBe(false)

    expect(isPausedBridgeRoute(route([XcmTag.Snowbridge]))).toBe(true)
    // V1 routes carry both tags (see pickSnowbridgeVariants)
    expect(
      isPausedBridgeRoute(route([XcmTag.Snowbridge, XcmTag.SnowbridgeV1])),
    ).toBe(true)
    expect(isPausedBridgeRoute(route([XcmTag.Wormhole]))).toBe(false)
    expect(isPausedBridgeRoute(null)).toBe(false)
  })

  it("drops a paused tag from the SDK builder args", () => {
    const routes = [route([XcmTag.Snowbridge]), route([XcmTag.Wormhole])]

    expect(
      resolveRouteBuilderArgs(routes, "eth", XcmTag.Snowbridge).tag,
    ).toBeUndefined()
    expect(
      resolveRouteBuilderArgs(routes, "eth", XcmTag.SnowbridgeV1).tag,
    ).toBeUndefined()
    expect(resolveRouteBuilderArgs(routes, "eth", XcmTag.Wormhole).tag).toBe(
      XcmTag.Wormhole,
    )
  })

  it("never auto-selects a paused provider", () => {
    const mixed = [route([XcmTag.Snowbridge]), route([XcmTag.Wormhole])]

    expect(resolveValidBridgeProvider(XcmTag.Snowbridge, mixed)).toBe(
      XcmTag.Wormhole,
    )
    expect(resolveValidBridgeProvider(null, mixed)).toBe(XcmTag.Wormhole)
    expect(resolveValidBridgeProvider(XcmTag.Wormhole, mixed)).toBe(
      XcmTag.Wormhole,
    )
  })

  it("returns null when only paused routes are available", () => {
    const snowbridgeOnly = [
      route([XcmTag.Snowbridge]),
      route([XcmTag.SnowbridgeV1]),
    ]

    expect(
      resolveValidBridgeProvider(XcmTag.Snowbridge, snowbridgeOnly),
    ).toBeNull()
    expect(resolveValidBridgeProvider(null, snowbridgeOnly)).toBeNull()
  })

  it("does not preserve a Snowbridge sub-selection while paused", () => {
    const destPair = {
      routes: [route([XcmTag.Snowbridge, XcmTag.SnowbridgeV1])],
    }

    expect(
      shouldPreserveSnowbridgeSubSelection(
        XcmTag.SnowbridgeV1,
        destPair as never,
      ),
    ).toBe(false)
  })
})
