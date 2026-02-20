import { createQueryString } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { endOfDay, subDays } from "date-fns"
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
  LP = "lp",
}

const FEES_CHARTS_API_URL =
  "https://hydration-aggregator-staging-v2.orca.hydration.cloud/api/v1/fees/charts"

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
