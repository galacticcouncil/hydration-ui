import { timeFrameTypes } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import {
  ArrowLeftRight,
  CandlestickChart,
  LineChartIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonIcon,
  ChartValues,
  Flex,
  Icon,
  Paper,
  Separator,
  TradingViewChart,
  TradingViewChartRef,
} from "@galacticcouncil/ui/components"
import {
  BaselineChartData,
  OhlcData,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { getToken } from "@galacticcouncil/ui/utils"
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
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import {
  useXcSwapChartData,
  XcSwapChartTimeFrame,
} from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart.data"

type XcSwapChartType = "line" | "candles"

export type { XcSwapChartType }

const CHART_TYPE_OPTIONS: ReadonlyArray<{
  key: XcSwapChartType
  label: string
  icon: React.ComponentType
}> = [
  { key: "line", label: "Line", icon: LineChartIcon },
  { key: "candles", label: "Candles", icon: CandlestickChart },
]

const chartTimeFrameTypes = timeFrameTypes.filter((type) => type !== "minute")

const intervalOptions = ([...chartTimeFrameTypes, "all"] as const).map<
  ChartTimeRangeOptionType<XcSwapChartTimeFrame>
>((option) => ({
  key: option,
  label: i18n.t(`chart.timeFrame.${option}`),
}))

const hasOhlc = (
  point: OhlcData,
): point is OhlcData & Required<Pick<OhlcData, "open" | "high" | "low">> => {
  return (
    !!point.open &&
    point.open > 0 &&
    !!point.high &&
    point.high > 0 &&
    !!point.low &&
    point.low > 0
  )
}

const isOhlcData = (
  point: BaselineChartData | OhlcData | null,
): point is OhlcData & Required<Pick<OhlcData, "open" | "high" | "low">> => {
  return !!point && "close" in point && hasOhlc(point)
}

const invertChartPoint = (point: OhlcData): OhlcData => {
  const close = point.close > 0 ? 1 / point.close : 0

  if (!hasOhlc(point)) {
    return { ...point, close }
  }

  return {
    ...point,
    open: 1 / point.open,
    close,
    high: 1 / point.low,
    low: 1 / point.high,
  }
}

type XcSwapChartProps = {
  readonly height: number
  readonly chartType: XcSwapChartType
  readonly setChartType: (type: XcSwapChartType) => void
  // Hydration source asset (priced against USDT on the indexer).
  readonly sellAssetId: string
  readonly sellSymbol: string
  // Cross-chain destination on Kraken: "near" | "zec".
  readonly destPlatform: string
  readonly destSymbol: string
}

export const XcSwapChart: React.FC<XcSwapChartProps> = ({
  height,
  chartType,
  setChartType,
  sellAssetId,
  sellSymbol,
  destPlatform,
  destSymbol,
}) => {
  const { t } = useTranslation()

  const chartRef = useRef<TradingViewChartRef>(null)
  const [isInverted, setIsInverted] = useState(false)
  const [interval, setInterval] = useState<XcSwapChartTimeFrame>("week")
  const [crosshair, setCrosshair] = useState<
    BaselineChartData | OhlcData | null
  >(null)

  // close = sellAsset per buyAsset (X per Q), matching TradeChart's convention.
  const { prices, isLoading, isSuccess, isError } = useXcSwapChartData({
    sellAssetId,
    destPlatform,
    timeFrame: interval,
  })

  // Default close is X per Q ("1 buy = value sell", value in sell units, like
  // the on-chain chart); invert toggles to Q per X.
  const data = useMemo<OhlcData[]>(
    () => (isInverted ? prices.map(invertChartPoint) : prices),
    [prices, isInverted],
  )

  const hasCandleData = data.length > 0 && data.every(hasOhlc)
  const selectedChartType =
    chartType === "candles" && hasCandleData ? "candles" : "line"
  const isEmpty = isSuccess && !data.length

  // value is shown in `valueSymbol` and prices 1 `subjectSymbol`.
  // Default: "1 buyAsset (Q) = value sellAsset (X)" — matches on-chain.
  const valueSymbol = isInverted ? destSymbol : sellSymbol
  const subjectSymbol = isInverted ? sellSymbol : destSymbol

  const lastDataPoint = last(data)
  const crosshairValue =
    crosshair && "value" in crosshair ? crosshair.value : crosshair?.close
  const value = crosshairValue ?? lastDataPoint?.close ?? 0
  const candleCrosshair =
    selectedChartType === "candles" && isOhlcData(crosshair) ? crosshair : null
  const formattedCandleOhlc = candleCrosshair
    ? [
        `O: ${t("number", {
          value: candleCrosshair.open,
        })}`,
        `H: ${t("number", {
          value: candleCrosshair.high,
        })}`,
        `L: ${t("number", {
          value: candleCrosshair.low,
        })}`,
        `C: ${t("number", {
          value: candleCrosshair.close,
        })}`,
      ].join(" / ")
    : null

  // USD sub-line = USD value of 1 subject, always priced via the Hydration
  // sell asset (the foreign asset has no on-chain price):
  //   not inverted: value (sell-per-buy) × price(sell) = USD of 1 buy
  //   inverted:     1 × price(sell)                    = USD of 1 sell
  const usdValue = isInverted ? 1 : value
  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(sellAssetId, usdValue, {
      maximumFractionDigits: null,
    })

  // Render the value directly (no AnimatedValue tween): the value can jump
  // across orders of magnitude on asset switch, and the tween would
  // briefly show misleading intermediate numbers.
  const chartValue =
    !isEmpty && !isError
      ? t("currency", { value, symbol: valueSymbol })
      : undefined

  const chartDisplayValue =
    !isEmpty && !isError ? (
      <Box position="relative">
        <Box>
          {t("price")}: {formattedAssetPrice}
        </Box>
        {formattedCandleOhlc && (
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              whiteSpace: "nowrap",
            }}
          >
            {formattedCandleOhlc}
          </Box>
        )}
      </Box>
    ) : undefined

  return (
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={isLoading || isAssetPriceLoading}
        />
        <Flex align="center" gap="s" direction={["column", null, "row"]} wrap>
          <SChartInvertButton
            size="small"
            variant="tertiary"
            outline
            onClick={() => setIsInverted((prev) => !prev)}
          >
            <Icon component={ArrowLeftRight} size="m" />
            {subjectSymbol}/{valueSymbol}
          </SChartInvertButton>
          {(hasCandleData || chartType === "candles") && (
            <>
              <Separator
                orientation="vertical"
                mx="base"
                sx={{
                  height: "l",
                  mt: "xs",
                  display: ["none", null, null, null, "block"],
                }}
              />
              {CHART_TYPE_OPTIONS.map((opt) => (
                <ButtonIcon
                  key={opt.key}
                  size="small"
                  outline={selectedChartType !== opt.key}
                  onClick={() => setChartType(opt.key)}
                >
                  <Icon
                    component={opt.icon}
                    color={
                      chartType === opt.key
                        ? getToken("text.tint.quart")
                        : "onContainer"
                    }
                    size="m"
                  />
                </ButtonIcon>
              ))}
            </>
          )}
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
        {selectedChartType === "candles" ? (
          <TradingViewChart
            ref={chartRef}
            type="Candlestick"
            height={height}
            data={data}
            hidePriceIndicator
            onCrosshairMove={setCrosshair}
          />
        ) : (
          <TradingViewChart
            ref={chartRef}
            height={height}
            data={data}
            hidePriceIndicator
            onCrosshairMove={setCrosshair}
          />
        )}
      </ChartState>
    </Paper>
  )
}
