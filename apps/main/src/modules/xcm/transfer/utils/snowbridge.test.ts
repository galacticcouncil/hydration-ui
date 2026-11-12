import {
  assetsMap,
  chainsMap,
  HydrationConfigService,
  routesMap,
  tags,
} from "@galacticcouncil/xc-cfg"
import { describe, expect, it } from "vitest"

const configService = new HydrationConfigService({
  assets: assetsMap,
  chains: chainsMap,
  routes: routesMap,
})

const hasTag = (routeTags: string[] | undefined, tag: string) =>
  (routeTags ?? []).includes(tag)

// The app resolves the Snowbridge tag to the first matching route, which is
// V2 only because xc-cfg registers V2 routes before V1 ones.
describe("Snowbridge route order from Ethereum to Hydration", () => {
  const ethereum = configService.getChain("ethereum")
  const hydration = configService.getChain("hydration")

  const snowbridgeRoutes = configService
    .getChainRoutes(ethereum)
    .getRoutes()
    .filter(
      (route) =>
        route.destination.chain.key === hydration.key &&
        hasTag(route.tags, tags.Tag.Snowbridge),
    )

  const assetKeys = [
    ...new Set(snowbridgeRoutes.map((route) => route.source.asset.key)),
  ]

  it("has Snowbridge assets with both V1 and V2 routes", () => {
    const withBothVersions = assetKeys.filter((key) => {
      const routes = snowbridgeRoutes.filter((r) => r.source.asset.key === key)
      return (
        routes.some((r) => hasTag(r.tags, tags.Tag.SnowbridgeV1)) &&
        routes.some((r) => !hasTag(r.tags, tags.Tag.SnowbridgeV1))
      )
    })
    expect(withBothVersions.length).toBeGreaterThan(0)
  })

  it.each(assetKeys)("picks a non-V1 route first for %s", (assetKey) => {
    const routes = configService.getAssetRoutes(
      configService.getAsset(assetKey),
      ethereum,
      hydration,
    )
    const first = routes.find((route) =>
      hasTag(route.tags, tags.Tag.Snowbridge),
    )

    expect(first).toBeDefined()
    expect(hasTag(first?.tags, tags.Tag.SnowbridgeV1)).toBe(false)
  })
})
