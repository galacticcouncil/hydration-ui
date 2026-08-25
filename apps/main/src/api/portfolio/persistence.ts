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
