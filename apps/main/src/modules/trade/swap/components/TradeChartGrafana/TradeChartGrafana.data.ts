import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { tradeChartQuery } from "@/api/grafana/tradeChart"
import { TIME_FRAME_MS } from "@/components/TimeFrame/TimeFrame.utils"
import { TradeChartTimeFrameType } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useAssets } from "@/providers/assetsProvider"

type TradeChartGrafanaTimeFrameType = TradeChartTimeFrameType | "all"

type TradeChartGrafanaDataArgs = {
  assetInId: string
  assetOutId: string
  timeFrame: TradeChartGrafanaTimeFrameType
}

// Earliest start used for the "all" range
const INIT_DATE = "2023-01-06T13:00:00.000Z"

const CHART_INTERVALS: Record<TradeChartGrafanaTimeFrameType, string> = {
  hour: "1m",
  day: "10m",
  week: "1h",
  month: "3h",
  all: "24h",
}

export const useTradeChartGrafanaData = ({
  assetInId,
  assetOutId,
  timeFrame,
}: TradeChartGrafanaDataArgs) => {
  const { getAssetWithFallback } = useAssets()

  const isAssetInFirst = Number(assetOutId) >= Number(assetInId)
  const sortedAssetIds = isAssetInFirst
    ? ([assetInId, assetOutId] as const)
    : ([assetOutId, assetInId] as const)

  const assetIn = getAssetWithFallback(sortedAssetIds[0])
  const assetOut = getAssetWithFallback(sortedAssetIds[1])

  const [from, to] = useMemo(() => {
    const now = Date.now()
    const fromDate =
      timeFrame === "all"
        ? INIT_DATE
        : new Date(now - TIME_FRAME_MS[timeFrame]).toISOString()

    return [fromDate, new Date(now).toISOString()]
  }, [timeFrame])

  const { data, isError, isLoading, isSuccess } = useQuery(
    tradeChartQuery({
      assetInId: assetIn.id,
      assetInSymbol: assetIn.symbol,
      assetInDecimals: assetIn.decimals,
      assetOutId: assetOut.id,
      assetOutSymbol: assetOut.symbol,
      assetOutDecimals: assetOut.decimals,
      from,
      to,
      interval: CHART_INTERVALS[timeFrame],
    }),
  )

  const prices = useMemo(() => {
    if (isLoading || !data) {
      return []
    }

    if (isAssetInFirst) {
      return data
    }

    return data.map((point) => ({
      ...point,
      close: Big(1).div(point.close).toNumber(),
    }))
  }, [data, isAssetInFirst, isLoading])

  return {
    prices,
    isError,
    isLoading,
    isSuccess,
  }
}
