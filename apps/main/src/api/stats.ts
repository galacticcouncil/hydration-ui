import {
  SquidSdk,
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
} from "@galacticcouncil/indexer/squid"
import { createQueryString, isValidBigSource } from "@galacticcouncil/utils"
import { QueryClient, queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { endOfDay, subDays } from "date-fns"
import z from "zod/v4"

import { spotPriceQuery } from "@/api/spotPrice"
import {
  TimeRange as OverviewChartTimeRange,
  VOLUME_BAR_SCALE_BY_RANGE,
} from "@/modules/stats/overview/components/MultiMetricChart.utils"
import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, NATIVE_ASSET_ID, STALE_TIME } from "@/utils/consts"
import { numerically, sortBy } from "@/utils/sort"

// const DEFILLAMA_HYDRATION_TVL = "defillama/api/v2/historicalChainTvl/HydraDX"
// const DEFILLAMA_HYDRATION_DEX_VOLUME =
//   "defillama/api/summary/dexs/hydration-dex?dataType=dailyVolume"

const DEFILLAMA_HYDRATION_TVL_URL =
  "https://api.llama.fi/v2/historicalChainTvl/HydraDX"
const DEFILLAMA_HYDRATION_DEX_VOLUME_URL =
  "https://api.llama.fi/summary/dexs/hydration-dex?dataType=dailyVolume"

type StatsHistoryPoint = {
  timestamp: number
  value: number
}

type PlatformVolumeHistoryBucket = {
  durationMs: number
  period: "_1H_" | "_12H_" | "_24H_"
}

const defillamaTvlHistorySchema = z.array(
  z.object({
    date: z.number(),
    tvl: z.number(),
  }),
)

const defillamaDexVolumeHistorySchema = z.object({
  totalDataChart: z.array(z.tuple([z.number(), z.number()])),
})

const fetchDefillamaHydrationTvlHistory = async (
  indexerUrl: string,
): Promise<StatsHistoryPoint[]> => {
  console.log(indexerUrl)
  const response = await fetch(DEFILLAMA_HYDRATION_TVL_URL) //await fetch(`${indexerUrl}/${DEFILLAMA_HYDRATION_TVL}`)

  if (!response.ok) {
    throw new Error(`DeFiLlama TVL API error: ${response.statusText}`)
  }

  const parsed = defillamaTvlHistorySchema.parse(await response.json())

  return parsed.map(({ date, tvl }) => ({
    timestamp: date * 1000,
    value: tvl,
  }))
}

const defillamaHydrationTvlHistoryQuery = (indexerUrl: string) =>
  queryOptions({
    queryKey: ["stats", "defillamaHydrationTvlHistory"],
    queryFn: () => fetchDefillamaHydrationTvlHistory(indexerUrl),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!indexerUrl,
  })

const fetchDefillamaHydrationDexVolumeHistory = async (
  indexerUrl: string,
): Promise<StatsHistoryPoint[]> => {
  console.log(indexerUrl)

  const response = await fetch(
    DEFILLAMA_HYDRATION_DEX_VOLUME_URL, //`${indexerUrl}/${DEFILLAMA_HYDRATION_DEX_VOLUME}`,
  )

  if (!response.ok) {
    throw new Error(`DeFiLlama Volume API error: ${response.statusText}`)
  }

  const parsed = defillamaDexVolumeHistorySchema.parse(await response.json())

  return parsed.totalDataChart.map(([timestamp, value]) => ({
    timestamp: timestamp * 1000,
    value,
  }))
}

const getUtcBucketStart = (date: Date, durationMs: number) =>
  Math.floor(date.getTime() / durationMs) * durationMs

const DAY_MS = 24 * 60 * 60 * 1000

const getCompletedUtcRanges = (days: number, durationMs: number) => {
  const currentBucketStart = getUtcBucketStart(new Date(), durationMs)
  const bucketCount = Math.ceil((days * DAY_MS) / durationMs)

  return Array.from({ length: bucketCount }, (_, index) => {
    const start = currentBucketStart - (bucketCount - index) * durationMs
    const end = start + durationMs

    return { start, end }
  })
}

const fetchPlatformDailyVolumeHistory = async (
  indexerUrl: string,
  days: number,
  bucket: PlatformVolumeHistoryBucket,
): Promise<StatsHistoryPoint[]> => {
  const ranges = getCompletedUtcRanges(days, bucket.durationMs)

  const volume = await fetchDefillamaHydrationDexVolumeHistory(indexerUrl)
  const minTimestamp = ranges[0]?.start ?? 0

  return volume.filter((point) => point.timestamp >= minTimestamp)
}

