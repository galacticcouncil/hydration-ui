import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { tradePricesQuery } from "@/api/graphql/trade-prices"
import { useSquidClient } from "@/api/provider"
import { TimeSeriesBucketTimeRange } from "@/codegen/__generated__/squid/graphql"
import { PeriodType } from "@/components/PeriodInput/PeriodInput"
import { PERIOD_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { numerically, sortBy } from "@/utils/sort"

type Args = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly period: PeriodType | null
}

export const useTradeChartData = ({ assetInId, assetOutId, period }: Args) => {
  const squidClient = useSquidClient()

  const [startTimestamp, endTimestamp] = useMemo(() => {
    if (!period) {
      return []
    }

    const now = Date.now()
    const ms = PERIOD_MS[period]

    return [(now - ms).toString(), now.toString()]
  }, [period])

  const bucketSize = period
    ? bucketSizes[period]
    : TimeSeriesBucketTimeRange["4H"]

  const { data, isError, isLoading, isSuccess } = useQuery(
    tradePricesQuery(
      squidClient,
      assetInId,
      assetOutId,
      startTimestamp,
      endTimestamp,
      bucketSize,
    ),
  )

  const prices = useMemo(() => {
    if (isLoading || !data) {
      return []
    }

    return data.assetPairPricesAndVolumesByPeriod.nodes
      .flatMap((node) => node?.buckets ?? [])
      .filter((bucket) => bucket.priceAvrgNorm !== "NaN")
      .map((bucket) => ({
        timestamp: Number(bucket.timestamp) || 0,
        amount: Big(1).div(bucket.priceAvrgNorm).toString(),
      }))
      .sort(
        sortBy({
          select: (bucket) => bucket.timestamp,
          compare: numerically,
        }),
      )
      .map<OhlcData>((bucket) => ({
        time: toUTCTimestamp(bucket.timestamp),
        close: Number(bucket.amount),
      }))
  }, [data, isLoading])

  return {
    prices,
    isError,
    isLoading,
    isSuccess,
  }
}

const bucketSizes: Record<PeriodType, TimeSeriesBucketTimeRange> = {
  hour: TimeSeriesBucketTimeRange["1M"],
  day: TimeSeriesBucketTimeRange["30M"],
  week: TimeSeriesBucketTimeRange["4H"],
  month: TimeSeriesBucketTimeRange["4H"],
}
