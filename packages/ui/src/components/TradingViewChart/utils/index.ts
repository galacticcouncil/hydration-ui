import { hexToRgba } from "@galacticcouncil/utils"
import {
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type SingleValueData,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts"

export type OhlcData = {
  time: Time
  close: number
  open?: number
  high?: number
  low?: number
  volume?: number
}

export const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
})
export const yearFormatter = new Intl.DateTimeFormat("en", { year: "numeric" })
export const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
})
export const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const parseTradingViewTime = (time: Time) => {
  if (typeof time === "number") {
    return time * 1000
  }

  if (typeof time === "string") {
    return new Date(time).getTime()
  }

  return 0
}

export const getCrosshairValue = (crosshair: CrosshairCallbackData) => {
  if (!crosshair) return
  if (crosshair.type === "Candlestick") return crosshair.data.close
  if (crosshair.type === "Baseline") return crosshair.data.value
}

export const toUTCTimestamp = (timestamp: number): UTCTimestamp => {
  return Math.floor(timestamp / 1000) as UTCTimestamp
}

type ColorOptions = {
  upColor: string
  downColor: string
  lineColor: string
  volumeBarColor: string
}

export const renderSeries = (
  chart: IChartApi,
  seriesType: "Candlestick" | "Baseline",
  data: OhlcData[] = [],
  options: ColorOptions,
) => {
  let series: ISeriesApi<"Candlestick" | "Baseline">

  if (seriesType === "Candlestick") {
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: options.upColor,
      downColor: options.downColor,
      wickUpColor: options.upColor,
      wickDownColor: options.downColor,
      borderVisible: false,
      priceLineVisible: false,
    })

    candlestickSeries.setData(data)
    series = candlestickSeries
  } else {
    const baselineSeries = chart.addSeries(BaselineSeries, {
      topLineColor: options.lineColor,
      topFillColor1: hexToRgba(options.lineColor, 0.5),
      topFillColor2: hexToRgba(options.lineColor, 0),
      lineWidth: 2,
      priceLineVisible: false,
    })
    const lineData = data.map((item) => ({
      time: item.time,
      value: item.close,
    }))
    baselineSeries.setData(lineData)
    series = baselineSeries
  }

  const volumeSeries = chart.addSeries(HistogramSeries, {
    visible: true,
    color: options.volumeBarColor,
    lastValueVisible: false,
    priceLineVisible: false,
    priceFormat: {
      type: "volume",
    },
    priceScaleId: "",
  })
  volumeSeries.setData(
    data.map((item) => ({ time: item.time, value: item.volume })),
  )

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.85,
      bottom: 0,
    },
  })

  chart.timeScale().fitContent()

  return series
}

export type CrosshairCallbackData =
  | { type: "Candlestick"; data: OhlcData }
  | { type: "Baseline"; data: SingleValueData }
  | null

export const subscribeCrosshairMove = (
  chart: IChartApi,
  series: ISeriesApi<"Candlestick" | "Baseline">,
  chartContainerElement: HTMLDivElement,
  crosshairElement: HTMLDivElement,
  priceIndicatorElement: HTMLDivElement,
  onUpdate: (data: CrosshairCallbackData) => void,
) => {
  if (!chart || !series || !crosshairElement) return

  chart.subscribeCrosshairMove((param) => {
    if (!param || !param.time || param.point === undefined) {
      crosshairElement.style.opacity = "0"
      priceIndicatorElement.style.opacity = "0"
      onUpdate(null)
      return
    }

    const dataPoint = param.seriesData.get(series)

    if (!dataPoint) {
      crosshairElement.style.opacity = "0"
      priceIndicatorElement.style.opacity = "0"
      onUpdate(null)
      return
    }

    const data =
      series.seriesType() === "Candlestick"
        ? {
            type: "Candlestick" as const,
            data: dataPoint as OhlcData,
          }
        : { type: "Baseline" as const, data: dataPoint as SingleValueData }

    const chartRect = chartContainerElement.getBoundingClientRect()
    const tooltipWidth = crosshairElement.offsetWidth

    let left = param.point.x - tooltipWidth / 2

    if (left < 10) {
      left = param.point.x + 10
    } else if (left + tooltipWidth > chartRect.width - 10) {
      left = param.point.x - tooltipWidth - 10
    }

    crosshairElement.style.left = `${left}px`
    crosshairElement.style.top = `10px`
    crosshairElement.style.opacity = "1"

    const price = getCrosshairValue(data)

    if (price) {
      const priceIndicatorHeight = priceIndicatorElement.offsetHeight
      priceIndicatorElement.style.opacity = "1"
      priceIndicatorElement.style.left = `0px`
      const priceY = series.priceToCoordinate(price) ?? 0
      const top = priceY - priceIndicatorHeight / 2
      priceIndicatorElement.style.top = `${top}px`
      priceIndicatorElement.innerHTML = series.priceFormatter().format(price)
    } else {
      priceIndicatorElement.style.opacity = "0"
    }

    onUpdate(data)
  })
}
