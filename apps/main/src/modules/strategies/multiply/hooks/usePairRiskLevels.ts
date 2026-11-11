import { pairCandlesQuery } from "@galacticcouncil/indexer/neckwork"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useQueries } from "@tanstack/react-query"
import { useCallback } from "react"

import { neckworkClient } from "@/api/neckwork"
import {
  getLargestFall,
  getRiskLevel,
  type RiskLevel,
  toPriceRatios,
} from "@/modules/strategies/multiply/utils/risk"

const WINDOW_MS = 30 * 24 * 60 * 60_000

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
    queries: ids.map((assetIn) =>
      pairCandlesQuery(neckworkClient, {
        assetIn,
        assetOut: USDT_ASSET_ID,
        bucket: "1h",
        rangeMs: WINDOW_MS,
      }),
    ),
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
