import {
  Box,
  ChartValues,
  Flex,
  Paper,
  TradingViewChart,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useSearch } from "@tanstack/react-router"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import { PeriodType, periodTypes } from "@/components/PeriodInput/PeriodInput"
import i18n from "@/i18n"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { useAssets } from "@/providers/assetsProvider"

const intervalOptions = (["all", ...periodTypes] as const).map<
  ChartTimeRangeOptionType<PeriodType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`period.${option}`),
}))

type TradeChartProps = {
  readonly height: number
}

export const TradeChart: React.FC<TradeChartProps> = ({ height }) => {
  const { t } = useTranslation()

  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const [interval, setInterval] = useState<PeriodType | "all">("all")
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: assetIn,
    assetOutId: assetOut,
    period: interval === "all" ? null : interval,
  })

  const isEmpty = isSuccess && !prices.length

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(assetIn, value)

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(assetIn, volume)

  const { getAssetWithFallback } = useAssets()

  const chartValue =
    !isEmpty && !isError
      ? t("currency", {
          value,
          symbol: getAssetWithFallback(assetIn).symbol,
        })
      : ""

  const chartDisplayValue =
    !isEmpty && !isError ? (
      <Box>
        <Box>
          {t("price")}: {formattedAssetPrice}
        </Box>
        <Box visibility={volume > 0 ? "visible" : "hidden"}>
          {t("vol")}: {formattedVolumePrice}
        </Box>
      </Box>
    ) : undefined

  return (
    <Paper p={20}>
      <Flex align="center" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoading || isAssetPriceLoading || isVolumePriceLoading}
        />
        <ChartTimeRange
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(option) => setInterval(option.key)}
        />
      </Flex>
      <ChartState
        sx={{ height }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <TradingViewChart
          height={height}
          data={prices}
          hidePriceIndicator
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Paper>
  )
}
