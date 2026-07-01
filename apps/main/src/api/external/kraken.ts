import { queryOptions, useQuery } from "@tanstack/react-query"
import z from "zod/v4"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

const krakenCandleSchema = z.tuple([
  z.number(), // [0] time (unix seconds)
  z.string(), // [1] open
  z.string(), // [2] high
  z.string(), // [3] low
  z.string(), // [4] close
  z.string(), // [5] vwap
  z.string(), // [6] volume
  z.number(), // [7] count
])

const krakenOhlcResponseSchema = z.object({
  error: z.array(z.string()),
  result: z.record(
    z.string(),
    z.union([z.array(krakenCandleSchema), z.number()]),
  ),
})

export type ForeignPricePoint = {
  timestamp: number
  close: number
  open?: number
  high?: number
  low?: number
}

export type KrakenPricePoint = ForeignPricePoint &
  Required<Pick<ForeignPricePoint, "open" | "high" | "low">>

// Allowlisted cross-chain destination platforms -> Kraken USD pairs.
// Keep this an explicit allowlist (mirrors the backend proxy proposal).
export const KRAKEN_PAIRS = {
  near: "NEARUSD",
  zec: "ZECUSD",
} as const

export type KrakenPlatform = keyof typeof KRAKEN_PAIRS

export const krakenPairForPlatform = (
  platform: string | undefined,
): string | undefined => KRAKEN_PAIRS[platform as KrakenPlatform]

const KRAKEN_BASE = "https://api.kraken.com/0/public"

const fetchKrakenOhlc = async (
  pair: string,
  interval: number,
): Promise<KrakenPricePoint[]> => {
  const res = await fetch(
    `${KRAKEN_BASE}/OHLC?pair=${pair}&interval=${interval}`,
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch Kraken OHLC: ${res.statusText}`)
  }

  const json = await res.json()
  const parsed = krakenOhlcResponseSchema.parse(json)

  if (parsed.error.length) {
    throw new Error(`Kraken error: ${parsed.error.join(", ")}`)
  }

  // Kraken may return the pair under a legacy key (e.g. XZECZUSD) rather than
  // the requested name — grab the first candle array, ignoring the "last" cursor.
  const candles = Object.entries(parsed.result).find(
    ([key, value]) => key !== "last" && Array.isArray(value),
  )?.[1]

  if (!Array.isArray(candles)) {
    return []
  }

  return candles.map((candle) => ({
    timestamp: candle[0],
    open: Number(candle[1]),
    high: Number(candle[2]),
    low: Number(candle[3]),
    close: Number(candle[4]),
  }))
}

export const krakenOhlcQuery = (pair: string, interval: number) =>
  queryOptions({
    queryKey: ["krakenOhlc", pair, interval],
    queryFn: () => fetchKrakenOhlc(pair, interval),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 2,
  })

export const useKrakenOhlc = (
  platform: string | undefined,
  interval: number,
  enabled = true,
) => {
  const pair = krakenPairForPlatform(platform)

  return useQuery({
    ...krakenOhlcQuery(pair ?? "", interval),
    enabled: enabled && !!pair,
  })
}
