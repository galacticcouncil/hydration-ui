import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ChartValues,
  Flex,
  Icon,
  Paper,
  Separator,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React, { useRef, useState } from "react"
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
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
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

  const chartRef = useRef<TradingViewChartRef>(null)
  const [isInverted, setIsInverted] = useState(false)
  const [interval, setInterval] = useState<TradeChartTimeFrameType | "all">(
    "week",
  )
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)

  const assetA = isInverted ? assetOut : assetIn
  const assetB = isInverted ? assetIn : assetOut

  const { prices, isLoading, isSuccess, isError } = useTradeChartData({
    assetInId: assetA,
    assetOutId: assetB,
    timeFrame: interval === "all" ? null : interval,
  })

  const isEmpty = isSuccess && !prices.length

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(assetA, value, { maximumFractionDigits: null })

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)

  const { getAssetWithFallback } = useAssets()

  const assetAMeta = getAssetWithFallback(assetA)
  const assetBMeta = getAssetWithFallback(assetB)

  const chartValue =
    !isEmpty && !isError
      ? t("currency", {
          value,
          symbol: assetAMeta.symbol,
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
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoading || isAssetPriceLoading || isVolumePriceLoading}
        />
        <Flex align="center" gap="s" direction={["column", null, "row"]} wrap>
          <SChartInvertButton
            size="small"
            variant="tertiary"
            outline
            onClick={() => setIsInverted((prev) => !prev)}
          >
            <Icon component={ArrowLeftRight} size="m" />
            {assetBMeta.symbol}/{assetAMeta.symbol}
          </SChartInvertButton>
          <Separator
            orientation="vertical"
            mx="base"
            sx={{
              height: "l",
              mt: "xs",
              display: ["none", null, null, null, "block"],
            }}
          />
          <ChartTimeRange
            sx={{ ml: "auto" }}
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
          onCrosshairMove={setCrosshair}
        />
      </ChartState>
    </Paper>
  )
}
