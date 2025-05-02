import { isDeepEqual } from "remeda"

import { TAssetData, TAssetResouce } from "@/api/assets"
import { createIndexedDBStore, IndexedDBStores } from "@/utils/indexedDB"

export type TAssetStored = TAssetData
export type TShareTokenStored = {
  poolAddress: string
  assets: string[]
  shareTokenId: string
}

type TAssetsMetadata = { url?: string; chainsMetadata?: TAssetResouce }

type AssetRegistryStore = {
  assets: Array<TAssetStored>
  shareTokens: Array<TShareTokenStored>
  metadata: TAssetsMetadata
  sync: (assets: TAssetStored[]) => void
  syncShareTokens: (shareTokens: TShareTokenStored[]) => void
  syncMetadata: (metadata: TAssetsMetadata) => void
}

export const useAssetRegistry = createIndexedDBStore<AssetRegistryStore>(
  IndexedDBStores.AssetRegistry,
  (set, get) => ({
    assets: [],
    shareTokens: [],
    metadata: {},
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
    syncMetadata(metadata) {
      const storedMetadata = get().metadata
      const areDataEqual = isDeepEqual(storedMetadata, metadata)

      if (!areDataEqual) {
        set({ metadata })
      }
    },
  }),
)
