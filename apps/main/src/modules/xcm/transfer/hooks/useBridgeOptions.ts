import { Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { flatMap, isNonNullish, pipe, sortBy, unique } from "remeda"

import {
  BRIDGE_PRIORITY,
  getPrimaryBridgeTag,
  pickSnowbridgeVariants,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmTag } from "@/states/transactions"

export enum BridgeEntryKind {
  Default = "default",
  Snowbridge = "snowbridge",
}

export type BridgeEntry =
  | { kind: BridgeEntryKind.Default; tag: string }
  | {
      kind: BridgeEntryKind.Snowbridge
      slow: AssetRoute | null
      fast: AssetRoute | null
      v1: AssetRoute | null
    }

const entryPriority = (entry: BridgeEntry): number => {
  const tag =
    entry.kind === BridgeEntryKind.Snowbridge ? XcmTag.Snowbridge : entry.tag
  return BRIDGE_PRIORITY[tag] ?? 99
}

export const useBridgeOptions = (
  routes: AssetRoute[],
  destAsset: Asset | null,
): { options: BridgeEntry[]; hasVisibleOptions: boolean } => {
  return useMemo(() => {
    const tags = unique(routes.map(getPrimaryBridgeTag).filter(isNonNullish))

    const snowbridgeRoutes = destAsset
      ? routes.filter((r) => r.destination.asset.key === destAsset.key)
      : routes
    const { slow, fast, v1 } = pickSnowbridgeVariants(snowbridgeRoutes)
    const hasSnowbridgeChoice =
      [slow, fast, v1].filter(isNonNullish).length >= 2

    const options = pipe(
      tags,
      flatMap((tag): BridgeEntry[] => {
        if (tag === XcmTag.Snowbridge) {
          return hasSnowbridgeChoice
            ? [{ kind: BridgeEntryKind.Snowbridge, slow, fast, v1 }]
            : []
        }
        return [{ kind: BridgeEntryKind.Default, tag }]
      }),
      sortBy(entryPriority),
    )

    const hasVisibleOptions = hasSnowbridgeChoice || options.length >= 2

    return { options, hasVisibleOptions }
  }, [routes, destAsset])
}
