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

  const intentPriceLines = useMemo(() => {
    return intentOrders
      .filter((o) => o.from.id === assetIn && o.to.id === assetOut)
      .flatMap((o) => {
        if (!o.fromAmountBudget || !o.toAmountExecuted) return []
        const toAmount = Big(o.toAmountExecuted)
        if (toAmount.eq(0)) return []
        return [Number(Big(o.fromAmountBudget).div(toAmount))]
      })
  }, [intentOrders, assetIn, assetOut])

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
      ? t("common:currency" as any, {
          value,
          symbol: getAssetWithFallback(assetIn).symbol,
        })
      : ""

  const chartDisplayValue =
    !isEmpty && !isError ? (
      <Box>
        <Box>
          {t("common:price" as any)}: {formattedAssetPrice}
        </Box>
        <Box visibility={volume > 0 ? "visible" : "hidden"}>
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
