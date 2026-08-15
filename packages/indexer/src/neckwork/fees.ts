import { queryOptions } from "@tanstack/react-query"

import type { paths } from "@/neckwork/__generated__/schema"

import { NeckworkClient } from "."

type FeesChartParams =
  paths["/api/v1/fees/charts"]["get"]["parameters"]["query"]

export type FeeProductType = FeesChartParams["productType"]
export type FeeStreamType = FeesChartParams["streamType"]
export type FeeDestination = NonNullable<FeesChartParams["feeDestination"]>
export type FeeBucketSize = FeesChartParams["bucketSize"]

/** Which slice of the Omnipool trade fee the page is showing. */
export type FeeViewMode = "protocol" | "total"

export type FeeStreamKey =
  | "asset"
  | "protocol"
  | "liquidationPenalty"
  | "peplLiquidationProfit"
  | "assetReserve"
  | "borrowApr"
  | "hsmRevenue"

export type FeeStream = {
  key: FeeStreamKey
  productType: FeeProductType
  streamType: FeeStreamType
  feeDestination: (viewMode: FeeViewMode) => FeeDestination
}

const alwaysProtocol = () => "protocol" as const

/**
 * The seven fee streams, in stack order — array order IS the bottom-to-top
 * order of the bars, so reordering this changes the chart.
 *
 * Only the Omnipool per-asset fee follows the view mode. The hub fee answers
 * with byte-identical payloads for `protocol` and `total`, so pinning it to
 * `protocol` keeps its query key stable across a view-mode switch instead of
 * refetching the same bytes under a second key.
 */
export const FEE_STREAMS: readonly FeeStream[] = [
  {
    key: "borrowApr",
    productType: "hollar",
    streamType: "borrow_apr",
    feeDestination: alwaysProtocol,
  },
  {
    key: "asset",
    productType: "omnipool",
    streamType: "asset",
    feeDestination: (viewMode) => viewMode,
  },
  {
    key: "protocol",
    productType: "omnipool",
    streamType: "protocol",
    feeDestination: alwaysProtocol,
  },
  {
    key: "liquidationPenalty",
    productType: "money-market",
    streamType: "liquidation_penalty",
    feeDestination: alwaysProtocol,
  },
  {
    key: "peplLiquidationProfit",
    productType: "money-market",
    streamType: "pepl_liquidation_profit",
    feeDestination: alwaysProtocol,
  },
  {
    key: "assetReserve",
    productType: "money-market",
    streamType: "asset_reserve",
    feeDestination: alwaysProtocol,
  },
  {
    key: "hsmRevenue",
    productType: "hollar",
    streamType: "hsm_revenue",
    feeDestination: alwaysProtocol,
  },
]

export const TIME_RANGES = ["1W", "1M", "1Y", "ALL"] as const

export type TimeRange = (typeof TIME_RANGES)[number]

const DAY_MS = 24 * 60 * 60_000

const BUCKET_SIZE: Record<TimeRange, FeeBucketSize> = {
  "1W": "24hour",
  "1M": "24hour",
  "1Y": "7day",
  ALL: "30day",
}

const RANGE_DAYS: Record<Exclude<TimeRange, "ALL">, number> = {
  "1W": 7,
  "1M": 30,
  "1Y": 365,
}

/**
 * `ALL` means all of it, like the explorer's `all` range — the API omits
 * buckets it has no rows for, so an over-wide start costs nothing and stops
 * the chart from truncating history the way a hand-picked 2023 start did.
 *
 * The floor is the API's own bucket-grid anchor: a start before it answers
 * `{"data": []}` (measured) rather than more history.
 */
const ALL_START_MS = Date.UTC(2000, 0, 3)

/**
 * How far the window end is quantized. The endpoint answers `max-age=300`, so
 * a coarser end than that would only add staleness, and a finer one would
 * churn the query key without new bytes behind it.
 */
const END_QUANTUM_MS = 300_000

export type FeesChartWindow = {
  startTime: string
  endTime: string
  bucketSize: FeeBucketSize
}

/**
 * Request window for one time range. Pure — the caller passes the clock in, so
 * the window (and the query key built from it) is reproducible.
 *
 * The start is a UTC day boundary because the API's bucket grid is
 * UTC-anchored; a local-time start would cut the first bucket in half
 * everywhere but UTC+0. The end is now (quantized), so the running day shows
 * up as a short final bar — the explorer counts it, and dropping it hid up to
 * a day of revenue.
 */
