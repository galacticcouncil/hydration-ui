import { useQuery } from "@tanstack/react-query"
import z from "zod/v4"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

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
  "https://hydration-aggregator-dev.kril.hydration.cloud/api/v1/charts/fees"

const pT = (productType: ProductType) => `productType=${productType}`
const fD = (feeDestination: FeeDestination) =>
  `feeDestination=${feeDestination}`
const sT = (streamType: StreamType) => `streamType=${streamType}`

const FEES_API_PARAMS = {
  omnipool: {
    protocol: {
      asset: `${pT(ProductType.Omnipool)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.Asset)}`,
      protocol: `${pT(ProductType.Omnipool)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.Protocol)}`,
    },
    total: {
      asset: `${pT(ProductType.Omnipool)}&${fD(FeeDestination.Total)}&${sT(StreamType.Asset)}`,
      protocol: `${pT(ProductType.Omnipool)}&${fD(FeeDestination.Total)}&${sT(StreamType.Protocol)}`,
    },
  },
  moneyMarket: {
    protocol: {
      liquidationPenalty: `${pT(ProductType.MoneyMarket)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.LiquidationPenalty)}`,
      peplLiquidationProfit: `${pT(ProductType.MoneyMarket)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.PeplLiquidationProfit)}`,
      assetReserve: `${pT(ProductType.MoneyMarket)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.AssetReserve)}`,
    },
  },
  hollar: {
    protocol: {
      borrowApr: `${pT(ProductType.Hollar)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.BorrowApr)}`,
      hsmRevenue: `${pT(ProductType.Hollar)}&${fD(FeeDestination.Protocol)}&${sT(StreamType.HsmRevenue)}`,
    },
  },
} as const

export const TIME_RANGES = ["1W", "1M", "1Y", "ALL"] as const
export const VIEW_MODES = ["protocol"] as const

export type TimeRange = (typeof TIME_RANGES)[number]
export type ViewMode = (typeof VIEW_MODES)[number]

export enum BucketSize {
  OneHour = "1hour",
  SixHour = "6hour",
  TwentyFourHour = "24hour",
}

function getTimeRangeParams(
  timeRange: TimeRange,
  endTime: Date,
): { startDate: Date; bucketSize: BucketSize } {
  const start = new Date(endTime)
  let bucketSize: BucketSize = BucketSize.TwentyFourHour
  switch (timeRange) {
    case "1W":
      start.setDate(start.getDate() - 7)
      bucketSize = BucketSize.SixHour
      break
    case "1M":
      start.setMonth(start.getMonth() - 1)
      bucketSize = BucketSize.TwentyFourHour
      break
    case "1Y":
      start.setFullYear(start.getFullYear() - 1)
      bucketSize = BucketSize.TwentyFourHour
      break
    case "ALL":
      start.setFullYear(start.getFullYear() - 1) // TODO: add ALL range later
      bucketSize = BucketSize.TwentyFourHour
      break
  }
  return { startDate: start, bucketSize }
}

type FeesChartsDataProps = {
  viewMode: ViewMode
  timeRange: TimeRange
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

  const test = useQuery({
    queryKey: ["feesChartsData", viewMode, timeRange],
    queryFn: async () => {
      const endDate = new Date()
      const endTime = endDate.toISOString()
      const { startDate, bucketSize } = getTimeRangeParams(timeRange, endDate)
      const startTime = startDate.toISOString()

      const queries = Object.entries({
        ...FEES_API_PARAMS.omnipool[viewMode],
        ...FEES_API_PARAMS.moneyMarket[viewMode],
        ...FEES_API_PARAMS.hollar[viewMode],
      }).map(async ([key, value]) => {
        const url = `${FEES_CHARTS_API_URL}?${value}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&bucketSize=${encodeURIComponent(bucketSize)}`

        const res = await fetch(url)
        const json = await res.json()

        const data = chartDataSchema.parse(json)

        return { key, data }
      })

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

  return test
}
