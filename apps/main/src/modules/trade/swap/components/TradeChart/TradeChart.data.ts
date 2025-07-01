import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { tradePricesQuery } from "@/api/graphql/trade-prices"
import { useSquidClient } from "@/api/provider"
import { AssetsPairPriceTimeRange } from "@/codegen/__generated__/squid/graphql"
import { PeriodType } from "@/components/PeriodInput/PeriodInput"
import { PERIOD_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly period: PeriodType | null
}

export const useTradeChartData = ({ assetInId, assetOutId, period }: Args) => {
  const squidClient = useSquidClient()

  const { getAsset } = useAssets()
  const assetOut = getAsset(assetOutId)

  const [startTimestamp, endTimestamp] = useMemo(() => {
    const now = new Date()

    if (!period) {
      return ["1970-01-01T00:00:00.000Z", now.toISOString()]
    }

    const ms = PERIOD_MS[period]

    return [new Date(now.getTime() - ms).toISOString(), now.toISOString()]
  }, [period])

  const bucketSize = period
    ? bucketSizes[period]
    : AssetsPairPriceTimeRange["4H"]

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
    if (isLoading || !assetOut) {
      return []
    }

    return (
      data?.assetPairPricesAndVolumesByPeriod.nodes
        .filter((node) => node !== null)
        .map<OhlcData>((node) => ({
          time: toUTCTimestamp(new Date(node.timestamp).valueOf()),
          close: Number(scaleHuman(node.priceAvrgNorm, assetOut.decimals)),
        })) ?? []
    )
  }, [data, assetOut, isLoading])

  return {
    prices,
    isError,
    isLoading,
    isSuccess,
  }
}

const bucketSizes: Record<PeriodType, AssetsPairPriceTimeRange> = {
  hour: AssetsPairPriceTimeRange.All,
  day: AssetsPairPriceTimeRange.All,
  week: AssetsPairPriceTimeRange["1H"],
  month: AssetsPairPriceTimeRange["4H"],
}
