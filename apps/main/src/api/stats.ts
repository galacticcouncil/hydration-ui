import { createQueryString } from "@galacticcouncil/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { endOfDay, subDays } from "date-fns"
import z from "zod/v4"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

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
