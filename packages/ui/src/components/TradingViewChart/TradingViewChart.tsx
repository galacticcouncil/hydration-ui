import { hexToRgba } from "@galacticcouncil/utils"
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineStyle,
  LineType,
  SeriesType,
} from "lightweight-charts"
import { useEffect, useRef, useState } from "react"
import { isNumber, last } from "remeda"

import { Box } from "@/components"
import { Crosshair } from "@/components/TradingViewChart/components/Crosshair"
import { PriceIndicator } from "@/components/TradingViewChart/components/PriceIndicator"
import {
  crosshair,
  grid,
  layout,
  leftPriceScale,
  rightPriceScale,
  timeScale,
} from "@/components/TradingViewChart/config"
import {
  BaselineChartData,
  CrosshairCallbackData,
  getMainSeriesData,
  getVolumeData,
  OhlcData,
  renderSeries,
  subscribeCrosshairMove,
  TradingViewChartSeries,
} from "@/components/TradingViewChart/utils"
import { useTheme } from "@/theme"

type ChartTypeProps =
  | {
      type: Extract<SeriesType, "Candlestick">
      onCrosshairMove?: (data: OhlcData | null) => void
    }
  | {
      type?: Extract<SeriesType, "Baseline">
      onCrosshairMove?: (data: BaselineChartData | null) => void
    }

export type PriceLine = { value: number; formatted: string }

export type PriceLines = {
  min: PriceLine
  max: PriceLine
  mid: PriceLine
}

export type TradingViewChartProps = ChartTypeProps & {
  data: Array<OhlcData>
  height?: number
  hidePriceIndicator?: boolean
  priceLines?: PriceLines
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  type = "Baseline",
  height = 400,
  hidePriceIndicator,
  onCrosshairMove,
  priceLines,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const crosshairRef = useRef<HTMLDivElement | null>(null)
  const priceIndicatorRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<TradingViewChartSeries | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const isInitialDataRef = useRef(true)

  const onCrosshairMoveRef = useRef(onCrosshairMove)
  useEffect(() => {
    onCrosshairMoveRef.current = onCrosshairMove
  }, [onCrosshairMove])

  const [crosshairData, setCrosshairData] =
    useState<CrosshairCallbackData>(null)

  const { themeProps } = useTheme()

  // Create chart and series (only on mount or when chart config changes)
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      height,
      layout: layout(themeProps),
      rightPriceScale,
      leftPriceScale,
      grid,
      timeScale,
      crosshair: crosshair(themeProps),
    })

    chartRef.current = chart

    const [series, volumeSeries] = renderSeries(
      chart,
      type,
      data,
      {
        upColor: themeProps.details.values.positive,
        downColor: themeProps.details.values.negative,
        lineColor: themeProps.details.chart,
        volumeBarColor: hexToRgba(themeProps.details.chart, 0.3),
      },
      {
        lineType: LineType.Curved,
      },
    )

    seriesRef.current = series
    volumeSeriesRef.current = volumeSeries ?? null

    if (priceLines) {
      series.createPriceLine({
        price: priceLines.min.value,
        color: themeProps.text.high,
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        axisLabelVisible: true,
        title: priceLines.min.formatted,
      })

      series.createPriceLine({
        price: priceLines.max.value,
        color: themeProps.text.high,
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        axisLabelVisible: true,
        title: priceLines.max.formatted,
      })

      series.createPriceLine({
        price: priceLines.mid.value,
        color: themeProps.text.high,
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        axisLabelVisible: true,
        title: priceLines.mid.formatted,
      })
    }

    chart.timeScale().fitContent()

    if (
      crosshairRef.current &&
      (hidePriceIndicator || !!priceIndicatorRef.current)
    ) {
      subscribeCrosshairMove(
        chart,
        [series, volumeSeries],
        chartContainerRef.current,
        crosshairRef.current,
        priceIndicatorRef.current,
        (data) => {
          setCrosshairData(data)
          onCrosshairMoveRef.current?.((data?.data ?? null) as never)
        },
      )
    }

    isInitialDataRef.current = false

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      volumeSeriesRef.current = null
      isInitialDataRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, themeProps, type, hidePriceIndicator])

  // Update data without recreating chart (preserves zoom and scroll position)
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    const volumeSeries = volumeSeriesRef.current

    // Skip if chart not initialized yet or this is the initial render
    if (!chart || !series || isInitialDataRef.current) return

    // Save current visible time range before updating data
    const visibleRange = chart.timeScale().getVisibleRange()

    // Update main series data
    const seriesData = getMainSeriesData(type, data)
    series.setData(seriesData)

    // Update volume series if it exists
    const sample = last(data)
    const hasVolume = isNumber(sample?.volume)
    if (volumeSeries && hasVolume) {
      const volumeData = getVolumeData(data)
      volumeSeries.setData(volumeData)
    }

    // Restore visible time range after data update
    if (visibleRange) {
      chart.timeScale().setVisibleRange(visibleRange)
    }
  }, [data, type])

  return (
    <Box sx={{ position: "relative" }}>
      <div ref={chartContainerRef} />
      <Crosshair ref={crosshairRef} {...crosshairData} />
      {!hidePriceIndicator && <PriceIndicator ref={priceIndicatorRef} />}
      {/* {seriesApi && priceLines.length > 0 && (
        <PriceMarkers priceLines={priceLines} seriesApi={seriesApi} />
      )} */}
    </Box>
  )
}
