import {
  PersistedClient,
  Persister,
  persistQueryClientRestore,
  persistQueryClientSave,
} from "@tanstack/query-persist-client-core"
import { Query, QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"

import {
  EXTERNAL_APY_CACHE_BUSTER,
  EXTERNAL_APY_CACHE_MAX_AGE,
  shouldDehydrateExternalApyQuery,
} from "@/api/external/persistence"

const READING = { apy: "0.05", asOf: 1 }
const KAMINO_KEY = ["externalApy", "kamino", "abc"]
const YIELD_METRICS_KEY = ["neckwork", "stablepoolYieldMetrics", "30d"]

const query = (
  queryKey: readonly unknown[],
  state: { data?: unknown; status: "success" | "error" | "pending" },
) => ({ queryKey, state }) as Query

const createMemoryPersister = (): Persister => {
  let stored: PersistedClient | undefined

  return {
    persistClient: async (client) => {
      // structuredClone stands in for the IndexedDB write
      stored = structuredClone(client)
    },
    restoreClient: async () => stored,
    removeClient: async () => {
      stored = undefined
    },
  }
}

describe("shouldDehydrateExternalApyQuery", () => {
  it("persists a matching query with data and status success", () => {
    expect(
      shouldDehydrateExternalApyQuery(
        query(KAMINO_KEY, { data: READING, status: "success" }),
      ),
    ).toBe(true)
  })

  it("persists a matching query with data and status error", () => {
    expect(
      shouldDehydrateExternalApyQuery(
        query(KAMINO_KEY, { data: READING, status: "error" }),
      ),
    ).toBe(true)
  })

  it("skips a matching query without data", () => {
    expect(
      shouldDehydrateExternalApyQuery(query(KAMINO_KEY, { status: "pending" })),
    ).toBe(false)
    expect(
      shouldDehydrateExternalApyQuery(query(KAMINO_KEY, { status: "error" })),
    ).toBe(false)
  })

  it("persists the stablepool yield metrics query", () => {
    expect(
      shouldDehydrateExternalApyQuery(
        query(YIELD_METRICS_KEY, { data: [], status: "success" }),
      ),
    ).toBe(true)
  })

  it("skips an unrelated key", () => {
    expect(
      shouldDehydrateExternalApyQuery(
        query(["portfolio", "balances"], { data: [], status: "success" }),
      ),
    ).toBe(false)
    expect(
      shouldDehydrateExternalApyQuery(
        query(["neckwork", "stablepoolYieldMetrics"], {
          data: [],
          status: "success",
        }),
      ),
    ).toBe(false)
    expect(
      shouldDehydrateExternalApyQuery(
        query(["neckwork", "xykVolumes"], { data: [], status: "success" }),
      ),
    ).toBe(false)
  })
})

describe("external APY persistence round trip", () => {
  it("keeps the last value after a failed refetch and restores it", async () => {
    const persister = createMemoryPersister()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    await queryClient.fetchQuery({
      queryKey: KAMINO_KEY,
      queryFn: () => READING,
    })
    await queryClient
      .fetchQuery({
        queryKey: KAMINO_KEY,
        queryFn: () => Promise.reject(new Error("feed down")),
      })
      .catch(() => {})

    expect(queryClient.getQueryState(KAMINO_KEY)?.status).toBe("error")

    await persistQueryClientSave({
      queryClient,
      persister,
      buster: EXTERNAL_APY_CACHE_BUSTER,
      dehydrateOptions: {
        shouldDehydrateQuery: shouldDehydrateExternalApyQuery,
      },
    })

    const restored = new QueryClient()
    await persistQueryClientRestore({
      queryClient: restored,
      persister,
      maxAge: EXTERNAL_APY_CACHE_MAX_AGE,
      buster: EXTERNAL_APY_CACHE_BUSTER,
    })

    expect(restored.getQueryData(KAMINO_KEY)).toEqual(READING)
    expect(restored.getQueryState(KAMINO_KEY)?.status).toBe("error")
  })
})
