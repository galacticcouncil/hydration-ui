import { hexToRgba } from "@galacticcouncil/utils"
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts"
import { useCallback, useEffect, useRef, useState } from "react"

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
  CrosshairCallbackData,
  OhlcData,
  renderSeries,
  subscribeCrosshairMove,
} from "@/components/TradingViewChart/utils"
import { useTheme } from "@/theme"

export type TradingViewChartType = "Candlestick" | "Baseline"
export type TradingViewChartProps = {
  data: OhlcData[]
  type?: TradingViewChartType
  height?: number
  onCrosshairMove?: (data: CrosshairCallbackData) => void
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  type = "Baseline",
  height = 400,
  onCrosshairMove,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Baseline"> | null>(null)
  const crosshairRef = useRef<HTMLDivElement | null>(null)
  const priceIndicatorRef = useRef<HTMLDivElement | null>(null)

  const onCrosshairMoveRef = useRef(onCrosshairMove)

  const [crosshairData, setCrosshairData] =
    useState<CrosshairCallbackData>(null)

  const { themeProps } = useTheme()

  const render = useCallback(() => {
    if (!chartRef.current || !data) return

    const series = renderSeries(chartRef.current, type, data, {
      upColor: themeProps.details.values.positive,
      downColor: themeProps.details.values.negative,
      lineColor: themeProps.details.chart,
      volumeBarColor: hexToRgba(themeProps.details.chart, 0.3),
    })

    seriesRef.current = series
  }, [data, type, themeProps])

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: layout(themeProps),
      rightPriceScale,
      leftPriceScale,
      grid,
      timeScale,
      crosshair: crosshair(themeProps),
    })

    chartRef.current = chart
    render()

    if (
      seriesRef.current &&
      crosshairRef.current &&
      priceIndicatorRef.current
    ) {
      subscribeCrosshairMove(
        chart,
        seriesRef.current,
        chartContainerRef.current,
        crosshairRef.current,
        priceIndicatorRef.current,
        (data) => {
          setCrosshairData(data)
          onCrosshairMoveRef.current?.(data)
        },
      )
    }

    const handleResize = () => {
      chartRef.current?.applyOptions({
        width: chartContainerRef.current?.clientWidth,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [height, render, themeProps])

  return (
    <Box sx={{ position: "relative" }}>
      <div ref={chartContainerRef} />
      <Crosshair ref={crosshairRef} {...crosshairData} />
      <PriceIndicator ref={priceIndicatorRef} />
    </Box>
  )
}
