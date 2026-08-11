import { PORTFOLIO_CACHE_MAX_AGE } from "@/config/portfolio"
import { Balance } from "@/states/account"
import {
  getItemFromStore,
  IndexedDBManager,
  IndexedDBStores,
  removeItemFromStore,
  setItemInStore,
} from "@/utils/indexedDB"

const STORE = IndexedDBStores.AccountBalances

type PersistedAccountBalances = {
  address: string
  balances: Balance[]
  timestamp: number
}

/**
 * Every balance field is a bigint, so the blob is stored as a structured clone
 * and never as JSON — `JSON.stringify` throws on BigInt. A shape check is
 * still needed because `Balance` comes from the SDK: a renamed field would
 * restore as `undefined` and surface as `NaN` deep inside Big.js math rather
 * than as an error anyone can trace.
 */
const isBalance = (value: unknown): value is Balance => {
  if (typeof value !== "object" || value === null) return false

  const { assetId, free, total, transferable, reserved, frozen } =
    value as Record<string, unknown>

  return (
    typeof assetId === "string" &&
    typeof free === "bigint" &&
    typeof total === "bigint" &&
    typeof transferable === "bigint" &&
    typeof reserved === "bigint" &&
    typeof frozen === "bigint"
  )
}

/**
 * The whole decision about whether a persisted blob may be trusted, kept pure
 * and in one place — the I/O around it fails loudly, this doesn't.
 *
 * Returns undefined for anything suspect (wrong address, expired, malformed),
 * and the caller drops the blob. Restoring balances for the wrong account
 * would show another wallet's funds; restoring months-old ones on a hanging
 * RPC would show funds that no longer exist.
 */
export const parsePersistedBalances = (
  data: unknown,
  address: string,
  now: number,
): Balance[] | undefined => {
  if (typeof data !== "object" || data === null) return undefined

  const {
    address: cachedAddress,
    balances,
    timestamp,
  } = data as Record<string, unknown>

  if (cachedAddress !== address) return undefined
  if (typeof timestamp !== "number") return undefined
  if (now - timestamp > PORTFOLIO_CACHE_MAX_AGE) return undefined
  if (!Array.isArray(balances) || !balances.length) return undefined

  return balances.every(isBalance) ? balances : undefined
}

/**
 * Expired and malformed blobs are deleted on read, so dead entries clean
 * themselves up on the next visit instead of accumulating per address.
 */
export const readAccountBalances = async (
  address: string,
): Promise<Balance[] | undefined> => {
  const db = await IndexedDBManager.getInstance()
  if (!db) return undefined

  try {
    // ponytail: reads every address' blob to find one, same as the portfolio
    // persister. Add an index if this ever holds more than a handful.
    const items = await getItemFromStore(db, STORE)
    const item = items.find(({ key }) => key === address)
    if (!item) return undefined

    const balances = parsePersistedBalances(item.data, address, Date.now())

    if (!balances) {
      await removeItemFromStore(db, STORE, address)
      return undefined
    }

    return balances
  } catch (error) {
    console.error("Failed to read persisted account balances", error)
    return undefined
  }
}

export const writeAccountBalances = async (
  address: string,
  balances: Balance[],
): Promise<void> => {
  const db = await IndexedDBManager.getInstance()
  if (!db) return

  try {
    const payload: PersistedAccountBalances = {
      address,
      balances,
      timestamp: Date.now(),
    }

    await setItemInStore(db, STORE, address, payload)
  } catch (error) {
    console.error("Failed to persist account balances", error)
  }
}
