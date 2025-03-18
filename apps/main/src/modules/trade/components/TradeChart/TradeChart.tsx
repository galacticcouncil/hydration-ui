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
import React, { useMemo, useState } from "react"
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
  })

  const isEmpty = isSuccess && !data.length

  const lastDataPoint = useMemo(() => last(data), [data])
  const value = getCrosshairValue(crosshair) ?? lastDataPoint?.close

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice("0", value)

  return (
    <Paper p={20}>
      <ChartValues
        sx={{ opacity: isEmpty || isError ? 0 : 1 }}
        value={t("currency", { value: value, symbol: "HDX" })}
        displayValue={formattedAssetPrice}
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
  return new Promise<typeof DATA>((resolve) => {
    setTimeout(() => {
      resolve(DATA)
    }, 1000)
  })
}
