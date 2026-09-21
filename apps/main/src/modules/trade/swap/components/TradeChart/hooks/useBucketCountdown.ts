import {
  bucketOpenMs,
  CANDLE_BUCKET_MS,
  CandleBucket,
} from "@galacticcouncil/indexer/neckwork"
import { useTheme } from "@galacticcouncil/ui/theme"
import { RefObject, useEffect } from "react"

import {
  CandleChartLatest,
  CandleSeries,
  formatCountdown,
  priceSeriesOf,
} from "@/modules/trade/swap/components/TradeChart/CandleChart.utils"
import { TradeChartType } from "@/modules/trade/swap/components/TradeChart/TradeChart.utils"

type UseBucketCountdownParams = {
  readonly seriesRef: RefObject<CandleSeries | null>
  readonly latestRef: RefObject<CandleChartLatest>
  readonly bucket: CandleBucket
  readonly type: TradeChartType
  readonly enabled: boolean
}

/**
 * Time to the open bucket's close, on the price axis at the last price — the
 * same label neckwork's own chart draws. It keeps its own second-by-second
 * timer, so the series itself is redrawn only when a price actually moves.
 *
 * The remaining time comes from the clock rather than from the last candle, so
 * the label is right even before a bucket has a candle of its own — which is
 * the normal state right after a pair switch, the API serving only closed
 * buckets.
 *
 * The line belongs to whichever series is on screen: a hidden series hides its
 * price lines with it, so one anchored to the candlesticks would vanish in
 * line mode.
 */
export const useBucketCountdown = ({
  seriesRef,
  latestRef,
  bucket,
  type,
  enabled,
}: UseBucketCountdownParams): void => {
  const { themeProps } = useTheme()

  useEffect(() => {
    const series = seriesRef.current
    if (!series || !enabled) return

    const priceSeries = priceSeriesOf(series, type)

    const line = priceSeries.createPriceLine({
      price: 0,
      color: "transparent",
      lineVisible: false,
      axisLabelVisible: false,
      title: "",
      axisLabelColor: themeProps.controls.dim.base,
      axisLabelTextColor: themeProps.text.high,
    })

    const tick = () => {
      const close = latestRef.current.candles.at(-1)?.close

      if (close === undefined) {
        line.applyOptions({ axisLabelVisible: false })
        return
      }

      const now = Date.now()
      const remaining =
        bucketOpenMs(bucket, now) + CANDLE_BUCKET_MS[bucket] - now

      line.applyOptions({
        price: close,
        axisLabelVisible: true,
        title: formatCountdown(remaining),
      })
    }

    tick()
    const timer = setInterval(tick, 1000)

    return () => {
      clearInterval(timer)
      priceSeries.removePriceLine(line)
    }
  }, [bucket, themeProps, type, enabled, seriesRef, latestRef])
}