const platformDailyVolumeHistoryQuery = (
  indexerUrl: string,
  days: number,
  bucket: PlatformVolumeHistoryBucket,
) =>
  queryOptions({
    queryKey: ["stats", "platformDailyVolumeHistory", days, bucket],
    queryFn: () => fetchPlatformDailyVolumeHistory(indexerUrl, days, bucket),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!indexerUrl && days > 0,
  })

export type MultiMetricChartPoint = {
  timestamp: number
  tvl: number | null
  volumeBar: number | null
  volume: number | null
  hdx: number | null
}

type HdxPricePoint = {
  timestamp: number
  price: number
}

const ROUND_DIGITS = 10
const formatChartValue = (value: string) =>
  Number(Big(value).round(ROUND_DIGITS, Big.roundDown).toString())

const getOverviewChartRangeDays = (timeRange: OverviewChartTimeRange) => {
  switch (timeRange) {
    case "7D":
      return 7
    case "1M":
      return 30
    case "3M":
      return 90
    case "1Y":
    case "ALL":
      return 365
  }
}

const getOverviewChartVolumeBucket = (
  timeRange: OverviewChartTimeRange,
): PlatformVolumeHistoryBucket => {
  switch (timeRange) {
    case "7D":
      return {
        durationMs: 60 * 60 * 1000,
        period: "_1H_",
      }
    case "1M":
      return {
        durationMs: 12 * 60 * 60 * 1000,
        period: "_12H_",
      }
    case "3M":
    case "1Y":
    case "ALL":
      return {
        durationMs: 24 * 60 * 60 * 1000,
        period: "_24H_",
      }
  }
}

const getOverviewChartUtcBucketStart = (
  timestamp: number,
  durationMs: number,
) => Math.floor(timestamp / durationMs) * durationMs

const getHdxPointTimestamp = (
  timestamp: number,
  timeRange: OverviewChartTimeRange,
) => {
  switch (timeRange) {
    case "1Y":
    case "ALL":
      return getOverviewChartUtcBucketStart(timestamp, 24 * 60 * 60 * 1000)
    default:
      return timestamp
  }
}

