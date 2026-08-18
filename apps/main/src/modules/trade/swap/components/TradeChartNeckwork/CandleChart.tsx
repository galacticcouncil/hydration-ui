import { PairCandle } from "@galacticcouncil/indexer/neckwork"
import { Box, ChartCrosshair } from "@galacticcouncil/ui/components"
import {
  dateFormatter,
  timeFormatter,
} from "@galacticcouncil/ui/components/Chart/utils"
import {
  crosshair,
  grid,
  layout,
  leftPriceScale,
  rightPriceScale,
  timeScale,
} from "@galacticcouncil/ui/components/TradingViewChart/config"
import {
  BaselineChartData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import {
  ThemeProps,
  useBreakpoints,
  useTheme,
  useUiScale,
} from "@galacticcouncil/ui/theme"
import { hexToRgba } from "@galacticcouncil/utils"
import {
  BaselineSeries,
  CandlestickData,
  CandlestickSeries,
  createChart,
  HistogramData,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineType,
  PriceFormat,
  SingleValueData,
} from "lightweight-charts"
import { useEffect, useRef, useState } from "react"

import { TradeChartType } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.utils"

/** Bars shown on first paint — the rest of the page is pan-ahead buffer. */
const VISIBLE_BARS = 60
/** Bars left of the viewport below which the next page is requested. */
const LOAD_MORE_THRESHOLD = 60

const toTime = (candle: PairCandle) => toUTCTimestamp(candle.time * 1000)

/** Crosshair payload for candlestick charts — open/high/low alongside the shared close/volume shape. */
type OhlcCrosshairData = BaselineChartData & {
  open?: number
  high?: number
  low?: number
}

const candlestickColors = (theme: ThemeProps) => {
  const upColor = theme.details.values.positive
  const downColor = theme.details.values.negative

  return { upColor, downColor, wickUpColor: upColor, wickDownColor: downColor }
}

const baselineColors = (theme: ThemeProps) => ({
  topLineColor: theme.details.chart,
  topFillColor1: hexToRgba(theme.details.chart, 0.5),
  topFillColor2: hexToRgba(theme.details.chart, 0),
})

const volumeColors = (theme: ThemeProps) => ({
  color: hexToRgba(theme.details.chart, 0.3),
})

const scrollOptions = (isMobile: boolean) =>
  isMobile
    ? {
        handleScroll: { horzTouchDrag: true, vertTouchDrag: false },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      }
    : {}

const tradeCrosshair = (theme: ThemeProps) => {
  const base = crosshair(theme)
  return {
    ...base,
    horzLine: {
      ...base.horzLine,
      labelVisible: true,
      labelBackgroundColor: theme.controls.dim.base,
    },
  }
}

const getPriceFormat = (
  candles: ReadonlyArray<PairCandle>,
): Partial<PriceFormat> | undefined => {
  const value = candles.at(-1)?.close

  if (!value || value <= 0 || !isFinite(value)) return

  if (value >= 100) return { precision: 2, minMove: 0.01 }

  const leadingZeros = Math.floor(Math.abs(Math.log10(value)))

  return {
    precision: leadingZeros + 4,
    minMove: Math.pow(10, -(leadingZeros + 4)),
  }
}

type Series = {
  candlestick: ISeriesApi<"Candlestick">
  baseline: ISeriesApi<"Baseline">
  volume: ISeriesApi<"Histogram">
}

type CandleChartProps = {
  readonly height: number
  readonly candles: ReadonlyArray<PairCandle>
  readonly liveCandle: PairCandle | null
  readonly type: TradeChartType
  readonly resetKey: string
  readonly isRefetching: boolean
  /** keepPreviousData — freeze series so resetKey/live don't paint stale candles */
  readonly isPlaceholderData: boolean
  readonly onCrosshairMove: (data: OhlcCrosshairData | null) => void
  readonly onReachStart: () => void
}

export const CandleChart: React.FC<CandleChartProps> = ({
  height,
  candles,
  liveCandle,
  type,
  resetKey,
  isRefetching,
  isPlaceholderData,
  onCrosshairMove,
  onReachStart,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const crosshairRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<Series | null>(null)
  const appliedRef = useRef<{ resetKey: string; firstTime: number | null }>({
    resetKey,
    firstTime: null,
  })

  const [crosshairTime, setCrosshairTime] = useState<number | null>(null)

  const { themeProps } = useTheme()
  const uiScale = useUiScale()
  const { isMobile } = useBreakpoints()

  const latestProps = useRef({ onCrosshairMove, onReachStart, type })
  const initialTheme = useRef({ themeProps, uiScale, isMobile })
  useEffect(() => {
    latestProps.current = { onCrosshairMove, onReachStart, type }
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
      const priceSeries =
        latestProps.current.type === "candles"
          ? series.candlestick
          : series.baseline
      const point = time && cursor ? param.seriesData.get(priceSeries) : null

      if (!time || !cursor || !point) {
        element.style.opacity = "0"
        setCrosshairTime(null)
        latestProps.current.onCrosshairMove(null)
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
      latestProps.current.onCrosshairMove({
        time,
        value: close ?? value ?? 0,
        open,
        high,
        low,
        volume: volumePoint?.value,
      })
    })

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range && range.from < LOAD_MORE_THRESHOLD)
        latestProps.current.onReachStart()
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

    series.candlestick.applyOptions({ visible: type === "candles" })
    series.baseline.applyOptions({ visible: type === "line" })
  }, [type])

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (isPlaceholderData || !chart || !series || !candles.length) return

    const scale = chart.timeScale()
    const visibleRange = scale.getVisibleLogicalRange()
    const applied = appliedRef.current

    const isReset = applied.resetKey !== resetKey
    // where the candle that used to be first now sits — i.e. how many candles
    // were prepended. -1 means it is gone, so the viewport can't be shifted.
    const previousFirstIndex =
      !isReset && applied.firstTime !== null
        ? candles.findIndex((candle) => candle.time === applied.firstTime)
        : -1

    const priceFormat = getPriceFormat(candles)
    const ohlc = candles.map((candle) => ({
      time: toTime(candle),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))
    const line = candles.map((candle) => ({
      time: toTime(candle),
      value: candle.close,
    }))
    const volumes = candles.map((candle) => ({
      time: toTime(candle),
      value: candle.volume,
    }))

    if (latestProps.current.type === "line") {
      series.baseline.setData(line)
      series.volume.setData(volumes)
      series.candlestick.setData(ohlc)
    } else {
      series.candlestick.setData(ohlc)
      series.volume.setData(volumes)
      series.baseline.setData(line)
    }

    series.candlestick.applyOptions({ priceFormat })
    series.baseline.applyOptions({ priceFormat })

    if (isReset || !visibleRange) {
      scale.setVisibleLogicalRange({
        from: Math.max(candles.length - VISIBLE_BARS, 0),
        to: candles.length,
      })
    } else if (previousFirstIndex > 0) {
      scale.setVisibleLogicalRange({
        from: visibleRange.from + previousFirstIndex,
        to: visibleRange.to + previousFirstIndex,
      })
    }

    appliedRef.current = { resetKey, firstTime: candles[0]?.time ?? null }
  }, [candles, resetKey, isPlaceholderData])

  useEffect(() => {
    const series = seriesRef.current
    if (!series || !liveCandle || isPlaceholderData) return

    const time = toTime(liveCandle)

    series.candlestick.update({
      time,
      open: liveCandle.open,
      high: liveCandle.high,
      low: liveCandle.low,
      close: liveCandle.close,
    })
    series.baseline.update({ time, value: liveCandle.close })
  }, [liveCandle, isPlaceholderData])

  return (
    <Box
      sx={{
        position: "relative",
        height,
        touchAction: isMobile ? "pan-y pinch-zoom" : undefined,
        opacity: isRefetching ? 0.4 : 1,
        transition: "opacity 150ms ease-in-out",
      }}
    >
      <div ref={containerRef} sx={{ height: "100%" }} />
      <div
        ref={crosshairRef}
        sx={{
          display: "block",
          position: "absolute",
          zIndex: 2,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {crosshairTime && (
          <ChartCrosshair
            date={dateFormatter.format(crosshairTime)}
            time={timeFormatter.format(crosshairTime)}
          />
        )}
      </div>
    </Box>
  )
}
