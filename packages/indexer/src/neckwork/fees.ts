import { queryOptions } from "@tanstack/react-query"

import type { paths } from "@/neckwork/__generated__/schema"

import { NeckworkClient } from "."

type FeesChartParams =
  paths["/api/v1/fees/charts"]["get"]["parameters"]["query"]

export type FeeProductType = FeesChartParams["productType"]
export type FeeStreamType = FeesChartParams["streamType"]
export type FeeDestination = NonNullable<FeesChartParams["feeDestination"]>
export type FeeBucketSize = FeesChartParams["bucketSize"]

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
 * Fee streams in stack order — array order is the bottom-to-top order of the
 * bars, so reordering this changes the chart.
 *
 * Only the Omnipool per-asset fee follows the view mode. The hub fee returns
 * the same payload for `protocol` and `total`, so pinning it to `protocol`
 * keeps its query key stable across a view-mode switch.
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
 * Wide start for the ALL range. The API omits empty buckets, so this does not
 * inflate the response. A start before the API's bucket-grid anchor returns
 * empty data rather than extra history.
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
 * Request window for one time range. The caller passes the clock so the
 * window (and the query key) is reproducible.
 *
 * Start is a UTC day boundary because the API's bucket grid is UTC-anchored.
 * End is now, quantized, so the current day still appears as a short final bar.
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

export type FeeBucket = {
  time: number
  value: number
}

export type FeesChartResult = {
  buckets: FeeBucket[]
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
 * Fold per-stream results into chart rows and totals.
 *
 * Streams come back ragged — different lengths and timestamps over the same
 * window — so the merge is by timestamp, never by index. A missing (bucket,
 * stream) pair is treated as zero by the chart; zero-filling would draw
 * phantom bars.
 *
 * Sort ascending by time: the band scale takes its domain in first-seen
 * order, and rows arrive grouped by stream, so an unsorted list scrambles
 * the x-axis.
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