const getHdxPriceRangeParams = (timeRange: OverviewChartTimeRange) => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  switch (timeRange) {
    case "7D":
      return {
        startTimestamp: String(now - 7 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["30M"],
      }
    case "1M":
      return {
        startTimestamp: String(now - 30 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["1H"],
      }
    case "3M":
      return {
        startTimestamp: String(now - 90 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["4H"],
      }
    case "1Y":
      return {
        startTimestamp: String(now - 365 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["1D"],
      }
    case "ALL":
      return {
        startTimestamp: undefined,
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["7D"],
      }
  }
}

const fetchHdxPriceChartData = async (
  queryClient: QueryClient,
  rpc: TProviderContext,
  squidClient: SquidSdk,
  displayAssetId: string,
  timeRange: OverviewChartTimeRange,
): Promise<HdxPricePoint[]> => {
  const rangeParams = getHdxPriceRangeParams(timeRange)
  const assetInId = displayAssetId
  const assetOutId = NATIVE_ASSET_ID

  const sortedAssets =
    Number(assetOutId) >= Number(assetInId)
      ? ([assetInId, assetOutId] as const)
      : ([assetOutId, assetInId] as const)

  const isAssetInFirst = sortedAssets[0] === assetInId

  const [tradePrices, spotPrice] = await Promise.all([
    queryClient.ensureQueryData(
      tradePricesQuery(
        squidClient,
        sortedAssets[0],
        sortedAssets[1],
        rangeParams.startTimestamp,
        rangeParams.endTimestamp,
        rangeParams.bucketSize,
      ),
    ),
    queryClient.ensureQueryData(
      spotPriceQuery(rpc, NATIVE_ASSET_ID, displayAssetId),
    ),
  ])

  const prices = tradePrices.assetPairPricesAndVolumesByPeriod.nodes
    .flatMap((node) => node?.buckets ?? [])
    .filter((bucket) => isValidBigSource(bucket.priceAvrgNorm))
    .map<HdxPricePoint>((bucket) => ({
      timestamp: getHdxPointTimestamp(Number(bucket.timestamp) || 0, timeRange),
      price: formatChartValue(
        isAssetInFirst
          ? Big(1).div(bucket.priceAvrgNorm).toString()
          : bucket.priceAvrgNorm,
      ),
    }))

  const hdxSpotPrice = spotPrice.spotPrice
  const currentPrice =
    hdxSpotPrice && isValidBigSource(hdxSpotPrice) && Big(hdxSpotPrice).gt(0)
      ? formatChartValue(hdxSpotPrice)
      : null

  return [
    ...prices,
    ...(currentPrice
      ? [
          {
            timestamp: getHdxPointTimestamp(Date.now(), timeRange),
            price: currentPrice,
          },
        ]
      : []),
  ].toSorted(
    sortBy({
      select: (point) => point.timestamp,
      compare: numerically,
    }),
  )
}

const generateMultiMetricData = (
  tvlHistory: StatsHistoryPoint[],
  volumeHistory: StatsHistoryPoint[],
  hdxPrices: HdxPricePoint[],
  volumeScale: number,
): MultiMetricChartPoint[] => {
  const points = new Map<number, MultiMetricChartPoint>()

  const getPoint = (timestamp: number) => {
    const existing = points.get(timestamp)
    if (existing) return existing

    const next = {
      timestamp,
      tvl: null,
      volumeBar: null,
      volume: null,
      hdx: null,
    }

    points.set(timestamp, next)
    return next
  }

  tvlHistory.forEach(({ timestamp, value }) => {
    getPoint(timestamp).tvl = value
  })

  volumeHistory.forEach(({ timestamp, value }) => {
    const point = getPoint(timestamp)
    point.volumeBar = value
    point.volume = value * volumeScale
  })

  hdxPrices.forEach(({ timestamp, price }) => {
    getPoint(timestamp).hdx = price
  })

  const sortedPoints = Array.from(points.values()).toSorted(
    sortBy({
      select: (point) => point.timestamp,
      compare: numerically,
    }),
  )

  let latestTvl: number | null = null

  return sortedPoints.map((point) => {
    const tvl = point.tvl ?? latestTvl
    latestTvl = tvl

    return {
      ...point,
      tvl,
    }
  })
}

export const multiMetricChartDataQuery = (
  queryClient: QueryClient,
  rpc: TProviderContext,
  squidClient: SquidSdk,
  indexerUrl: string,
  displayAssetId: string,
  timeRange: OverviewChartTimeRange,
) => {
  const rangeDays = getOverviewChartRangeDays(timeRange)
  const volumeBucket = getOverviewChartVolumeBucket(timeRange)
  const volumeScale = VOLUME_BAR_SCALE_BY_RANGE[timeRange]

  return queryOptions({
    queryKey: ["stats", "multiMetricChartData", timeRange],
    queryFn: async () => {
      const [tvlHistory, volumeHistory, hdxPrices] = await Promise.all([
        queryClient.ensureQueryData(
          defillamaHydrationTvlHistoryQuery(indexerUrl),
        ),
        queryClient.ensureQueryData(
          platformDailyVolumeHistoryQuery(indexerUrl, rangeDays, volumeBucket),
        ),
        fetchHdxPriceChartData(
          queryClient,
          rpc,
          squidClient,
          displayAssetId,
          timeRange,
        ),
      ])

      const chartData = generateMultiMetricData(
        tvlHistory,
        volumeHistory,
        hdxPrices,
        volumeScale,
      )

      if (timeRange === "ALL") return chartData

      const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000
      return chartData.filter((point) => point.timestamp >= cutoff)
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: rpc.isApiLoaded && !!displayAssetId,
  })
}

enum ProductType {
  Omnipool = "omnipool",
  MoneyMarket = "money-market",
  Hollar = "hollar",
}

enum StreamType {
  Asset = "asset",
  Protocol = "protocol",
  LiquidationPenalty = "liquidation_penalty",
  PeplLiquidationProfit = "pepl_liquidation_profit",
  AssetReserve = "asset_reserve",
  BorrowApr = "borrow_apr",
  HsmRevenue = "hsm_revenue",
}

enum FeeDestination {
  Protocol = "protocol",
  Total = "total",
}

const FEES_CHARTS_API_URL =
  "https://hydration-metrics-aggregator.indexer.hydration.cloud/api/v1/fees/charts"

const FEES_API_PARAMS = {
  omnipool: {
    protocol: {
      asset: {
        productType: ProductType.Omnipool,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.Asset,
      },
      protocol: {
        productType: ProductType.Omnipool,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.Protocol,
      },
    },
    total: {
      asset: {
        productType: ProductType.Omnipool,
        feeDestination: FeeDestination.Total,
        streamType: StreamType.Asset,
      },
      protocol: {
        productType: ProductType.Omnipool,
        feeDestination: FeeDestination.Total,
        streamType: StreamType.Protocol,
      },
    },
  },
  moneyMarket: {
    protocol: {
      liquidationPenalty: {
        productType: ProductType.MoneyMarket,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.LiquidationPenalty,
      },
      peplLiquidationProfit: {
        productType: ProductType.MoneyMarket,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.PeplLiquidationProfit,
      },
      assetReserve: {
        productType: ProductType.MoneyMarket,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.AssetReserve,
      },
    },
  },
  hollar: {
    protocol: {
      borrowApr: {
        productType: ProductType.Hollar,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.BorrowApr,
      },
      hsmRevenue: {
        productType: ProductType.Hollar,
        feeDestination: FeeDestination.Protocol,
        streamType: StreamType.HsmRevenue,
      },
    },
  },
} as const

export const TIME_RANGES = ["1W", "1M", "1Y", "ALL"] as const
export const VIEW_MODES = ["protocol", "total"] as const

export type TimeRange = (typeof TIME_RANGES)[number]
export type ViewMode = (typeof VIEW_MODES)[number]

enum BucketSize {
  TwentyFourHour = "24hour",
  SevenDay = "7day",
  ThirtyDay = "30day",
}
const LATEST_START_DATE = new Date("2025-02-17")
const getTimeRangeParams = (timeRange: TimeRange, endTime: Date) => {
  let start = new Date(endTime)
  let bucketSize: BucketSize = BucketSize.TwentyFourHour
  switch (timeRange) {
    case "1W":
      start.setDate(start.getDate() - 7)
      bucketSize = BucketSize.TwentyFourHour
      break
    case "1M":
      start.setMonth(start.getMonth() - 1)
      bucketSize = BucketSize.TwentyFourHour
      break
    case "1Y":
      start.setFullYear(start.getFullYear() - 1)
      bucketSize = BucketSize.SevenDay
      break
    case "ALL":
      start = LATEST_START_DATE
      bucketSize = BucketSize.ThirtyDay
      break
  }
  return { startDate: start, bucketSize }
}

type FeesChartsDataProps = {
  viewMode: ViewMode
  timeRange: TimeRange
}

const getFeesQueries = (viewMode: ViewMode) => {
  if (viewMode === "total") {
    return {
      asset: FEES_API_PARAMS.omnipool.total.asset,
      protocol: FEES_API_PARAMS.omnipool.total.protocol,
      ...FEES_API_PARAMS.moneyMarket.protocol,
      ...FEES_API_PARAMS.hollar.protocol,
    }
  } else {
    return {
      asset: FEES_API_PARAMS.omnipool.protocol.asset,
      protocol: FEES_API_PARAMS.omnipool.protocol.protocol,
      ...FEES_API_PARAMS.moneyMarket.protocol,
      ...FEES_API_PARAMS.hollar.protocol,
    }
  }
}

const chartDataSchema = z.object({
  data: z.array(z.object({ timestamp: z.string(), value: z.number() })),
  periodAggregate: z.number(),
})

const querySchema = z.object({
  asset: chartDataSchema,
  protocol: chartDataSchema,
  liquidationPenalty: chartDataSchema,
  peplLiquidationProfit: chartDataSchema,
  assetReserve: chartDataSchema,
  borrowApr: chartDataSchema,
  hsmRevenue: chartDataSchema,
})

export const useFeesChartsData = (props: FeesChartsDataProps) => {
  const { viewMode, timeRange } = props

  return useQuery({
    queryKey: ["feesChartsData", viewMode, timeRange],
    queryFn: async () => {
      const endDate = endOfDay(subDays(new Date(), 1))
      const endTime = endDate.toISOString()
      const { startDate, bucketSize } = getTimeRangeParams(timeRange, endDate)
      const startTime = startDate.toISOString()

      const queries = Object.entries(getFeesQueries(viewMode)).map(
        async ([key, value]) => {
          const url = `${FEES_CHARTS_API_URL}${createQueryString({
            ...value,
            startTime,
            endTime,
            bucketSize,
          })}`

          const res = await fetch(url)
          const json = await res.json()

          const parsed = chartDataSchema.parse(json)
          const data = {
            ...parsed,
            data: parsed.data.map(({ timestamp, value }) => ({
              timestamp,
              value: value < 0 ? 0 : value,
            })),
          }

          return { key, data }
        },
      )

      const results = await Promise.all(queries)

      const parsedQuery = querySchema.safeParse(
        Object.fromEntries(results.map(({ key, data }) => [key, data])),
      )

      if (!parsedQuery.success) {
        console.error(parsedQuery.error)
        throw new Error("Fees charts data validation failed", {
          cause: parsedQuery.error,
        })
      }

      return parsedQuery.data
    },
    retry: 3,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}