export const feesChartWindow = (
  timeRange: TimeRange,
  nowMs: number,
): FeesChartWindow => {
  const todayStartMs = Math.floor(nowMs / DAY_MS) * DAY_MS

  const startMs =
    timeRange === "ALL"
      ? ALL_START_MS
      : todayStartMs - RANGE_DAYS[timeRange] * DAY_MS

  return {
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(
      Math.floor(nowMs / END_QUANTUM_MS) * END_QUANTUM_MS,
    ).toISOString(),
    bucketSize: BUCKET_SIZE[timeRange],
  }
}

/** One bucket of one stream. `time` is the bucket start, in ms epoch. */
export type FeeBucket = {
  time: number
  value: number
}

export type FeesChartResult = {
  buckets: FeeBucket[]
  /**
   * The endpoint's own aggregate over the window — documented as the sum of
   * the returned buckets, so it is carried through but never needed: totals
   * are summed from `buckets`, which the fold has to walk anyway.
   */
  periodAggregate: number
}

type FeesChartArgs = FeesChartWindow & {
  productType: FeeProductType
  streamType: FeeStreamType
  feeDestination: FeeDestination
}

/**
 * One stream over one window. The key holds the resolved `feeDestination`
 * rather than the view mode it came from, so switching view mode refetches
 * only the stream whose destination actually changed.
 */
export const feesChartQuery = (
  client: NeckworkClient,
  {
    productType,
    streamType,
    feeDestination,
    startTime,
    endTime,
    bucketSize,
  }: FeesChartArgs,
) =>
  queryOptions({
    queryKey: [
      "neckwork",
      "feesChart",
      productType,
      streamType,
      feeDestination,
      bucketSize,
      startTime,
      endTime,
    ],
    // the endpoint answers with a uniform `cache-control: max-age=300`
    staleTime: 300_000,
    queryFn: async (): Promise<FeesChartResult> => {
      const { data } = await client.GET("/api/v1/fees/charts", {
        params: {
          query: {
            productType,
            streamType,
            feeDestination,
            startTime,
            endTime,
            bucketSize,
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no fees chart")

      return {
        buckets: Array.from(data.data).map((bucket) => ({
          time: Number(new Date(bucket.timestamp)),
          value: bucket.value,
        })),
        periodAggregate: data.periodAggregate,
      }
    },
  })

/** One (bucket, stream) pair — the long format the stacked bar consumes. */
export type FeeRow = {
  time: number
  stream: FeeStreamKey
  value: number
}

export type FeeTotals = {
  byStream: Partial<Record<FeeStreamKey, number>>
  total: number
}

export type FeesChartFold = {
  rows: FeeRow[]
  totals: FeeTotals
}

/**
 * Folds the per-stream results into chart rows and totals.
 *
 * Streams come back ragged — different lengths and different timestamps over
 * the same window — so the merge is by timestamp, never by index. A stream with
 * no bucket at a given timestamp contributes no row; the chart already treats a
 * missing pair as zero for layout, and zero-filling would draw phantom bars.
 *
 * Sorting ascending by time is load-bearing: the band scale takes its domain in
 * first-seen order, and rows arrive grouped by stream, so an unsorted list
 * scrambles the x-axis.
 *
 * Totals are summed from the buckets, in the same walk that builds the rows —
 * `periodAggregate` would agree, but only per stream, and the chart needs the
 * per-stream breakdown regardless.
 */
export const foldFeesChart = (
  results: Partial<Record<FeeStreamKey, FeesChartResult>>,
  streamKeys: readonly FeeStreamKey[],
): FeesChartFold => {
  const rows: FeeRow[] = []
  const byStream: Partial<Record<FeeStreamKey, number>> = {}
  let total = 0

  for (const stream of streamKeys) {
    let streamTotal = 0

    for (const { time, value } of results[stream]?.buckets ?? []) {
      rows.push({ time, stream, value })
      streamTotal += value
    }

    byStream[stream] = streamTotal
    total += streamTotal
  }

  // stable sort, so rows sharing a timestamp keep their stack order
  rows.sort((a, b) => a.time - b.time)

  return { rows, totals: { byStream, total } }
}
