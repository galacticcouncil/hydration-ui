import { hexToRgba } from "@galacticcouncil/utils"
import {
  createChart,
  IChartApi,
  LineType,
  SeriesType,
} from "lightweight-charts"
import {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

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
  OhlcData,
  renderSeries,
  subscribeCrosshairMove,
} from "@/components/TradingViewChart/utils"
import { useUiScale } from "@/styles/media"
import { useTheme } from "@/theme"

export type TradingViewChartRef = {
  resetZoom: () => void
}

type ChartTypeProps =
  | {
      type: Extract<SeriesType, "Candlestick">
      onCrosshairMove?: (data: OhlcData | null) => void
    }
  | {
      type?: Extract<SeriesType, "Baseline">
      onCrosshairMove?: (data: BaselineChartData | null) => void
    }

export type TradingViewChartProps = ChartTypeProps & {
  ref?: RefObject<TradingViewChartRef | null>
  data: Array<OhlcData>
  height?: number
  hidePriceIndicator?: boolean
  priceLines?: Array<number>
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  ref,
  data,
  type = "Baseline",
  height = 400,
  hidePriceIndicator,
  onCrosshairMove,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const crosshairRef = useRef<HTMLDivElement | null>(null)
  const priceIndicatorRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useImperativeHandle(ref, () => ({
    resetZoom: () => {
      chartRef.current = null
    },
  }))

  const onCrosshairMoveRef = useRef(onCrosshairMove)
  useEffect(() => {
    onCrosshairMoveRef.current = onCrosshairMove
  }, [onCrosshairMove])

  const [crosshairData, setCrosshairData] =
    useState<CrosshairCallbackData>(null)

  const { themeProps } = useTheme()
  const uiScale = useUiScale()

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      height,
      layout: layout(themeProps, uiScale),
      rightPriceScale,
      leftPriceScale,
      grid,
      timeScale,
      crosshair: crosshair(themeProps),
    })

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

    chart.timeScale().fitContent()

    const previousVisibleRange = chartRef.current?.timeScale().getVisibleRange()

    if (previousVisibleRange) {
      chart.timeScale().setVisibleRange(previousVisibleRange)
    }

    chartRef.current = chart

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

    return () => {
      chart.remove()
    }
  }, [data, height, themeProps, type, hidePriceIndicator, uiScale])

  return (
    <Box sx={{ position: "relative" }}>
      <div ref={chartContainerRef} />
      <Crosshair ref={crosshairRef} {...crosshairData} />
      {!hidePriceIndicator && <PriceIndicator ref={priceIndicatorRef} />}
    </Box>
  )
}
