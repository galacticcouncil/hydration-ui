import { PairCandle } from "@galacticcouncil/indexer/neckwork"
import { IChartApi } from "lightweight-charts"
import { RefObject, useEffect, useRef } from "react"

import {
  CandleChartLatest,
  CandleSeries,
  getPriceFormat,
  tipUpdates,
  toTime,
  VISIBLE_BARS,
} from "@/modules/trade/swap/components/TradeChart/CandleChart.utils"

type UseCandleDataParams = {
  readonly chartRef: RefObject<IChartApi | null>
  readonly seriesRef: RefObject<CandleSeries | null>
  readonly latestRef: RefObject<CandleChartLatest>
  readonly candles: ReadonlyArray<PairCandle>
  /** Changes when the pair or the bucket does, forcing a full redraw. */
  readonly resetKey: string
  readonly isPlaceholderData: boolean
}

/**
 * Pushes the series onto the chart, and keeps the viewport where the user left
 * it.
 *
 * Two paths: a tip-only change is a handful of `update()` calls, anything
 * wider is a full `setData()` plus the viewport maths. What was last drawn is
 * kept in a ref so the two can be told apart without re-rendering.
 */
export const useCandleData = ({
  chartRef,
  seriesRef,
  latestRef,
  candles,
  resetKey,
  isPlaceholderData,
}: UseCandleDataParams): void => {
  const appliedRef = useRef<{
    resetKey: string
    firstTime: number | null
    candles: ReadonlyArray<PairCandle> | null
  }>({ resetKey, firstTime: null, candles: null })

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (isPlaceholderData || !chart || !series || !candles.length) return

    const applied = appliedRef.current
    const isReset = applied.resetKey !== resetKey

    // the per-block path: only the tip moved, so the viewport maths and the
    // full remap are skipped. priceFormat is left alone too — it only changes
    // when the price crosses a decade, and the next full redraw catches it.
    const tip = isReset ? null : tipUpdates(applied.candles, candles)
    if (tip) {
      for (const candle of tip) {
        const time = toTime(candle)

        series.candlestick.update({
          time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        })
        series.baseline.update({ time, value: candle.close })
        series.volume.update({ time, value: candle.volume })
      }

      appliedRef.current = { ...applied, candles }
      return
    }

    const scale = chart.timeScale()
    const visibleRange = scale.getVisibleLogicalRange()
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

    if (latestRef.current.type === "line") {
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

    appliedRef.current = {
      resetKey,
      firstTime: candles[0]?.time ?? null,
      candles,
    }
  }, [candles, resetKey, isPlaceholderData, chartRef, seriesRef, latestRef])
}
