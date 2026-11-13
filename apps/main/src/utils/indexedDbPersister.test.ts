import { PersistedClient } from "@tanstack/query-persist-client-core"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getItemFromStore,
  IndexedDBManager,
  IndexedDBStores,
  removeItemFromStore,
  setItemInStore,
} from "@/utils/indexedDB"
import { createIndexedDbPersister } from "@/utils/indexedDbPersister"

vi.mock("@/utils/indexedDB", () => ({
  IndexedDBStores: { PortfolioBalances: "portfolio-balances" },
  IndexedDBManager: { getInstance: vi.fn() },
  getItemFromStore: vi.fn(),
  setItemInStore: vi.fn(),
  removeItemFromStore: vi.fn(),
}))

const STORE = IndexedDBStores.PortfolioBalances
const KEY = "balances"
const db = {} as IDBDatabase

const client: PersistedClient = {
  timestamp: 1,
  buster: "v1",
  clientState: { mutations: [], queries: [] },
}

describe("createIndexedDbPersister", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(IndexedDBManager.getInstance).mockResolvedValue(db)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("persists the client under the given store and key", async () => {
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await persister.persistClient(client)

    expect(setItemInStore).toHaveBeenCalledWith(db, STORE, KEY, client)
  })

  it("logs instead of throwing when persisting fails", async () => {
    vi.mocked(setItemInStore).mockRejectedValue(new Error("quota"))
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await expect(persister.persistClient(client)).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it("restores the item stored under the key", async () => {
    vi.mocked(getItemFromStore).mockResolvedValue([
      { key: "other", data: { timestamp: 2 } },
      { key: KEY, data: client },
    ])
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await expect(persister.restoreClient()).resolves.toBe(client)
    expect(getItemFromStore).toHaveBeenCalledWith(db, STORE)
  })

  it("restores nothing when the key is absent", async () => {
    vi.mocked(getItemFromStore).mockResolvedValue([])
    const reconstruct = vi.fn()
    const persister = createIndexedDbPersister({
      store: STORE,
      key: KEY,
      reconstruct,
    })

    await expect(persister.restoreClient()).resolves.toBeUndefined()
    expect(reconstruct).not.toHaveBeenCalled()
  })

  it("applies reconstruct on restore", async () => {
    vi.mocked(getItemFromStore).mockResolvedValue([{ key: KEY, data: client }])
    const rebuilt = { ...client, buster: "rebuilt" }
    const reconstruct = vi.fn().mockReturnValue(rebuilt)
    const persister = createIndexedDbPersister({
      store: STORE,
      key: KEY,
      reconstruct,
    })

    await expect(persister.restoreClient()).resolves.toBe(rebuilt)
    expect(reconstruct).toHaveBeenCalledWith(client)
  })

  it("restores nothing and logs when reading fails", async () => {
    vi.mocked(getItemFromStore).mockRejectedValue(new Error("read"))
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await expect(persister.restoreClient()).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it("removes the item stored under the key", async () => {
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await persister.removeClient()

    expect(removeItemFromStore).toHaveBeenCalledWith(db, STORE, KEY)
  })

  it("does nothing when the database is unavailable", async () => {
    vi.mocked(IndexedDBManager.getInstance).mockResolvedValue(null)
    const persister = createIndexedDbPersister({ store: STORE, key: KEY })

    await persister.persistClient(client)
    await persister.removeClient()

    await expect(persister.restoreClient()).resolves.toBeUndefined()
    expect(setItemInStore).not.toHaveBeenCalled()
    expect(getItemFromStore).not.toHaveBeenCalled()
    expect(removeItemFromStore).not.toHaveBeenCalled()
  })
})
