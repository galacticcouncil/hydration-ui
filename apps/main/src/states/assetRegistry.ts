import { isDeepEqual } from "remeda"
import { create } from "zustand"
import { createJSONStorage, persist, StateStorage } from "zustand/middleware"

import { TAssetData, TAssetResouce } from "@/api/assets"

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

export enum IndexedDBStores {
  Assets = "assets",
}

const db: IDBDatabase | null = await new Promise((resolve) => {
  const request = indexedDB.open("storage")

  request.onsuccess = () => resolve(request.result)

  request.onupgradeneeded = () => {
    const db = request.result

    if (!db.objectStoreNames.contains(IndexedDBStores.Assets)) {
      db.createObjectStore(IndexedDBStores.Assets, { keyPath: "key" })
    }
  }

  request.onerror = () => resolve(null)
})

type StoreKey = "tokens" | "shareTokens" | "metadata"

const getItems = async (
  db: IDBDatabase,
): Promise<{ tokens: object[]; shareTokens: object[]; metadata: object }> =>
  await new Promise((resolve) => {
    const tx = db.transaction(IndexedDBStores.Assets, "readonly")
    const store = tx.objectStore(IndexedDBStores.Assets)
    const res = store.getAll()

    res.onsuccess = () => {
      const data = res.result
      const tokens = data.find((e) => e.key === "tokens")?.data ?? []
      const shareTokens = data.find((e) => e.key === "shareTokens")?.data ?? []
      const metadata = data.find((e) => e.key === "metadata")?.data ?? []

      resolve({ tokens, shareTokens, metadata })
    }
  })

const setItems = async (db: IDBDatabase, data: object[], key: StoreKey) =>
  await new Promise((resolve) => {
    const tx = db.transaction(IndexedDBStores.Assets, "readwrite")
    const store = tx.objectStore(IndexedDBStores.Assets)
    store.put({ key, data })

    resolve(data)
  })

const storage: StateStorage = {
  getItem: async () => {
    const storage = await db
    if (!storage) return null

    const { tokens, shareTokens, metadata } = await getItems(storage)

    return JSON.stringify({
      version: 0,
      state: { assets: tokens, shareTokens, metadata },
    })
  },
  setItem: async (_, value) => {
    const parsedState = JSON.parse(value)
    const storage = await db

    if (storage) {
      setItems(storage, parsedState.state.assets, "tokens")

      setItems(storage, parsedState.state.shareTokens, "shareTokens")

      setItems(storage, parsedState.state.metadata, "metadata")
    }
  },
  removeItem: () => {},
}

export const useAssetRegistry = create<AssetRegistryStore>()(
  persist(
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
    {
      name: "asset-registry",
      storage: createJSONStorage(() => storage),
    },
  ),
)
