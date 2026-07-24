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

const STATS_SQUID_URL = "https://orca-prod-pool-01.orca.hydration.cloud/graphql"
const DEFILLAMA_HYDRATION_TVL_URL =
  "https://api.llama.fi/v2/historicalChainTvl/HydraDX"
const DEFILLAMA_HYDRATION_DEX_VOLUME_URL =
  "https://api.llama.fi/summary/dexs/hydration-dex?dataType=dailyVolume"

export type OmnipoolAssetTVL = {
  assetId: string
  tvlInRefAssetNorm: string | null
  freeBalance: string
  paraBlockHeight: number
}

export type XYKPool = {
  id: string
  assetAId: string
  assetBId: string
  assetABalance: string
  assetBBalance: string
  tvlInRefAssetNorm: string | null
}

export type StatsHistoryPoint = {
  timestamp: number
  value: number
}

export type PlatformVolumeHistoryBucket = {
  durationMs: number
  period: "_1H_" | "_12H_" | "_24H_"
}

const fetchStatsGraphQL = async <T>(
  query: string,
  variables?: Record<string, unknown>,
  url = STATS_SQUID_URL,
): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Stats API error: ${response.statusText}`)
  }

  const { data, errors } = await response.json()

  if (errors?.length) {
    throw new Error(`GraphQL error: ${errors[0].message}`)
  }

  return data
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

const fetchDefillamaHydrationTvlHistory = async (): Promise<
  StatsHistoryPoint[]
> => {
  const response = await fetch(DEFILLAMA_HYDRATION_TVL_URL)

  if (!response.ok) {
    throw new Error(`DeFiLlama TVL API error: ${response.statusText}`)
  }

  const parsed = defillamaTvlHistorySchema.parse(await response.json())

  return parsed.map(({ date, tvl }) => ({
    timestamp: date * 1000,
    value: tvl,
  }))
}

export const defillamaHydrationTvlHistoryQuery = () =>
  queryOptions({
    queryKey: ["stats", "defillamaHydrationTvlHistory"],
    queryFn: fetchDefillamaHydrationTvlHistory,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

const fetchDefillamaHydrationDexVolumeHistory = async (): Promise<
  StatsHistoryPoint[]
> => {
  const response = await fetch(DEFILLAMA_HYDRATION_DEX_VOLUME_URL)

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

const VOLUME_QUERY_CHUNK_SIZE = 30

const buildPlatformVolumeHistoryQuery = (
  ranges: Array<{ start: number; end: number }>,
  bucket: PlatformVolumeHistoryBucket,
) => {
  const fields = ranges
    .map(
      ({ start, end }, index) => `
        d${index}: platformTotalVolumesByPeriod(
          filter: {
            startIsoString: "${new Date(start).toISOString()}"
            endIsoString: "${new Date(end).toISOString()}"
            period: ${bucket.period}
          }
        ) {
          nodes {
            totalVolNorm
          }
        }
      `,
    )
    .join("\n")

  return `query PlatformDailyVolumeHistory { ${fields} }`
}

type PlatformDailyVolumeResponse = Record<
  string,
  { nodes: Array<{ totalVolNorm: string } | null> }
>

const fetchPlatformDailyVolumeHistory = async (
  squidUrl: string,
  days: number,
  bucket: PlatformVolumeHistoryBucket,
): Promise<StatsHistoryPoint[]> => {
  const ranges = getCompletedUtcRanges(days, bucket.durationMs)
  const fetchFromUrl = (url: string) =>
    Promise.all(
      Array.from(
        { length: Math.ceil(ranges.length / VOLUME_QUERY_CHUNK_SIZE) },
        (_, chunkIndex) => {
          const chunkStart = chunkIndex * VOLUME_QUERY_CHUNK_SIZE
          const chunkRanges = ranges.slice(
            chunkStart,
            chunkStart + VOLUME_QUERY_CHUNK_SIZE,
          )
          const query = buildPlatformVolumeHistoryQuery(chunkRanges, bucket)

          return fetchStatsGraphQL<PlatformDailyVolumeResponse>(
            query,
            undefined,
            url,
          ).then((data) =>
            chunkRanges.map(({ start }, index) => ({
              timestamp: start,
              value: Number(
                data[`d${index}`]?.nodes.find(Boolean)?.totalVolNorm ?? 0,
              ),
            })),
          )
        },
      ),
    ).then((chunks) => chunks.flat())

  try {
    const data =
      squidUrl === STATS_SQUID_URL
        ? await fetchFromUrl(squidUrl)
        : await fetchFromUrl(squidUrl).catch(() =>
            fetchFromUrl(STATS_SQUID_URL),
          )

    if (data.some((point) => point.value > 0)) return data
  } catch {
    // Fall back below. DeFiLlama's DEX volume mirrors Hydration daily volume
    // closely enough for the temporary stats overview chart.
  }

  const fallback = await fetchDefillamaHydrationDexVolumeHistory()
  const minTimestamp = ranges[0]?.start ?? 0

  return fallback.filter((point) => point.timestamp >= minTimestamp)
}

export const platformDailyVolumeHistoryQuery = (
  squidUrl: string,
  days: number,
  bucket: PlatformVolumeHistoryBucket,
) =>
  queryOptions({
    queryKey: ["stats", "platformDailyVolumeHistory", squidUrl, days, bucket],
    queryFn: () => fetchPlatformDailyVolumeHistory(squidUrl, days, bucket),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!squidUrl && days > 0,
  })

export type MultiMetricChartPoint = {
  timestamp: number
  tvl: number | null
  volumeBar: number | null
  volumeBarScaled: number | null
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

const distributeVolumeBars = (
  points: MultiMetricChartPoint[],
  volumeScale: number,
) => {
  const volumeIndexes = points.reduce<number[]>((acc, point, index) => {
    if (point.volumeBar !== null) acc.push(index)
    return acc
  }, [])

  if (!volumeIndexes.length) return points

  const nextPoints: MultiMetricChartPoint[] = points.map((point) => ({
    ...point,
    volumeBar: null,
    volumeBarScaled: null,
  }))

  volumeIndexes.forEach((volumeIndex, index) => {
    const volume = points[volumeIndex]?.volumeBar ?? null
    if (volume === null) return

    const nextVolumeIndex = volumeIndexes[index + 1] ?? points.length
    const bucketPointCount = Math.max(nextVolumeIndex - volumeIndex, 1)
    const barValue = volume / bucketPointCount

    for (let i = volumeIndex; i < nextVolumeIndex; i++) {
      const point = nextPoints[i]
      if (point) {
        point.volumeBar = barValue
        point.volumeBarScaled = barValue * volumeScale
      }
    }
  })

  return nextPoints
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
      volumeBarScaled: null,
      hdx: null,
    }

    points.set(timestamp, next)
    return next
  }

  tvlHistory.forEach(({ timestamp, value }) => {
    getPoint(timestamp).tvl = value
  })

  volumeHistory.forEach(({ timestamp, value }) => {
    getPoint(timestamp).volumeBar = value
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

  const filledPoints = sortedPoints.map((point) => {
    latestTvl = point.tvl ?? latestTvl

    return {
      ...point,
      tvl: point.tvl ?? latestTvl,
    }
  })

  return distributeVolumeBars(filledPoints, volumeScale)
}

export const multiMetricChartDataQuery = (
  queryClient: QueryClient,
  rpc: TProviderContext,
  squidClient: SquidSdk,
  squidUrl: string,
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
        queryClient.ensureQueryData(defillamaHydrationTvlHistoryQuery()),
        queryClient.ensureQueryData(
          platformDailyVolumeHistoryQuery(squidUrl, rangeDays, volumeBucket),
        ),
        displayAssetId
          ? fetchHdxPriceChartData(
              queryClient,
              rpc,
              squidClient,
              displayAssetId,
              timeRange,
            )
          : Promise.resolve([]),
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
    enabled: !!squidUrl && rpc.isApiLoaded,
  })
}

const OMNIPOOL_TVL_QUERY = `
  query OmnipoolTVL($first: Int!) {
    omnipoolAssetHistoricalData(first: $first, orderBy: PARA_BLOCK_HEIGHT_DESC) {
      nodes {
        assetId
        tvlInRefAssetNorm
        freeBalance
        paraBlockHeight
      }
    }
  }
