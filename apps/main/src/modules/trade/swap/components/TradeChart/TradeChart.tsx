import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  Box,
  ChartValues,
  Flex,
  Paper,
  TradingViewChart,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { useAssets } from "@/providers/assetsProvider"

const chartTimeFrameTypes = timeFrameTypes.filter((type) => type !== "minute")

export type TradeChartTimeFrameType = (typeof chartTimeFrameTypes)[number]

const intervalOptions = ([...chartTimeFrameTypes, "all"] as const).map<
  ChartTimeRangeOptionType<TradeChartTimeFrameType | "all">
>((option) => ({
  key: option,
  label: i18n.t(`chart.timeFrame.${option}`),
}))

type TradeChartProps = {
  readonly height: number
}

export const TradeChart: React.FC<TradeChartProps> = ({ height }) => {
  const { t } = useTranslation()

  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const [interval, setInterval] = useState<TradeChartTimeFrameType | "all">(
    "week",
  )
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const { prices, min, max, mid, isLoading, isSuccess, isError } =
    useTradeChartData({
      assetInId: assetIn,
      assetOutId: assetOut,
      timeFrame: interval === "all" ? null : interval,
    })

  const isEmpty = isSuccess && !prices.length

  const priceLines = useMemo(() => {
    if (
      isEmpty ||
      isError ||
      !isFinite(min) ||
      !isFinite(max) ||
      !isFinite(mid)
    ) {
      return []
    }

    return [max, mid, min]
  }, [isEmpty, isError, min, max, mid])

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(assetIn, value)

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)

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
          priceLines={priceLines}
        />
      </ChartState>
    </Paper>
  )
}
