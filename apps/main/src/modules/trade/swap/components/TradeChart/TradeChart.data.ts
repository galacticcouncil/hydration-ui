import {
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
} from "@galacticcouncil/indexer/squid"
import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { spotPriceQuery } from "@/api/spotPrice"
import { PeriodType } from "@/components/PeriodInput/PeriodInput"
import { PERIOD_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { numerically, sortBy } from "@/utils/sort"

type Args = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly period: PeriodType | null
}

export const useTradeChartData = ({ assetInId, assetOutId, period }: Args) => {
  const rpc = useRpcProvider()
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

  // To prevent refetching on asset switch
  const isAssetInFirst = Number(assetOutId) >= Number(assetOutId)
  const sortedAssets = isAssetInFirst
    ? ([assetInId, assetOutId] as const)
    : ([assetOutId, assetInId] as const)

  const { data, isError, isLoading, isSuccess } = useQuery(
    tradePricesQuery(
      squidClient,
      sortedAssets[0],
      sortedAssets[1],
      startTimestamp,
      endTimestamp,
      bucketSize,
    ),
  )

  const { data: spotPriceData, isLoading: isSpotPriceLoading } = useQuery(
    spotPriceQuery(rpc, sortedAssets[1], sortedAssets[0]),
  )

  const prices = useMemo(() => {
    if (isLoading || !data || isSpotPriceLoading) {
      return []
    }

    const currentPrice = spotPriceData?.spotPrice

    const prices = data.assetPairPricesAndVolumesByPeriod.nodes
      .flatMap((node) => node?.buckets ?? [])
      .filter((bucket) => bucket.priceAvrgNorm !== "NaN")
      .map((bucket) => ({
        timestamp: Number(bucket.timestamp) || 0,
        amount: isAssetInFirst
          ? Big(1).div(bucket.priceAvrgNorm).toString()
          : bucket.priceAvrgNorm,
        volume: bucket.referenceAssetVolNorm,
      }))

    const withCurrentPrice = currentPrice
      ? prices.concat([
          {
            timestamp: Date.now(),
            amount: currentPrice,
            volume: "0",
          },
        ])
      : prices

    return withCurrentPrice
      .sort(
        sortBy({
          select: (bucket) => bucket.timestamp,
          compare: numerically,
        }),
      )
      .map<OhlcData>((bucket) => ({
        time: toUTCTimestamp(bucket.timestamp),
        close: Number(bucket.amount),
        volume: Number(bucket.volume),
      }))
  }, [data, isLoading, isAssetInFirst, isSpotPriceLoading, spotPriceData])

  return {
    prices,
    isError,
    isLoading,
    isSuccess,
  }
}

const bucketSizes: Record<PeriodType, TimeSeriesBucketTimeRange> = {
  hour: TimeSeriesBucketTimeRange["15S"],
  day: TimeSeriesBucketTimeRange["5M"],
  week: TimeSeriesBucketTimeRange["1H"],
  month: TimeSeriesBucketTimeRange["4H"],
}
