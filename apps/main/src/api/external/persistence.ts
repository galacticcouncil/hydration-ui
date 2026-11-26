import {
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
} from "@tanstack/query-persist-client-core"
import { Query, QueryClient } from "@tanstack/react-query"
import { millisecondsInWeek } from "date-fns/constants"

import { IndexedDBStores } from "@/utils/indexedDB"
import { createIndexedDbPersister } from "@/utils/indexedDbPersister"

export const EXTERNAL_APY_CACHE_BUSTER = "external-apy-v1"
export const EXTERNAL_APY_CACHE_MAX_AGE = millisecondsInWeek

const EXTERNAL_APY_KEY = ["externalApy"] as const
const STABLEPOOL_YIELD_METRICS_KEY = [
  "neckwork",
  "stablepoolYieldMetrics",
  "30d",
] as const

const LEGACY_LOCAL_STORAGE_KEY = "external-apy"

// Persists on data, not status: a failed refetch keeps the last known value
// in `state.data`, and it must not be dropped from the persisted cache.
export const shouldDehydrateExternalApyQuery = (query: Query): boolean =>
  query.state.data !== undefined &&
  (EXTERNAL_APY_KEY.every((part, i) => query.queryKey[i] === part) ||
    (query.queryKey.length === STABLEPOOL_YIELD_METRICS_KEY.length &&
      STABLEPOOL_YIELD_METRICS_KEY.every(
        (part, i) => query.queryKey[i] === part,
      )))

const externalApyPersister = createIndexedDbPersister({
  store: IndexedDBStores.ExternalApy,
  key: "readings",
})

const removeLegacyLocalStorage = () => {
  try {
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to remove legacy external APY cache", error)
  }
}

export const setupExternalApyPersistence = (queryClient: QueryClient) => {
  removeLegacyLocalStorage()

  queryClient.setQueryDefaults([...EXTERNAL_APY_KEY], {
    gcTime: EXTERNAL_APY_CACHE_MAX_AGE,
  })
  queryClient.setQueryDefaults([...STABLEPOOL_YIELD_METRICS_KEY], {
    gcTime: EXTERNAL_APY_CACHE_MAX_AGE,
  })

  persistQueryClientRestore({
    queryClient,
    persister: externalApyPersister,
    maxAge: EXTERNAL_APY_CACHE_MAX_AGE,
    buster: EXTERNAL_APY_CACHE_BUSTER,
  })
    .catch((error) => {
      console.error("Failed to restore external APY cache", error)
    })
    .then(() => {
      const persistOptions = {
        queryClient,
        persister: externalApyPersister,
        buster: EXTERNAL_APY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldDehydrateExternalApyQuery,
        },
      }
      persistQueryClientSubscribe(persistOptions)
      persistQueryClientSave(persistOptions)
    })
}
