import type { Asset } from "@galacticcouncil/xc-core"

type AssetKey = Pick<Asset, "key">
type RouteAssetKeys = {
  source: { asset: AssetKey }
  destination: { asset: AssetKey }
}

export const hasReceiveAssetChange = (
  source: AssetKey | null | undefined,
  destination: AssetKey | null | undefined,
  route: RouteAssetKeys | null | undefined,
): boolean =>
  !!source &&
  !!destination &&
  source.key !== destination.key &&
  route?.source.asset.key === source.key &&
  route.destination.asset.key === destination.key
