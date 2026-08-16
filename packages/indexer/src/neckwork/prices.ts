import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import { NeckworkClient } from "."

export const CANDLE_BUCKETS = [
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w",
] as const

export type CandleBucket = (typeof CANDLE_BUCKETS)[number]

export const CANDLE_BUCKET_MS: Record<CandleBucket, number> = {
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
  "1w": 7 * 24 * 60 * 60_000,
}

export const CANDLE_PAGE_SIZE = 300

export type PairCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const pairCandlesWindow = (
  bucket: CandleBucket,
  oldestLoadedMs: number | null,
  nowMs: number,
): { from: string; to: string } => {
  const to = oldestLoadedMs === null ? nowMs : oldestLoadedMs - 1
  const from = to - CANDLE_PAGE_SIZE * CANDLE_BUCKET_MS[bucket]

  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() }
}

export const invertCandle = (candle: PairCandle): PairCandle => ({
  time: candle.time,
  open: 1 / candle.open,
  high: 1 / candle.low,
  low: 1 / candle.high,
  close: 1 / candle.close,
  volume: candle.volume,
})

/**
 * Advance the in-progress candle. `previous` must be the most recent candle
 * known — the running live one when there is one, otherwise the newest from
 * the API. Passing the API candle on every tick makes high/low static and
 * every new bucket a copy of the last fetched one.
 */
export const liveCandle = (
  previous: PairCandle,
  price: number,
  bucket: CandleBucket,
  nowMs: number = Date.now(),
): PairCandle => {
  const bucketMs = CANDLE_BUCKET_MS[bucket]
  const openTime = Math.floor(nowMs / bucketMs) * (bucketMs / 1000)

  if (previous.time >= openTime)
    return {
      ...previous,
      high: Math.max(previous.high, price),
      low: Math.min(previous.low, price),
      close: price,
    }

  return {
    time: openTime,
    open: previous.close,
    high: Math.max(previous.close, price),
    low: Math.min(previous.close, price),
    close: price,
    volume: 0,
  }
}

export const PRICE_CHANGE_PERIODS = ["24h", "7d"] as const

export type PriceChangePeriod = (typeof PRICE_CHANGE_PERIODS)[number]

const PRICE_CHANGE_LOOKBACK: Record<
  PriceChangePeriod,
  { ms: number; bucket: CandleBucket }
> = {
  "24h": { ms: 24 * 60 * 60_000, bucket: "1h" },
  "7d": { ms: 7 * 24 * 60 * 60_000, bucket: "4h" },
}

export const pairReferencePriceQuery = (
  client: NeckworkClient,
  {
    assetIn,
    assetOut,
    period,
  }: Omit<PairCandlesArgs, "bucket"> & { period: PriceChangePeriod },
) => {
  const { ms, bucket } = PRICE_CHANGE_LOOKBACK[period]

  return queryOptions({
    queryKey: ["neckwork", "pairReferencePrice", assetIn, assetOut, period],
    staleTime: CANDLE_BUCKET_MS[bucket],
    queryFn: async (): Promise<number | null> => {
      // round to the bucket so the key-stable query doesn't refetch every render
      const cutoff =
        Math.floor((Date.now() - ms) / CANDLE_BUCKET_MS[bucket]) *
        CANDLE_BUCKET_MS[bucket]

      const { data } = await client.GET("/v1/prices/pair", {
        params: {
          query: {
            assetIn,
            assetOut,
            bucket,
            // a few buckets of slack so a gap in the series still resolves
            from: new Date(cutoff - 4 * CANDLE_BUCKET_MS[bucket]).toISOString(),
            to: new Date(cutoff).toISOString(),
          },
        },
      })

      const close = data && Array.from(data.items).at(-1)?.close
      return close === undefined ? null : Number(close)
    },
  })
}

type PairCandlesArgs = {
  assetIn: string
  assetOut: string
  bucket: CandleBucket
}

export const pairCandlesInfiniteQuery = (
  client: NeckworkClient,
  { assetIn, assetOut, bucket }: PairCandlesArgs,
) =>
  infiniteQueryOptions({
    queryKey: ["neckwork", "pairCandles", assetIn, assetOut, bucket],
    staleTime: CANDLE_BUCKET_MS[bucket],
    refetchOnWindowFocus: false,
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }): Promise<PairCandle[]> => {
      const { data } = await client.GET("/v1/prices/pair", {
        params: {
          query: {
            assetIn,
            assetOut,
            bucket,
            ...pairCandlesWindow(bucket, pageParam, Date.now()),
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no pair candles")

      return Array.from(data.items).map((item) => ({
        time: Math.floor(new Date(item.timestamp).getTime() / 1000),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volumeUsd),
      }))
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const oldest = lastPage[0]
      if (!oldest) return undefined

      const next = oldest.time * 1000
      return lastPageParam === null || next < lastPageParam ? next : undefined
    },
  })
