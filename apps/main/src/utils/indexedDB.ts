import { create, StateCreator } from "zustand"
import {
  createJSONStorage,
  persist,
  StateStorage,
  StorageValue,
} from "zustand/middleware"

const DB_VERSION = 4
const DB_NAME = "storage"
const KEY_PATH = "key" as const

export enum IndexedDBStores {
  AssetRegistry = "asset-registry",
  ApiMetadata = "api-metadata",
}

export type IndexedDBConfig = {
  storeName: IndexedDBStores
}

export type IndexedDBStoreItem = { [KEY_PATH]: string; data: unknown }

export class IndexedDBManager {
  private static instance: Promise<IDBDatabase | null> | null = null

  static getInstance(): Promise<IDBDatabase | null> {
    if (!this.instance) {
      this.instance = new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onupgradeneeded = () => {
          const db = request.result
          for (const storeName of Object.values(IndexedDBStores)) {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: KEY_PATH })
            }
          }
        }

        request.onerror = () => {
          console.error("Failed to open IndexedDB")
          resolve(null)
        }
      })
    }

    return this.instance
  }
}

export const getItemFromStore = async (
  db: IDBDatabase,
  storeName: string,
): Promise<IndexedDBStoreItem[]> => {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly")
    const store = tx.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      console.error("Error getting item from IndexedDB")
      resolve([])
    }
  })
}

export const setItemInStore = async (
  db: IDBDatabase,
  storeName: string,
  key: string,
  data: unknown,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const request = store.put({ key, data })

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error("Error setting item in IndexedDB", { storeName, key })
      reject()
    }
  })
}

export const removeItemFromStore = async (
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const request = store.delete(key)

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error("Error removing item from IndexedDB", { storeName, key })
      reject()
    }
  })
}

export const createIndexedDBStorage = (
  config: IndexedDBConfig,
): StateStorage => {
  return {
    getItem: async () => {
      const db = await IndexedDBManager.getInstance()
      if (!db) return null

      try {
        const value = await getItemFromStore(db, config.storeName)
        const state = value.reduce((prev, curr) => {
          return {
            ...prev,
            [curr.key]: curr.data,
          }
        }, {})
        return state
          ? JSON.stringify({
              version: DB_VERSION,
              state,
            })
          : null
      } catch (error) {
        console.error("Error in getItem:", { config }, error)
        return null
      }
    },

    setItem: async (_, value: string) => {
      const db = await IndexedDBManager.getInstance()
      if (!db) return

      try {
        const parsedState: StorageValue<Record<string, unknown>> =
          JSON.parse(value)

        Object.keys(parsedState.state).forEach(async (key) => {
          await setItemInStore(
            db,
            config.storeName,
            key,
            parsedState.state[key],
          )
        })
      } catch (error) {
        console.error("Error in setItem:", error)
      }
    },

    removeItem: async (key: string) => {
      const db = await IndexedDBManager.getInstance()
      if (!db) return

      try {
        await removeItemFromStore(db, config.storeName, key)
      } catch (error) {
        console.error("Error in removeItem:", error)
      }
    },
  }
}

export const createIndexedDBStore = <T extends object>(
  name: IndexedDBStores,
  creator: StateCreator<T>,
) =>
  create(
    persist(creator, {
      name,
      version: DB_VERSION,
      storage: createJSONStorage<T>(() =>
        createIndexedDBStorage({
          storeName: name,
        }),
      ),
    }),
  )
