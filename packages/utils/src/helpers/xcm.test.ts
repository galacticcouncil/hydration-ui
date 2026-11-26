import { assetsMap, chainsMap, routesMap } from "@galacticcouncil/xc-cfg"
import { ConfigService } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import { resolveHydrationDisplayAssetId } from "./xcm"

const cs = new ConfigService({
  assets: assetsMap,
  chains: chainsMap,
  routes: routesMap,
})
const usdc = assetsMap.get("usdc")!

describe("resolveHydrationDisplayAssetId", () => {
  it("ignores a shared key the source chain never lands as", () => {
    // Ethereum USDC lands as usdc_wh / usdc_eth, never Asset Hub USDC (22)
    expect(resolveHydrationDisplayAssetId(usdc, "ethereum", cs)).toBeNull()
  })

  it("keeps the key match when a route lands on it", () => {
    expect(resolveHydrationDisplayAssetId(usdc, "assethub", cs)).toBe("22")
    expect(resolveHydrationDisplayAssetId(usdc, "hydration", cs)).toBe("22")
  })
})
