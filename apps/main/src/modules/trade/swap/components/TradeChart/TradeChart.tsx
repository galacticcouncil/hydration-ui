import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  Box,
  ButtonIcon,
  ChartValues,
  Flex,
  Icon,
  Paper,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { ArrowUpDown } from "lucide-react"
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
  const [inverted, setInverted] = useState(false)

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: assetIn,
    assetOutId: assetOut,
    timeFrame: interval === "all" ? null : interval,
    inverted,
  })

  const { orders: intentOrders } = useIntentsData()

  const intentPriceLines = useMemo(() => {
    return intentOrders
      .filter((o) => o.from.id === assetIn && o.to.id === assetOut)
      .flatMap((o) => {
        if (!o.fromAmountBudget || !o.toAmountExecuted) return []
        const fromAmount = Big(o.fromAmountBudget)
        const toAmount = Big(o.toAmountExecuted)
        if (fromAmount.eq(0) || toAmount.eq(0)) return []
        const price = inverted
          ? Number(fromAmount.div(toAmount))
          : Number(toAmount.div(fromAmount))
        return [price]
      })
  }, [intentOrders, assetIn, assetOut, inverted])

  const isEmpty = isSuccess && !prices.length

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const { getAssetWithFallback } = useAssets()

  const chartAsset = inverted ? assetOut : assetIn

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(chartAsset, value, { maximumFractionDigits: null })

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)
  const chartValue =
    !isEmpty && !isError
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t("common:currency" as any, {
          value,
          symbol: getAssetWithFallback(chartAsset).symbol,
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
        <Flex align="center" gap="s">
          <ButtonIcon size="small" onClick={() => setInverted((prev) => !prev)}>
            <Icon component={ArrowUpDown} size="s" />
          </ButtonIcon>
          <ChartTimeRange
            options={intervalOptions}
            selectedOption={interval}
            onSelect={(option) => {
              setInterval(option.key)
              chartRef.current?.resetZoom()
            }}
          />
        </Flex>
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