`

const fetchOmnipoolTVL = async (limit = 100): Promise<OmnipoolAssetTVL[]> => {
  const data = await fetchStatsGraphQL<{
    omnipoolAssetHistoricalData: { nodes: OmnipoolAssetTVL[] }
  }>(OMNIPOOL_TVL_QUERY, { first: limit })

  return data.omnipoolAssetHistoricalData.nodes
}

export const omnipoolTVLQuery = (limit = 100) =>
  queryOptions({
    queryKey: ["stats", "omnipoolTVL", limit],
    queryFn: () => fetchOmnipoolTVL(limit),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

export const useOmnipoolTVL = (limit = 100) => {
  return useQuery(omnipoolTVLQuery(limit))
}

const XYK_POOLS_QUERY = `
  query XYKPools($first: Int!) {
    xykpools(first: $first) {
      nodes {
        id
        assetAId
        assetBId
        assetABalance
        assetBBalance
        tvlInRefAssetNorm
      }
    }
  }
`

const fetchXYKPools = async (limit = 50): Promise<XYKPool[]> => {
  const data = await fetchStatsGraphQL<{
    xykpools: { nodes: XYKPool[] }
  }>(XYK_POOLS_QUERY, { first: limit })

  return data.xykpools.nodes
}

export const xykPoolsQuery = (limit = 50) =>
  queryOptions({
    queryKey: ["stats", "xykPools", limit],
    queryFn: () => fetchXYKPools(limit),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

export const useXYKPools = (limit = 50) => {
  return useQuery(xykPoolsQuery(limit))
}

export const calculateTotalTVL = (assets: OmnipoolAssetTVL[]): number => {
  const latestByAsset = new Map<string, OmnipoolAssetTVL>()

  for (const asset of assets) {
    const existing = latestByAsset.get(asset.assetId)
    if (!existing || asset.paraBlockHeight > existing.paraBlockHeight) {
      latestByAsset.set(asset.assetId, asset)
    }
  }

  return Array.from(latestByAsset.values()).reduce((sum, asset) => {
    const tvl = parseFloat(asset.tvlInRefAssetNorm || "0")
    return sum + tvl
  }, 0)
}

//TODO: REMOVE THIS SHIT
export const formatUSD = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
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
  LP = "lp",
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

export enum BucketSize {
  OneHour = "1hour",
  SixHour = "6hour",
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
