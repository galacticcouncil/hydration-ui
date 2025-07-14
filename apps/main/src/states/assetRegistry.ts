import { isDeepEqual } from "remeda"

import { TAssetData } from "@/api/assets"
import { createIndexedDBStore, IndexedDBStores } from "@/utils/indexedDB"

export type TAssetStored = TAssetData
export type TShareTokenStored = {
  poolAddress: string
  assets: string[]
  shareTokenId: string
}

type AssetRegistryStore = {
  assets: Array<TAssetStored>
  shareTokens: Array<TShareTokenStored>
  sync: (assets: TAssetStored[]) => void
  syncShareTokens: (shareTokens: TShareTokenStored[]) => void
}

export const useAssetRegistry = createIndexedDBStore<AssetRegistryStore>(
  IndexedDBStores.AssetRegistry,
  (set, get) => ({
    assets: [],
    shareTokens: [],
    sync(assets) {
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
  }),
)
