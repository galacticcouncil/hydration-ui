import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  Box,
  ChartValues,
  Flex,
  Paper,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import React, { useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { useIntentsData } from "@/modules/trade/orders/lib/useIntentsData"
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
  const { t } = useTranslation("trade")

  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const chartRef = useRef<TradingViewChartRef>(null)
  const [interval, setInterval] = useState<TradeChartTimeFrameType | "all">(
    "week",
  )
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: assetIn,
    assetOutId: assetOut,
    timeFrame: interval === "all" ? null : interval,
  })

  const { orders: intentOrders } = useIntentsData()

  // Compute visible chart price range so we can filter out far-off limit orders
  // that would otherwise blow up the Y-axis scale. We extend the data range by
  // a margin so orders just above/below the visible range still show as markers.
  const PRICE_RANGE_MARGIN = 0.25 // ±25% of [min, max]
  const priceRange = useMemo(() => {
    if (!prices.length) return null
    let min = Infinity
    let max = -Infinity
    for (const p of prices) {
      if (p.close < min) min = p.close
      if (p.close > max) max = p.close
    }
    if (!isFinite(min) || !isFinite(max) || min <= 0) return null
    const span = max - min
    // Guard: if all prices are equal, use a relative band around the value
    const pad = span > 0 ? span * PRICE_RANGE_MARGIN : max * PRICE_RANGE_MARGIN
    return { min: Math.max(0, min - pad), max: max + pad }
  }, [prices])

  const intentPriceLines = useMemo(() => {
    return intentOrders
      .filter((o) => o.from.id === assetIn && o.to.id === assetOut)
      .flatMap((o) => {
        if (!o.fromAmountBudget || !o.toAmountExecuted) return []
        const toAmount = Big(o.toAmountExecuted)
        if (toAmount.eq(0)) return []
        const price = Number(Big(o.fromAmountBudget).div(toAmount))
        // Skip orders outside the (padded) visible price range — prevents
        // far-out limit orders from distorting the chart scale.
        if (priceRange && (price < priceRange.min || price > priceRange.max)) {
          return []
        }
        return [price]
      })
  }, [intentOrders, assetIn, assetOut, priceRange])

  const isEmpty = isSuccess && !prices.length

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(assetIn, value, { maximumFractionDigits: null })

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)

  const { getAssetWithFallback } = useAssets()

  const chartValue =
    !isEmpty && !isError
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t("common:currency" as any, {
          value,
          symbol: getAssetWithFallback(assetIn).symbol,
        })
      : ""

  const chartDisplayValue =
    !isEmpty && !isError ? (
      <Box>
        <Box>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {t("common:price" as any)}: {formattedAssetPrice}
        </Box>
        <Box visibility={volume > 0 ? "visible" : "hidden"}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {t("common:vol" as any)}: {formattedVolumePrice}
        </Box>
      </Box>
    ) : undefined

  return (
    <Paper p="xl">
      <Flex align="center" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoading || isAssetPriceLoading || isVolumePriceLoading}
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
          priceLines={intentPriceLines.length ? intentPriceLines : undefined}
          priceLinesLabel={
            intentPriceLines.length ? t("limit.chart.label") : undefined
          }
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Paper>
  )
}
