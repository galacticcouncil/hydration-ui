import { PersistedClient, Persister } from "@tanstack/query-persist-client-core"

import {
  getItemFromStore,
  IndexedDBManager,
  IndexedDBStores,
  removeItemFromStore,
  setItemInStore,
} from "@/utils/indexedDB"

type IndexedDbPersisterOptions = {
  store: IndexedDBStores
  key: string
  reconstruct?: (client: PersistedClient) => PersistedClient | undefined
}

export const createIndexedDbPersister = ({
  store,
  key,
  reconstruct,
}: IndexedDbPersisterOptions): Persister => ({
  persistClient: async (client) => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return

    try {
      await setItemInStore(db, store, key, client)
    } catch (error) {
      console.error(`Failed to persist ${store} cache`, error)
    }
  },

  restoreClient: async () => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return undefined

    try {
      const items = await getItemFromStore(db, store)
      const item = items.find((item) => item.key === key)
      if (!item) return undefined

      const client = item.data as PersistedClient
      return reconstruct ? reconstruct(client) : client
    } catch (error) {
      console.error(`Failed to read persisted ${store} cache`, error)
      return undefined
    }
  },

  removeClient: async () => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return

    try {
      await removeItemFromStore(db, store, key)
    } catch (error) {
      console.error(`Failed to remove persisted ${store} cache`, error)
    }
  },
})
