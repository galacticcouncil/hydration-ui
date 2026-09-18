import {
  grid,
  layout,
  leftPriceScale,
  rightPriceScale,
  timeScale,
} from "@galacticcouncil/ui/components/TradingViewChart/config"
import { useBreakpoints, useTheme, useUiScale } from "@galacticcouncil/ui/theme"
import {
  BaselineSeries,
  CandlestickData,
  CandlestickSeries,
  createChart,
  HistogramData,
  HistogramSeries,
  IChartApi,
  LineType,
  SingleValueData,
} from "lightweight-charts"
import { RefObject, useEffect, useRef, useState } from "react"

import {
  baselineColors,
  CandleChartLatest,
  CandleSeries,
  candlestickColors,
  LOAD_MORE_THRESHOLD,
  priceSeriesOf,
  scrollOptions,
  tradeCrosshair,
  volumeColors,
} from "@/modules/trade/swap/components/TradeChart/CandleChart.utils"

export type CandleChartInstance = {
  /** The element the chart mounts into. */
  readonly containerRef: RefObject<HTMLDivElement | null>
  /** The floating crosshair tooltip, positioned imperatively on hover. */
  readonly crosshairRef: RefObject<HTMLDivElement | null>
  readonly chartRef: RefObject<IChartApi | null>
  readonly seriesRef: RefObject<CandleSeries | null>
  readonly latestRef: RefObject<CandleChartLatest>
  /** Hovered candle's time in ms, or `null` when the cursor is off the chart. */
  readonly crosshairTime: number | null
}

/**
 * The chart itself: one lightweight-charts instance and its three series,
 * created on mount and destroyed on unmount, with the theme and the visible
 * series kept in sync.
 *
 * Everything else that draws on the chart takes the refs this returns, because
 * the instance must outlive any single render and cannot be recreated when a
 * prop changes without throwing away the viewport.
 */
export const useCandleChart = (
  latest: CandleChartLatest,
): CandleChartInstance => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const crosshairRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<CandleSeries | null>(null)

  const [crosshairTime, setCrosshairTime] = useState<number | null>(null)

  const { themeProps } = useTheme()
  const uiScale = useUiScale()
  const { isMobile } = useBreakpoints()

  const latestRef = useRef(latest)
  const initialTheme = useRef({ themeProps, uiScale, isMobile })
  useEffect(() => {
    latestRef.current = latest
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const {
      themeProps: theme,
      uiScale: scale,
      isMobile: mobile,
    } = initialTheme.current

    const chart = createChart(container, {
      autoSize: true,
      layout: layout(theme, scale),
      rightPriceScale,
      leftPriceScale,
      grid,
      timeScale: { ...timeScale, fixLeftEdge: false, fixRightEdge: true },
      crosshair: tradeCrosshair(theme),
      ...scrollOptions(mobile),
    })

    const candlestick = chart.addSeries(CandlestickSeries, {
      ...candlestickColors(theme),
      borderVisible: false,
      priceLineVisible: false,
    })

    const baseline = chart.addSeries(BaselineSeries, {
      ...baselineColors(theme),
      lineWidth: 2,
      lineType: LineType.Curved,
      priceLineVisible: false,
      visible: false,
    })

    const volume = chart.addSeries(HistogramSeries, {
      ...volumeColors(theme),
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: { type: "volume" },
      priceScaleId: "",
    })
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    chart.subscribeCrosshairMove((param) => {
      const series = seriesRef.current
      const element = crosshairRef.current
      if (!series || !element) return

      const { time, point: cursor } = param
      const priceSeries = priceSeriesOf(series, latestRef.current.type)
      const point = time && cursor ? param.seriesData.get(priceSeries) : null

      if (!time || !cursor || !point) {
        element.style.opacity = "0"
        setCrosshairTime(null)
        latestRef.current.onCrosshairMove(null)
        return
      }

      const { close, value, open, high, low } = point as CandlestickData &
        SingleValueData
      const volumePoint = param.seriesData.get(series.volume) as
        | HistogramData
        | undefined

      const chartWidth = container.getBoundingClientRect().width
      const tooltipWidth = element.offsetWidth
      let left = cursor.x - tooltipWidth / 2
      if (left < 10) left = cursor.x + 10
      else if (left + tooltipWidth > chartWidth - 10)
        left = cursor.x - tooltipWidth - 10

      element.style.top = "10px"
      element.style.left = `${left}px`
      element.style.opacity = "1"

      setCrosshairTime(Number(time) * 1000)
      latestRef.current.onCrosshairMove({
        time,
        value: close ?? value ?? 0,
        open,
        high,
        low,
        volume: volumePoint?.value ?? 0,
      })
    })

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range && range.from < LOAD_MORE_THRESHOLD)
        latestRef.current.onReachStart()
    })

    chartRef.current = chart
    seriesRef.current = { candlestick, baseline, volume }

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    chart.applyOptions({
      layout: layout(themeProps, uiScale),
      crosshair: tradeCrosshair(themeProps),
      ...scrollOptions(isMobile),
    })
    series.candlestick.applyOptions(candlestickColors(themeProps))
    series.baseline.applyOptions(baselineColors(themeProps))
    series.volume.applyOptions(volumeColors(themeProps))
  }, [themeProps, uiScale, isMobile])

  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    series.candlestick.applyOptions({ visible: latest.type === "candles" })
    series.baseline.applyOptions({ visible: latest.type === "line" })
  }, [latest.type])

  return {
    containerRef,
    crosshairRef,
    chartRef,
    seriesRef,
    latestRef,
    crosshairTime,
  }
}
