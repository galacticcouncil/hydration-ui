import { useMemo } from "react"
import { isDeepEqual, isShallowEqual } from "remeda"

import { TAssetData } from "@/api/assets"
import { createIndexedDBStore, IndexedDBStores } from "@/utils/indexedDB"

export type TAssetStored = TAssetData
export type TShareTokenStored = {
  poolAddress: string
  assets: [string, string]
  shareTokenId: string
}
export type TATokenPairStored = readonly [
  aTokenId: string,
  underlyingAssetId: string,
]

type AssetRegistryStore = {
  assets: Array<TAssetStored>
  shareTokens: Array<TShareTokenStored>
  aTokenPairs: TATokenPairStored[]
  syncAssets: (assets: TAssetStored[]) => void
  syncShareTokens: (shareTokens: TShareTokenStored[]) => void
  syncATokenPairs: (pairs: TATokenPairStored[]) => void
}

export const useAssetRegistryStore = createIndexedDBStore<AssetRegistryStore>(
  IndexedDBStores.AssetRegistry,
  (set, get) => ({
    assets: [],
    shareTokens: [],
    aTokenPairs: [],
    syncAssets(assets) {
      const storedAssets = get().assets
      const areDataEqual = isDeepEqual(storedAssets, assets)

      if (!areDataEqual) {
        set({
          assets,
        })
      }
    },
    syncShareTokens(shareTokens) {
      const storedShareTokens = get().shareTokens
      const areDataEqual = isDeepEqual(storedShareTokens, shareTokens)

      if (!areDataEqual) {
        set({
          shareTokens,
        })
      }
    },
    syncATokenPairs(pairs) {
      const storedPairs = get().aTokenPairs

      const arePairsEqual = isShallowEqual(storedPairs, pairs)

      if (!arePairsEqual) {
        set({
          aTokenPairs: pairs,
        })
      }
    },
  }),
)

export const useAssetRegistry = () => {
  const assetRegistry = useAssetRegistryStore()
  return useMemo(() => {
    return {
      ...assetRegistry,
      aTokenMap: new Map(assetRegistry.aTokenPairs),
      aTokenReverseMap: new Map(
        assetRegistry.aTokenPairs.map(([aToken, underlying]) => [
          underlying,
          aToken,
        ]),
      ),
    }
  }, [assetRegistry])
}
