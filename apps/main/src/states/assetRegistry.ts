import { Asset } from "@galacticcouncil/sdk"
import { isDeepEqual } from "remeda"
import { create } from "zustand"
import { createJSONStorage, persist, StateStorage } from "zustand/middleware"

export type TAssetStored = Omit<Asset, "externalId"> & {
  isTradable: boolean
  externalId: string | undefined
}
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

type StoreKey = "tokens" | "shareTokens"

const getItems = async (
  db: IDBDatabase,
): Promise<{ tokens: object[]; shareTokens: object[] }> =>
  await new Promise((resolve) => {
    const tx = db.transaction(IndexedDBStores.Assets, "readonly")
    const store = tx.objectStore(IndexedDBStores.Assets)
    const res = store.getAll()

    res.onsuccess = () => {
      const data = res.result
      const tokens = data.find((e) => e.key === "tokens")?.data ?? []
      const shareTokens = data.find((e) => e.key === "shareTokens")?.data ?? []

      resolve({ tokens, shareTokens })
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

    const { tokens, shareTokens } = await getItems(storage)

    return JSON.stringify({
      version: 0,
      state: { assets: tokens, shareTokens },
    })
  },
  setItem: async (_, value) => {
    const parsedState = JSON.parse(value)
    const storage = await db

    if (storage) {
      const { tokens, shareTokens } = await getItems(storage)

      const areTokensEqual = isDeepEqual(parsedState.state.assets, tokens)
      const areShareTokensEqual = isDeepEqual(
        parsedState.state.shareTokens,
        shareTokens,
      )

      if (!areTokensEqual) {
        setItems(storage, parsedState.state.assets, "tokens")
      }

      if (!areShareTokensEqual) {
        setItems(storage, parsedState.state.shareTokens, "shareTokens")
      }
    }
  },
  removeItem: () => {},
}

export const useAssetRegistry = create<AssetRegistryStore>()(
  persist(
    (set) => ({
      assets: [],
      shareTokens: [],
      sync(assets) {
        set({
          assets,
        })
      },
      syncShareTokens(shareTokens) {
        set({
          shareTokens,
        })
      },
    }),
    {
      name: "asset-registry",
      storage: createJSONStorage(() => storage),
    },
  ),
)
