import {
  APYUSD_ASSET_ID,
  JITOSOL_ASSET_ID,
  SUSDE_ASSET_ID,
  SUSDS_ASSET_ID,
  VDOT_ASSET_ID,
  WSTETH_ASSET_ID,
} from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour } from "date-fns/constants"
import z from "zod/v4"

import { fetchFeedJson, retryFeedQuery } from "@/api/external/feed"
import {
  assertPlausibleApy,
  ExternalApyReading,
  newestBy,
} from "@/api/external/reading"

const defillamaApyHistoryEntrySchema = z.object({
  timestamp: z.string(),
  tvlUsd: z.number().nullable(),
  apy: z.number().nullable(),
  apyBase: z.number().nullable(),
  apyReward: z.number().nullable(),
  il7d: z.number().nullable(),
  apyBase7d: z.number().nullable(),
})

const defillamaApiResponseSchema = z.object({
  data: z.array(defillamaApyHistoryEntrySchema),
})

export const ASSET_ID_TO_DEFILLAMA_ID: Record<string, string> = {
  [VDOT_ASSET_ID]: "ff05ab26-971e-4e68-b1c6-c61a4c12c364",
  [WSTETH_ASSET_ID]: "747c1d2a-c668-4682-b9f9-296708a3dd90",
  [SUSDE_ASSET_ID]: "66985a81-9c51-46ca-9977-42b4fe7bc6df",
  [SUSDS_ASSET_ID]: "d8c4eff5-c8a9-46fc-a888-057c4c668e72",
  [JITOSOL_ASSET_ID]: "0e7d0722-9054-4907-8593-567b353c0900",
  [APYUSD_ASSET_ID]: "cb6139f9-4a68-4efd-8245-0312a92aee55",
}

const DEFILLAMA_YIELDS_CHART = "defillama/yields/chart"

export const parseDefillamaReading = (
  json: unknown,
  source: string,
): ExternalApyReading => {
  const entries = defillamaApiResponseSchema.parse(json).data.map((entry) => ({
    percent: entry.apyBase ?? entry.apy,
    asOf: Date.parse(entry.timestamp),
  }))
  const newest = newestBy(
    entries.filter(({ asOf }) => Number.isFinite(asOf)),
    ({ asOf }) => asOf,
  )

  if (!newest) {
    throw new Error(`No entries from ${source}`)
  }

  if (newest.percent === null) {
    throw new Error(`No APY in the newest entry from ${source}`)
  }

  return {
    apy: assertPlausibleApy(Big(newest.percent).div(100).toFixed(), source),
    asOf: newest.asOf,
  }
}

const fetchDefillamaLatestApy = async (
  id: string,
  indexerUrl: string,
  signal: AbortSignal,
): Promise<ExternalApyReading> => {
  const source = `defillama:${id}`
  const json = await fetchFeedJson(
    `${indexerUrl}/${DEFILLAMA_YIELDS_CHART}/${id}`,
    source,
    signal,
  )

  return parseDefillamaReading(json, source)
}

export const defillamaLatestApyQuery = (id: string, indexerUrl: string) =>
  queryOptions({
    queryKey: ["externalApy", "defillama", id],
    queryFn: ({ signal }) => fetchDefillamaLatestApy(id, indexerUrl, signal),
    staleTime: millisecondsInHour,
    retry: retryFeedQuery,
    enabled: !!id,
  })
