import {
  ChartValues,
  Paper,
  TradingViewChart,
  type TradingViewChartProps,
} from "@galacticcouncil/ui/components"
import {
  CrosshairCallbackData,
  getCrosshairValue,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components"
import { ChartState } from "@/components/ChartState"
import { DATA } from "@/modules/trade/swap/_mock"

export type TradeChartProps = Omit<TradingViewChartProps, "data">

export const TradeChart: React.FC<TradeChartProps> = (props) => {
  const { t } = useTranslation()
  const [crosshair, setCrosshair] = useState<CrosshairCallbackData>(null)

  const {
    isLoading,
    isSuccess,
    isError,
    data = [],
  } = useQuery({
    // Fetch mock data until we have real data
    queryKey: ["trade-chart-mock"],
    queryFn: mockFetch,
    retry: 0,
  })

  const isEmpty = isSuccess && !data.length

  const lastDataPoint = last(data)
  const value = getCrosshairValue(crosshair) ?? lastDataPoint?.close ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice("0", value)

  const chartValue =
    !isEmpty && !isError ? t("currency", { value: value, symbol: "HDX" }) : ""

  const chartDisplayValue = !isEmpty && !isError ? formattedAssetPrice : ""

  return (
    <Paper p={20}>
      <ChartValues
        value={chartValue}
        displayValue={chartDisplayValue}
        isLoading={isLoading || isAssetPriceLoading}
      />
      <ChartState
        height={props.height}
        isSuccess={isSuccess}
        isError={isError}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <TradingViewChart
          {...props}
          data={data}
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Paper>
  )
}

async function mockFetch() {
  const shouldError = false
  return new Promise<typeof DATA>((resolve, reject) => {
    setTimeout(() => {
      if (shouldError) {
        reject(new Error("Failed to fetch data"))
      } else {
        resolve(DATA)
      }
    }, 1000)
  })
}
