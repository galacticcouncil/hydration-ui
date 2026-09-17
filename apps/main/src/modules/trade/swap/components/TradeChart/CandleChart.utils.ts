import { PairCandle } from "@galacticcouncil/indexer/neckwork"
import { crosshair } from "@galacticcouncil/ui/components/TradingViewChart/config"
import {
  BaselineChartData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { ThemeProps } from "@galacticcouncil/ui/theme"
import { hexToRgba } from "@galacticcouncil/utils"
import { ISeriesApi, PriceFormat } from "lightweight-charts"

import { TradeChartType } from "@/modules/trade/swap/components/TradeChart/TradeChart.utils"

/** Candles the viewport shows after a reset. */
export const VISIBLE_BARS = 60

/** How close to the left edge scrolling gets before more history is asked for. */
export const LOAD_MORE_THRESHOLD = 60

export type CandleSeries = {
  readonly candlestick: ISeriesApi<"Candlestick">
  readonly baseline: ISeriesApi<"Baseline">
  readonly volume: ISeriesApi<"Histogram">
}

export type OhlcCrosshairData = BaselineChartData & {
  open?: number
  high?: number
  low?: number
}

/**
 * The props the chart's own subscriptions read. lightweight-charts is
 * imperative and its callbacks are registered once at mount, so they read this
 * mirror rather than closing over the render that created them.
 */
export type CandleChartLatest = {
  readonly type: TradeChartType
  readonly candles: ReadonlyArray<PairCandle>
  readonly onCrosshairMove: (data: OhlcCrosshairData | null) => void
  readonly onReachStart: () => void
}

/** The series a price reading comes from — the other one is hidden. */
export const priceSeriesOf = (
  series: CandleSeries,
  type: TradeChartType,
): ISeriesApi<"Candlestick"> | ISeriesApi<"Baseline"> =>
  type === "candles" ? series.candlestick : series.baseline

export const toTime = (candle: PairCandle) => toUTCTimestamp(candle.time * 1000)

/**
 * Time left on the open bucket, wide enough for a weekly close: `3d 15h`,
 * `21h 04m`, `1:23:45`, `4:59`.
 */
export const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (value: number) => String(value).padStart(2, "0")

  if (days > 0) return `${days}d ${pad(hours)}h`
  if (hours >= 10) return `${hours}h ${pad(minutes)}m`
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`

  return `${minutes}:${pad(seconds)}`
}

export const candlestickColors = (theme: ThemeProps) => {
  const upColor = theme.details.values.positive
  const downColor = theme.details.values.negative

  return { upColor, downColor, wickUpColor: upColor, wickDownColor: downColor }
}

export const baselineColors = (theme: ThemeProps) => ({
  topLineColor: theme.details.chart,
  topFillColor1: hexToRgba(theme.details.chart, 0.5),
  topFillColor2: hexToRgba(theme.details.chart, 0),
})

export const volumeColors = (theme: ThemeProps) => ({
  color: hexToRgba(theme.details.chart, 0.3),
})

export const scrollOptions = (isMobile: boolean) =>
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

export const tradeCrosshair = (theme: ThemeProps) => {
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

export const getPriceFormat = (
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

/**
 * The trailing candles to `update()` when the change is confined to the tip:
 * the last bar moved, or a new bucket opened behind it. Anything wider means
 * the tail refetched and the series has to be redrawn in full.
 */
export const tipUpdates = (
  previous: ReadonlyArray<PairCandle> | null,
  next: ReadonlyArray<PairCandle>,
): ReadonlyArray<PairCandle> | null => {
  if (!previous?.length) return null

  const grew = next.length - previous.length
  if (grew !== 0 && grew !== 1) return null

  const unchanged = previous.length - 1
  for (let index = 0; index < unchanged; index++)
    if (previous[index] !== next[index]) return null

  return next.slice(unchanged)
}
