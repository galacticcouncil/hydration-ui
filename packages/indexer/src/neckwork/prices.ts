import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import { NeckworkClient, NeckworkResponse } from "."

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

/**
 * Epoch day 0 was a Thursday, so flooring a timestamp to a whole number of
 * weeks lands on Thursday.
 */
const WEEK_ORIGIN_MS = 4 * 24 * 60 * 60_000

export const bucketOpenMs = (bucket: CandleBucket, nowMs: number): number => {
  const bucketMs = CANDLE_BUCKET_MS[bucket]

  if (bucket !== "1w") return Math.floor(nowMs / bucketMs) * bucketMs

  return (
    Math.floor((nowMs - WEEK_ORIGIN_MS) / bucketMs) * bucketMs + WEEK_ORIGIN_MS
  )
}

export type PairCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const toPairCandle = (
  item: NeckworkResponse<"/v1/prices/pair">["items"][number],
): PairCandle => ({
  time: Math.floor(new Date(item.timestamp).getTime() / 1000),
  open: Number(item.open),
  high: Number(item.high),
  low: Number(item.low),
  close: Number(item.close),
  volume: Number(item.volumeUsd),
})

export const pairCandlesWindow = (
  bucket: CandleBucket,
  oldestLoadedMs: number | null,
  nowMs: number,
): { from: string; to: string } => {
  const to = oldestLoadedMs === null ? nowMs : oldestLoadedMs - 1
  const from = to - CANDLE_PAGE_SIZE * CANDLE_BUCKET_MS[bucket]

  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() }
}

/**
 * Flat 1:1 series for pairs that are pegged by construction — an aToken and
 * its underlying. Neckwork has no candles for these because they never trade
 * against each other; the price is always exactly 1.
 */
export const peggedCandles = (
  bucket: CandleBucket,
  count: number = CANDLE_PAGE_SIZE,
): PairCandle[] => {
  const step = CANDLE_BUCKET_MS[bucket] / 1000
  const latest = bucketOpenMs(bucket, Date.now()) / 1000

  return Array.from({ length: count }, (_, index) => ({
    time: latest - (count - 1 - index) * step,
    open: 1,
    high: 1,
    low: 1,
    close: 1,
    volume: 0,
  }))
}

export const invertCandle = (candle: PairCandle): PairCandle => ({
  time: candle.time,
  open: 1 / candle.open,
  high: 1 / candle.low,
  low: 1 / candle.high,
  close: 1 / candle.close,
  volume: candle.volume,
})

/** How many closed buckets the tail covers, and so how long an indexer
 * outage can be absorbed before a synthetic candle is dropped as
 * uncorrectable. */
export const TAIL_BUCKETS = 24

/**
 * Extend the synthetic run with the latest spot price. The last entry is the
 * tip; when the clock crosses into a new bucket the old tip stays behind to
 * wait for the tail to confirm it, and a fresh tip opens at its close.
 *
 * A fresh tip opens at the previous close rather than at the bucket's first
 * traded price, which is what a confirmed candle would report. The tail
 * corrects it once the bucket closes.
 */
export const advanceSynthetics = (
  synthetics: ReadonlyArray<PairCandle>,
  newestConfirmed: PairCandle | undefined,
  price: number,
  bucket: CandleBucket,
  nowMs: number = Date.now(),
): ReadonlyArray<PairCandle> => {
  if (!isFinite(price) || price <= 0) return synthetics

  const openTime = bucketOpenMs(bucket, nowMs) / 1000
  const tip = synthetics.at(-1)

  if (tip && tip.time === openTime)
    return synthetics.with(-1, {
      ...tip,
      high: Math.max(tip.high, price),
      low: Math.min(tip.low, price),
      close: price,
    })

  // drop what the API has already confirmed, and anything at or past the open
  // bucket so the run stays in ascending order if the clock moves backwards
  const kept = synthetics.filter(
    (candle) =>
      candle.time < openTime &&
      (!newestConfirmed || candle.time > newestConfirmed.time),
  )

  const open = tip?.close ?? newestConfirmed?.close ?? price

  return [
    ...kept,
    {
      time: openTime,
      open,
      high: Math.max(open, price),
      low: Math.min(open, price),
      close: price,
      volume: 0,
    },
  ]
}

/**
 * One series out of the three sources. A confirmed candle always wins over a
 * synthetic one for the same bucket, and a synthetic candle older than the
 * tail's reach is dropped rather than left on the chart with no way of ever
 * being corrected.
 */
export const mergeCandles = (
  history: ReadonlyArray<PairCandle>,
  tail: ReadonlyArray<PairCandle>,
  synthetics: ReadonlyArray<PairCandle>,
): PairCandle[] => {
  const byTime = new Map<number, PairCandle>()

  for (const candle of history) byTime.set(candle.time, candle)
  for (const candle of tail) byTime.set(candle.time, candle)

  // an empty tail has no reach yet, so nothing is uncorrectable
  const oldestCorrectable = tail[0]?.time ?? 0

  for (const candle of synthetics) {
    if (candle.time < oldestCorrectable) continue
    if (byTime.has(candle.time)) continue
    byTime.set(candle.time, candle)
  }

  return [...byTime.values()].sort((a, b) => a.time - b.time)
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

      const close = data && data.items.at(-1)?.close
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

      return data.items.map(toPairCandle)
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const oldest = lastPage[0]
      if (!oldest) return undefined

      const next = oldest.time * 1000
      return lastPageParam === null || next < lastPageParam ? next : undefined
    },
  })

/**
 * One trailing window of candles, for charts that pick a time range instead of
 * scrolling back through history. `to` rounds down to the bucket so the query
 * key stays stable between renders.
 */
export const pairCandlesQuery = (
  client: NeckworkClient,
  { assetIn, assetOut, bucket, rangeMs }: PairCandlesArgs & { rangeMs: number },
) =>
  queryOptions({
    queryKey: [
      "neckwork",
      "pairCandlesRange",
      assetIn,
      assetOut,
      bucket,
      rangeMs,
    ],
    staleTime: CANDLE_BUCKET_MS[bucket],
    queryFn: async (): Promise<PairCandle[]> => {
      const to = bucketOpenMs(bucket, Date.now())

      const { data } = await client.GET("/v1/prices/pair", {
        params: {
          query: {
            assetIn,
            assetOut,
            bucket,
            from: new Date(to - rangeMs).toISOString(),
            to: new Date(to).toISOString(),
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no pair candles")

      return data.items.map(toPairCandle)
    },
  })
