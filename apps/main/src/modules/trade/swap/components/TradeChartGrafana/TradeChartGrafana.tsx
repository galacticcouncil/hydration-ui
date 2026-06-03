import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  AnimatedValue,
  Box,
  ChartValues,
  Flex,
  Paper,
  Text,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { TradeChartTimeFrameType } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useTradeChartGrafanaData } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana.data"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useAssets } from "@/providers/assetsProvider"

const chartTimeFrameTypes = timeFrameTypes.filter((type) => type !== "minute")

const intervalOptions = ([...chartTimeFrameTypes, "all"] as const).map<
  ChartTimeRangeOptionType<TradeChartTimeFrameType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`chart.timeFrame.${option}`),
}))

type TradeChartGrafanaProps = {
  readonly height: number
}

export const TradeChartGrafana: React.FC<TradeChartGrafanaProps> = ({
  height,
}) => {
  const { t } = useTranslation()
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const chartRef = useRef<TradingViewChartRef>(null)
  const [interval, setInterval] = useState<TradeChartTimeFrameType | "all">(
    "week",
  )

  const { prices, isLoading, isSuccess, isError } = useTradeChartGrafanaData({
    assetInId: assetIn,
    assetOutId: assetOut,
    timeFrame: interval,
  })

  const isEmpty = isSuccess && !prices.length

  const {
    onCrosshairMove,
    value,
    volume,
    formattedAssetPrice,
    formattedVolumePrice,
    shouldShowValues,
    isLoadingValues,
  } = useTradeChartValues({
    prices,
    priceAssetId: assetIn,
    isEmpty,
    isError,
    isLoading,
  })

  const { getAssetWithFallback } = useAssets()
  const assetInMeta = getAssetWithFallback(assetIn)

  const chartValue = shouldShowValues ? (
    <Text>
      <AnimatedValue
        value={value}
        format={(value) => t("currency", { value, symbol: assetInMeta.symbol })}
      />
    </Text>
  ) : undefined

  const chartDisplayValue = shouldShowValues ? (
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
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoadingValues}
        />
        <ChartTimeRange
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(option) => {
            setInterval(option.key)
            chartRef.current?.resetZoom()
          }}
        />
      </Flex>
      <ChartState
        sx={{ height }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <TradingViewChart
          ref={chartRef}
          height={height}
          data={prices}
          hidePriceIndicator
          onCrosshairMove={onCrosshairMove}
        />
      </ChartState>
    </Paper>
  )
}
