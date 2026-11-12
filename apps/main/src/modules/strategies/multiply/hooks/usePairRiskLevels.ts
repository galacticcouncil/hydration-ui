import { pairCandlesQuery } from "@galacticcouncil/indexer/neckwork"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import {
  persistQueryClientRestore,
  persistQueryClientSave,
  persistQueryClientSubscribe,
} from "@tanstack/query-persist-client-core"
import {
  type Query,
  type QueryClient,
  queryOptions,
  useQueries,
} from "@tanstack/react-query"
import { useCallback } from "react"

import { neckworkClient } from "@/api/neckwork"
import {
  getLargestFall,
  getRiskLevel,
  type RiskLevel,
  toPriceRatios,
} from "@/modules/strategies/multiply/utils/risk"
import { IndexedDBStores } from "@/utils/indexedDB"
import { createIndexedDbPersister } from "@/utils/indexedDbPersister"

const WINDOW_MS = 30 * 24 * 60 * 60_000
// a 30-day drawdown barely moves in a few hours, so badges reuse it across reloads
const RISK_SERIES_MAX_AGE = 4 * 60 * 60_000
const RISK_SERIES_BUSTER = "risk-series-v1"
const RISK_SERIES_KEY = ["multiply", "riskSeries"] as const

/** Hourly 30-day closes of one asset against USDT, trimmed to what the risk math reads. */
export const riskSeriesQuery = (assetId: string) => {
  const candles = pairCandlesQuery(neckworkClient, {
    assetIn: assetId,
    assetOut: USDT_ASSET_ID,
    bucket: "1h",
    rangeMs: WINDOW_MS,
  })

  return queryOptions({
    queryKey: [...RISK_SERIES_KEY, assetId],
    staleTime: RISK_SERIES_MAX_AGE,
    gcTime: RISK_SERIES_MAX_AGE,
    refetchOnWindowFocus: false,
    queryFn: async (ctx) => {
      const data = await candles.queryFn!({
        ...ctx,
        queryKey: candles.queryKey,
      })
      return data.map(({ time, close }) => ({ time, close }))
    },
  })
}

const riskSeriesPersister = createIndexedDbPersister({
  store: IndexedDBStores.RiskSeries,
  key: "closes",
})

const shouldDehydrateRiskSeriesQuery = (query: Query): boolean =>
  query.state.status === "success" &&
  RISK_SERIES_KEY.every((part, i) => query.queryKey[i] === part)

export const setupRiskSeriesPersistence = (queryClient: QueryClient) => {
  persistQueryClientRestore({
    queryClient,
    persister: riskSeriesPersister,
    maxAge: RISK_SERIES_MAX_AGE,
    buster: RISK_SERIES_BUSTER,
  })
    .catch((error) => {
      console.error("Failed to restore risk series cache", error)
    })
    .then(() => {
      const persistOptions = {
        queryClient,
        persister: riskSeriesPersister,
        buster: RISK_SERIES_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldDehydrateRiskSeriesQuery,
        },
      }
      persistQueryClientSubscribe(persistOptions)
      persistQueryClientSave(persistOptions)
    })
}

export type PairRisk = {
  level: RiskLevel
  // largest 30-day collateral/debt fall, null without history
  largestFall: number | null
}

/**
 * Risk levels for any pair of the given reserves. One hourly 30-day series per
 * reserve against USDT, divided client-side, never one request per pair: the
 * price API is rate-limited.
 */
export const usePairRiskLevels = (assetIds: string[]) => {
  const ids = [...new Set(assetIds)].filter((id) => id !== USDT_ASSET_ID)

  const series = useQueries({
    queries: ids.map(riskSeriesQuery),
    combine: (results) => ({
      byId: new Map(ids.map((id, i) => [id, results[i]!])),
    }),
  })

  return useCallback(
    (
      collateralAssetId: string,
      debtAssetId: string,
      { correlated, hf }: { correlated: boolean; hf: number },
    ): PairRisk | null => {
      const closes = (id: string) => {
        if (id === USDT_ASSET_ID) return "usdt" as const
        const query = series.byId.get(id)
        if (!query || query.isPending) return null
        return query.data ?? []
      }
      const c = closes(collateralAssetId)
      const d = closes(debtAssetId)
      if (c === null || d === null)
        return correlated ? { level: "low", largestFall: null } : null

      // USDT is the quote asset, so its own series is a flat 1 at the other side's times
      const flat = (other: typeof c) =>
        other === "usdt" ? [] : other.map(({ time }) => ({ time, close: 1 }))
      const ratios = toPriceRatios(
        c === "usdt" ? flat(d) : c,
        d === "usdt" ? flat(c) : d,
      )
      const largestFall = getLargestFall(ratios)

      return {
        level: getRiskLevel({ correlated, largestFall, hf }),
        largestFall: largestFall?.fall ?? null,
      }
    },
    [series],
  )
}
