import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  AnimatedValue,
  Box,
  ChartValues,
  Flex,
  Icon,
  Paper,
  Separator,
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
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
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

  const assetA = isInverted ? assetOut : assetIn
  const assetB = isInverted ? assetIn : assetOut

  const {
    prices,
    isLoading: isChartLoading,
    isSuccess,
    isError,
  } = useTradeChartData({
    assetInId: assetA,
    assetOutId: assetB,
    timeFrame: interval === "all" ? null : interval,
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
    priceAssetId: assetA,
    isEmpty,
    isError,
    isLoading: isChartLoading,
  })

  const { getAssetWithFallback } = useAssets()

  const assetAMeta = getAssetWithFallback(assetA)
  const assetBMeta = getAssetWithFallback(assetB)

  const chartValue = shouldShowValues ? (
    <Text fs={["p3", "p1"]} fw={600}>
      <AnimatedValue
        value={value}
        format={(value) => t("currency", { value, symbol: assetAMeta.symbol })}
      />
    </Text>
  ) : undefined

  const chartDisplayValue = shouldShowValues ? (
    <Box>
      <Text fs="p5">
        {t("price")}: {formattedAssetPrice}
      </Text>
      <Text fs="p5" visibility={volume > 0 ? "visible" : "hidden"}>
        {t("vol")}: {formattedVolumePrice}
      </Text>
    </Box>
  ) : undefined

  return (
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={shouldShowValues && isLoadingValues}
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
      <Box sx={{ height }}>
        <ChartState
          sx={{ height }}
          isError={isError}
          isLoading={isChartLoading}
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
      </Box>
    </Paper>
  )
}
