import {
  Basejumper,
  Jetski,
  Swimmer,
  WormholeLogo,
} from "@galacticcouncil/ui/assets/icons"
import { Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { ComponentType } from "react"

import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"
import { BRIDGE_PROVIDER_TAGS, XcmTag, XcmTags } from "@/states/transactions"

export const BRIDGE_TIME: Record<string, string> = {
  [XcmTag.Basejump]: "≈ 22 sec",
  [XcmTag.Wormhole]: "≈ 30 min",
  [XcmTag.SnowbridgeFast]: "≈ 5-10 min",
  [XcmTag.Snowbridge]: "≈ 20 min",
  [XcmTag.SnowbridgeV1]: "≈ 20 min",
}

export const BRIDGE_ICON: Partial<Record<string, ComponentType>> = {
  [XcmTag.Basejump]: Basejumper,
  [XcmTag.Wormhole]: WormholeLogo,
  [XcmTag.SnowbridgeFast]: Jetski,
  [XcmTag.Snowbridge]: Swimmer,
  [XcmTag.SnowbridgeV1]: Swimmer,
}

export const BRIDGE_PRIORITY: Record<string, number> = {
  [XcmTag.Basejump]: 1,
  [XcmTag.Wormhole]: 2,
  [XcmTag.SnowbridgeFast]: 3,
  [XcmTag.Snowbridge]: 4,
}

export const getPrimaryBridgeTag = (route: AssetRoute): string | null => {
  const tags = (route.tags ?? []) as string[]
  return BRIDGE_PROVIDER_TAGS.find((tag) => tags.includes(tag)) ?? null
}

export const isSnowbridgeRoute = (route: AssetRoute | null): boolean => {
  const tags = (route?.tags ?? []) as string[]
  return tags.includes(XcmTag.Snowbridge)
}

export const isSnowbridgeFastRoute = (route: AssetRoute): boolean => {
  const tags = (route.tags ?? []) as string[]
  return tags.includes(XcmTag.SnowbridgeFast)
}

export const isSnowbridgeV1Route = (route: AssetRoute): boolean => {
  const tags = (route.tags ?? []) as string[]
  return tags.includes(XcmTag.SnowbridgeV1)
}

export const isSnowbridgeFastTag = (tag: string | null | undefined): boolean =>
  tag === XcmTag.SnowbridgeFast

export const isSnowbridgeV1Tag = (tag: string | null | undefined): boolean =>
  tag === XcmTag.SnowbridgeV1

// A Snowbridge "sub" selection is one that's not surfaced as a top-level
// bridge tag (SnowbridgeFast = V2 fast, SnowbridgeV1 = V1) — these must be
// preserved across the default-selection effect, which only knows about the
// top-level Snowbridge tag.
export const isSnowbridgeSubTag = (tag: string | null | undefined): boolean =>
  isSnowbridgeFastTag(tag) || isSnowbridgeV1Tag(tag)

export const isSnowbridgeTag = (tag: string | null | undefined): boolean =>
  tag === XcmTag.Snowbridge || isSnowbridgeSubTag(tag)

export const pickSnowbridgeVariants = (
  routes: AssetRoute[],
): {
  slow: AssetRoute | null
  fast: AssetRoute | null
  v1: AssetRoute | null
} => {
  const snowbridge = routes.filter(isSnowbridgeRoute)
  return {
    slow:
      snowbridge.find(
        (r) => !isSnowbridgeFastRoute(r) && !isSnowbridgeV1Route(r),
      ) ?? null,
    fast: snowbridge.find(isSnowbridgeFastRoute) ?? null,
    v1: snowbridge.find(isSnowbridgeV1Route) ?? null,
  }
}

// Drop bridgeTag / destAsset values that don't match any route in the
// current pair — the SDK's ConfigBuilder.build asserts route non-null but
// can return undefined when the (tag, destAsset) combo has no match, which
// would crash downstream destructures. Falling back to `undefined` lets the
// SDK pick the default route/asset instead.
export const resolveRouteBuilderArgs = <T extends string | Asset>(
  routes: AssetRoute[],
  destAsset: T,
  tag: string | undefined,
): { tag: string | undefined; destAsset: T | undefined } => {
  const validTag =
    !tag || routes.some((r) => (r.tags ?? []).includes(tag)) ? tag : undefined

  const candidates = validTag
    ? routes.filter((r) => (r.tags ?? []).includes(validTag))
    : routes

  const destKey = typeof destAsset === "string" ? destAsset : destAsset.key
  const validDestAsset = candidates.some(
    (r) => r.destination.asset.key === destKey,
  )
    ? destAsset
    : undefined

  return { tag: validTag, destAsset: validDestAsset }
}

export const isBridgeAssetRoute = (route: AssetRoute | null): boolean => {
  const tags = (route?.tags ?? []) as XcmTags
  return tags.some((tag) => BRIDGE_PROVIDER_TAGS.includes(tag))
}

export function shouldPreserveSnowbridgeSubSelection(
  currentProvider: string | null,
  destPair: ChainAssetPair,
): boolean {
  if (!isSnowbridgeSubTag(currentProvider)) return false
  return destPair.routes.some((r) =>
    (r.tags ?? []).includes(currentProvider as string),
  )
}

export function resolveValidBridgeProvider(
  currentProvider: string | null,
  matchingRoutes: AssetRoute[],
): string | null {
  const isCurrentValid = matchingRoutes.some(
    (r) => getPrimaryBridgeTag(r) === currentProvider,
  )
  if (isCurrentValid) return currentProvider

  const fallbackRoute =
    matchingRoutes.find((r) => getPrimaryBridgeTag(r) === XcmTag.Basejump) ??
    matchingRoutes[0]

  return fallbackRoute ? getPrimaryBridgeTag(fallbackRoute) : null
}
