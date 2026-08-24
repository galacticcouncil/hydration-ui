import { AssetAmount } from "@galacticcouncil/xc-core"
import {
  PersistedClient,
  Persister,
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
} from "@tanstack/query-persist-client-core"
import { Query, QueryClient } from "@tanstack/react-query"

import {
  PORTFOLIO_CACHE_BUSTER,
  PORTFOLIO_CACHE_MAX_AGE,
} from "@/config/portfolio"
import {
  getItemFromStore,
  IndexedDBManager,
  IndexedDBStores,
  removeItemFromStore,
  setItemInStore,
} from "@/utils/indexedDB"

const PORTFOLIO_BALANCES_KEY = ["portfolio", "balances"] as const

/**
 * Persistence is an allowlist on purpose, never a denylist.
 *
 * The same query cache holds values that cannot survive a structured clone —
 * `["xcm", "context"]` is a live `ConfigService` holding chain connections, and
 * the cross-chain balance query resolves to a `Map`. Opting queries in one by
 * one means a query added elsewhere later is never persisted by accident.
 *
 * `success` only: restoring an error state would paint a failure from disk
 * before the page has even tried to fetch.
 */
export const shouldDehydratePortfolioQuery = (query: Query): boolean =>
  query.state.status === "success" &&
  PORTFOLIO_BALANCES_KEY.every((part, i) => query.queryKey[i] === part)

type PersistedAssetAmount = {
  key: string
  originSymbol: string
  amount: bigint
  decimals: number
  symbol: string
}

/**
 * `AssetAmount`'s complete own state — `amount` stays a bigint throughout,
 * because IndexedDB's structured clone handles BigInt natively. Any JSON step
 * here would be a bug, not a convenience.
 */
const isPersistedAssetAmount = (
  value: unknown,
): value is PersistedAssetAmount => {
  if (typeof value !== "object" || value === null) return false

  const { key, originSymbol, amount, decimals, symbol } = value as Record<
    string,
    unknown
  >

  return (
    typeof key === "string" &&
    typeof originSymbol === "string" &&
    typeof amount === "bigint" &&
    typeof decimals === "number" &&
    typeof symbol === "string"
  )
}

const toAssetAmounts = (data: unknown): AssetAmount[] => {
  if (!Array.isArray(data)) {
    throw new Error("Persisted portfolio balances are not an array")
  }

  return data.map((balance: unknown) => {
    if (!isPersistedAssetAmount(balance)) {
      throw new Error("Persisted portfolio balance has an unexpected shape")
    }

    return new AssetAmount(balance)
  })
}

/**
 * Structured clone preserves fields but drops prototypes, so every restored
 * balance comes back as a plain object. The read path calls `AssetAmount`
 * methods (`toDecimal`, `toBig`, …), so each one has to be reconstructed into a
 * real instance before it reaches the cache.
 *
 * Returns undefined when the persisted shape no longer matches — e.g. after an
 * xc-core bump. Dropping the cache costs one cold fetch; throwing would break
 * app start.
 */
export const reconstructPersistedClient = (
  client: PersistedClient,
): PersistedClient | undefined => {
  try {
    return {
      ...client,
      clientState: {
        ...client.clientState,
        queries: client.clientState.queries.map((query) => ({
          ...query,
          state: {
            ...query.state,
            data: toAssetAmounts(query.state.data),
          },
        })),
      },
    }
  } catch (error) {
    console.error("Failed to restore persisted portfolio cache", error)
    return undefined
  }
}

const STORE = IndexedDBStores.PortfolioBalances
const KEY = "balances"

/**
 * Dumb I/O over the app's existing IndexedDB helpers — every decision about
 * what is written and how it comes back lives in the two pure functions above.
 *
 * The `PersistedClient` is stored as a structured clone, never as JSON: the
 * balance amounts are bigints, which `JSON.stringify` throws on.
 */
export const portfolioPersister: Persister = {
  persistClient: async (client) => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return

    try {
      await setItemInStore(db, STORE, KEY, client)
    } catch (error) {
      console.error("Failed to persist portfolio cache", error)
    }
  },

  restoreClient: async () => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return undefined

    try {
      const items = await getItemFromStore(db, STORE)
      const item = items.find(({ key }) => key === KEY)
      if (!item) return undefined

      return reconstructPersistedClient(item.data as PersistedClient)
    } catch (error) {
      console.error("Failed to read persisted portfolio cache", error)
      return undefined
    }
  },

  removeClient: async () => {
    const db = await IndexedDBManager.getInstance()
    if (!db) return

    try {
      await removeItemFromStore(db, STORE, KEY)
    } catch (error) {
      console.error("Failed to remove persisted portfolio cache", error)
    }
  },
}

/**
 * Restores the persisted portfolio cache, then keeps writing it back.
 *
 * Fire-and-forget by design: nothing renders behind this. Gating boot on a
 * disk read would slow every route down to speed one page up, and losing the
 * race costs only the speedup — the portfolio's first fetch sits behind the
 * `useSuspenseQuery` in `useCrossChainConfig`, and query-core's hydrate
 * overwrites cached data only when the persisted copy is strictly newer.
 *
 * Subscribe is chained after restore, not started alongside it: the subscriber
 * rewrites the whole blob on any cache event, so an event arriving mid-restore
 * would erase the very cache being read.
 */
export const setupPortfolioPersistence = (queryClient: QueryClient) => {
  persistQueryClientRestore({
    queryClient,
    persister: portfolioPersister,
    maxAge: PORTFOLIO_CACHE_MAX_AGE,
    buster: PORTFOLIO_CACHE_BUSTER,
  })
    .catch((error) => {
      console.error("Failed to restore portfolio cache", error)
    })
    .then(() => {
      const persistOptions = {
        queryClient,
        persister: portfolioPersister,
        buster: PORTFOLIO_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldDehydratePortfolioQuery,
        },
      }
      persistQueryClientSubscribe(persistOptions)
      persistQueryClientSave(persistOptions)
    })
}
