import {
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
} from "@galacticcouncil/indexer/squid"
import { TIME_FRAME_MS } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { isValidBigSource } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { spotPriceQuery } from "@/api/spotPrice"
import { TradeChartTimeFrameType } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useRpcProvider } from "@/providers/rpcProvider"
import { numerically, sortBy } from "@/utils/sort"

type Args = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly timeFrame: TradeChartTimeFrameType | null
}

export const useTradeChartData = ({
  assetInId,
  assetOutId,
  timeFrame,
}: Args) => {
  const rpc = useRpcProvider()
  const squidClient = useSquidClient()

  // To prevent refetching on asset switch
  const isAssetInFirst = Number(assetOutId) >= Number(assetOutId)
  const sortedAssets = isAssetInFirst
    ? ([assetInId, assetOutId] as const)
    : ([assetOutId, assetInId] as const)

  const { data: spotPriceData, isLoading: isSpotPriceLoading } = useQuery(
    spotPriceQuery(rpc, assetInId, assetOutId),
  )

  const [startTimestamp, endTimestamp] = useMemo(() => {
    if (!timeFrame) {
      return []
    }

    const now = Date.now()
    const ms = TIME_FRAME_MS[timeFrame]

    return [(now - ms).toString(), now.toString()]
    // refetch chart data on spot price change to keep it consistent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame, spotPriceData])

  const bucketSize = timeFrame
    ? bucketSizes[timeFrame]
    : TimeSeriesBucketTimeRange["4H"]

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

  const prices = useMemo(() => {
    if (isLoading || !data || isSpotPriceLoading) {
      return []
    }

    const prices = data.assetPairPricesAndVolumesByPeriod.nodes
      .flatMap((node) => node?.buckets ?? [])
      .filter((bucket) => isValidBigSource(bucket.priceAvrgNorm))
      .map((bucket) => ({
        timestamp: Number(bucket.timestamp) || 0,
        amount: isAssetInFirst
          ? Big(1).div(bucket.priceAvrgNorm).toString()
          : bucket.priceAvrgNorm,
        volume: bucket.referenceAssetVolNorm,
      }))

    const currentPrice = Big(spotPriceData?.spotPrice || "0")

    const withCurrentPrice = currentPrice.gt(0)
      ? prices.concat([
          {
            timestamp: Date.now(),
            amount: Big(1).div(currentPrice).toString(),
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

  const pricePoints = prices.map((price) => price.close)
  const min = Math.min(...pricePoints)
  const max = Math.max(...pricePoints)
  const mid = (min + max) / 2

  return {
    prices,
    min,
    max,
    mid,
    isError,
    isLoading,
    isSuccess,
  }
}

const bucketSizes: Record<TradeChartTimeFrameType, TimeSeriesBucketTimeRange> =
  {
    hour: TimeSeriesBucketTimeRange["15S"],
    day: TimeSeriesBucketTimeRange["5M"],
    week: TimeSeriesBucketTimeRange["1H"],
    month: TimeSeriesBucketTimeRange["4H"],
  }
