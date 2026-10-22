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
  Wormhole = "wormhole",
}

export type BridgeEntry =
  | { kind: BridgeEntryKind.Default; tag: string }
  | {
      kind: BridgeEntryKind.Snowbridge
      v2: AssetRoute | null
      v1: AssetRoute | null
    }
  | { kind: BridgeEntryKind.Wormhole }

const entryTag = (entry: BridgeEntry): string => {
  switch (entry.kind) {
    case BridgeEntryKind.Snowbridge:
      return XcmTag.Snowbridge
    case BridgeEntryKind.Wormhole:
      return XcmTag.NttExecutor
    case BridgeEntryKind.Default:
      return entry.tag
  }
}

const entryPriority = (entry: BridgeEntry): number =>
  BRIDGE_PRIORITY[entryTag(entry)] ?? 99

export const useBridgeOptions = (
  routes: AssetRoute[],
  destAsset: Asset | null,
): { options: BridgeEntry[]; hasVisibleOptions: boolean } => {
  return useMemo(() => {
    const tags = unique(routes.map(getPrimaryBridgeTag).filter(isNonNullish))

    const snowbridgeRoutes = destAsset
      ? routes.filter((r) => r.destination.asset.key === destAsset.key)
      : routes
    const { v2, v1 } = pickSnowbridgeVariants(snowbridgeRoutes)
    const hasSnowbridgeChoice = [v2, v1].filter(isNonNullish).length >= 2

    const hasWormholeChoice =
      tags.includes(XcmTag.NttExecutor) && tags.includes(XcmTag.Wormhole)

    const options = pipe(
      tags,
      flatMap((tag): BridgeEntry[] => {
        if (tag === XcmTag.Snowbridge) {
          return hasSnowbridgeChoice
            ? [{ kind: BridgeEntryKind.Snowbridge, v2, v1 }]
            : []
        }
        if (tag === XcmTag.NttExecutor || tag === XcmTag.Wormhole) {
          if (!hasWormholeChoice)
            return [{ kind: BridgeEntryKind.Default, tag }]
          return tag === XcmTag.NttExecutor
            ? [{ kind: BridgeEntryKind.Wormhole }]
            : []
        }
        return [{ kind: BridgeEntryKind.Default, tag }]
      }),
      sortBy(entryPriority),
    )

    const hasVisibleOptions =
      hasSnowbridgeChoice || hasWormholeChoice || options.length >= 2

    return { options, hasVisibleOptions }
  }, [routes, destAsset])
}
