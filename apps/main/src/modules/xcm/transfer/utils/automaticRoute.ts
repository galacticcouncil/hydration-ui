import { Asset, AssetRoute } from "@galacticcouncil/xc-core"

import {
  BRIDGE_PRIORITY,
  getPrimaryBridgeTag,
  isSnowbridgeV1Route,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmTag } from "@/states/transactions"

/** Prefer supported routes without changing the token selected to arrive. */
export const resolveAutomaticBridgeRoute = (
  routes: AssetRoute[],
  destAsset: string | Asset,
): AssetRoute | null => {
  const assetKey = typeof destAsset === "string" ? destAsset : destAsset.key
  const candidates = routes.filter(
    (route) => route.destination.asset.key === assetKey,
  )

  candidates.sort((a, b) => {
    const priority =
      (BRIDGE_PRIORITY[getPrimaryBridgeTag(a) ?? ""] ?? 99) -
      (BRIDGE_PRIORITY[getPrimaryBridgeTag(b) ?? ""] ?? 99)

    return (
      priority ||
      Number(isSnowbridgeV1Route(a)) - Number(isSnowbridgeV1Route(b))
    )
  })

  return candidates[0] ?? null
}

export const getAutomaticBridgeProvider = (
  route: AssetRoute | null,
): string | null => {
  if (!route) return null
  return isSnowbridgeV1Route(route)
    ? XcmTag.SnowbridgeV1
    : getPrimaryBridgeTag(route)
}
