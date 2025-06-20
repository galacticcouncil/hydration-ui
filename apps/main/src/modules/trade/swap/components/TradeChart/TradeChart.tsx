import {
  ChartValues,
  Flex,
  Paper,
  TradingViewChart,
  type TradingViewChartProps,
} from "@galacticcouncil/ui/components"
import {
  CrosshairCallbackData,
  getCrosshairValue,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useSearch } from "@tanstack/react-router"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import i18n from "@/i18n"
import {
  TradeChartIntervalType,
  useTradeChartData,
} from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import {
  TradeChartInterval,
  TradeChartIntervalOptionType,
} from "@/modules/trade/swap/components/TradeChart/TradeChartInterval"
import { useAssets } from "@/providers/assetsProvider"

const intervalOptions = Object.values(TradeChartIntervalType).map<
  TradeChartIntervalOptionType<TradeChartIntervalType>
>((option) => ({
  key: option,
  label: i18n.t(`interval.${option}`),
}))

export type TradeChartProps = Omit<TradingViewChartProps, "data">

export const TradeChart: React.FC<TradeChartProps> = (props) => {
  const { t } = useTranslation()

  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const [interval, setInterval] = useState<TradeChartIntervalType>(
    TradeChartIntervalType.All,
  )
  const [crosshair, setCrosshair] = useState<CrosshairCallbackData>(null)

  const {
    isLoading,
    isSuccess,
    isError,
    data = [],
  } = useTradeChartData({
    assetIn,
    assetOut,
    interval,
  })

  const isEmpty = isSuccess && !data.length

  const lastDataPoint = last(data)
  const value = getCrosshairValue(crosshair) ?? lastDataPoint?.close ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(assetIn, value)

  const { getAssetWithFallback } = useAssets()

  const chartValue =
    !isEmpty && !isError
      ? t("currency", {
          value: value,
          symbol: getAssetWithFallback(assetIn).symbol,
        })
      : ""

  const chartDisplayValue = !isEmpty && !isError ? formattedAssetPrice : ""

  return (
    <Paper p={20}>
      <Flex align="center" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoading || isAssetPriceLoading}
        />
        <TradeChartInterval
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(option) => setInterval(option.key)}
        />
      </Flex>
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
