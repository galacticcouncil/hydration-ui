import { createQueryString, PRIME_ASSET_ID } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import { addHours, startOfHour, subHours } from "date-fns"
import { millisecondsInHour } from "date-fns/constants"
import { z } from "zod"

import { fetchFeedJson, retryFeedQuery } from "@/api/external/feed"
import {
  assertPlausibleApy,
  ExternalApyReading,
  newestBy,
} from "@/api/external/reading"

const KAMINO_YIELDS_HISTORY = "kamino/yields"
const KAMINO_WINDOW_HOURS = 24

const getKaminoEndpoint = (yieldSource: string, indexerUrl: string) =>
  `${indexerUrl}/${KAMINO_YIELDS_HISTORY}/${yieldSource}/history`

export const ASSET_ID_TO_KAMINO_ID: Record<string, string> = {
  [PRIME_ASSET_ID]: "3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7",
}

const historyEntrySchema = z.object({
  createdOn: z.string(),
  apr: z.string(),
  apy: z.string(),
})

const historyApiResponseSchema = z.array(historyEntrySchema)

// Entries are hourly and the feed has gaps of several hours, so the window is
// a day. Whole-hour bounds keep the URL stable within the hour.
export const getKaminoWindow = (now: Date) => {
  const end = addHours(startOfHour(now), 1)

  return { start: subHours(end, KAMINO_WINDOW_HOURS), end }
}

export const parseKaminoReading = (
  json: unknown,
  source: string,
): ExternalApyReading => {
  const entries = historyApiResponseSchema.parse(json).map((entry) => ({
    apy: entry.apy,
    asOf: Date.parse(entry.createdOn),
  }))
  const newest = newestBy(
    entries.filter(({ asOf }) => Number.isFinite(asOf)),
    ({ asOf }) => asOf,
  )

  if (!newest) {
    throw new Error(`No entries from ${source}`)
  }

  return { apy: assertPlausibleApy(newest.apy, source), asOf: newest.asOf }
}

const fetchKaminoApy = async (
  id: string,
  indexerUrl: string,
  signal: AbortSignal,
): Promise<ExternalApyReading> => {
  const source = `kamino:${id}`
  const { start, end } = getKaminoWindow(new Date())

  const json = await fetchFeedJson(
    `${getKaminoEndpoint(id, indexerUrl)}${createQueryString({
      start: start.toISOString(),
      end: end.toISOString(),
    })}`,
    source,
    signal,
  )

  return parseKaminoReading(json, source)
}

export const kaminoApyQuery = (id: string, indexerUrl: string) =>
  queryOptions({
    queryKey: ["externalApy", "kamino", id],
    queryFn: ({ signal }) => fetchKaminoApy(id, indexerUrl, signal),
    staleTime: millisecondsInHour,
    retry: retryFeedQuery,
  })
