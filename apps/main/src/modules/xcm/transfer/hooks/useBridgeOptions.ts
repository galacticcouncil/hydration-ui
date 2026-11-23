import { AssetRoute } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { flatMap, isNonNullish, pipe, sortBy, unique } from "remeda"

import {
  BRIDGE_PRIORITY,
  getPrimaryBridgeTag,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmTag } from "@/states/transactions"

export enum BridgeEntryKind {
  Default = "default",
  Wormhole = "wormhole",
}

export type BridgeEntry =
  | { kind: BridgeEntryKind.Default; tag: string }
  | { kind: BridgeEntryKind.Wormhole }

const entryTag = (entry: BridgeEntry): string => {
  switch (entry.kind) {
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
): { options: BridgeEntry[]; hasVisibleOptions: boolean } => {
  return useMemo(() => {
    const tags = unique(routes.map(getPrimaryBridgeTag).filter(isNonNullish))

    const hasWormholeChoice =
      tags.includes(XcmTag.NttExecutor) && tags.includes(XcmTag.Wormhole)

    const options = pipe(
      tags,
      flatMap((tag): BridgeEntry[] => {
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

    const hasVisibleOptions = hasWormholeChoice || options.length >= 2

    return { options, hasVisibleOptions }
  }, [routes])
}
