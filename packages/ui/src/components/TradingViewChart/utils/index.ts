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
import { isNumber, last } from "remeda"

export type OhlcData = {
  time: Time
  close: number
  open?: number
  high?: number
  low?: number
  volume?: number
}

export type ChartDataExtended =
  | { type: "Candlestick"; data: OhlcData }
  | { type: "Baseline"; data: SingleValueData }

export type SeriesType = ChartDataExtended["type"]

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

export const parseTradingViewTime = (time: Time): number => {
  if (typeof time === "number") {
    return time * 1000
  }

  if (typeof time === "string") {
    return new Date(time).getTime()
  }

  return 0
}

export const getCrosshairValue = (
  crosshair: CrosshairCallbackData,
): number | undefined => {
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

const getCandlestickSeries = (
  chart: IChartApi,
  options: ColorOptions,
): ISeriesApi<"Candlestick"> => {
  return chart.addSeries(CandlestickSeries, {
    upColor: options.upColor,
    downColor: options.downColor,
    wickUpColor: options.upColor,
    wickDownColor: options.downColor,
    borderVisible: false,
    priceLineVisible: false,
  })
}

const getBaselineSeries = (
  chart: IChartApi,
  options: ColorOptions,
): ISeriesApi<"Baseline"> => {
  return chart.addSeries(BaselineSeries, {
    topLineColor: options.lineColor,
    topFillColor1: hexToRgba(options.lineColor, 0.5),
    topFillColor2: hexToRgba(options.lineColor, 0),
    lineWidth: 2,
    priceLineVisible: false,
  })
}

const getVolumeSeries = (
  chart: IChartApi,
  options: ColorOptions,
): ISeriesApi<"Histogram"> => {
  const series = chart.addSeries(HistogramSeries, {
    visible: true,
    color: options.volumeBarColor,
    lastValueVisible: false,
    priceLineVisible: false,
    priceFormat: {
      type: "volume",
    },
    priceScaleId: "",
  })
  series.priceScale().applyOptions({
    scaleMargins: {
      top: 0.85,
      bottom: 0,
    },
  })
  return series
}

const getMainSeries = (
  chart: IChartApi,
  type: SeriesType,
  options: ColorOptions,
) => {
  switch (type) {
    case "Candlestick":
      return getCandlestickSeries(chart, options)
    case "Baseline":
      return getBaselineSeries(chart, options)
    default:
      throw new Error(`Unknown series type: ${type}`)
  }
}

const getMainSeriesData = (
  type: SeriesType,
  data: OhlcData[],
): OhlcData[] | SingleValueData[] => {
  if (type === "Candlestick") return data
  return data.map((item) => ({ time: item.time, value: item.close }))
}

const getVolumeData = (data: OhlcData[]): SingleValueData[] => {
  return data.map((item) => ({
    time: item.time,
    value: item.volume ?? 0,
  }))
}

export const renderSeries = (
  chart: IChartApi,
  type: SeriesType,
  data: OhlcData[] = [],
  options: ColorOptions,
): ISeriesApi<SeriesType> => {
  const series = getMainSeries(chart, type, options)
  const seriesData = getMainSeriesData(type, data)
  series.setData(seriesData)

  const sample = last(data)
  const hasVolume = isNumber(sample?.volume)

  if (hasVolume) {
    const volumeSeries = getVolumeSeries(chart, options)
    const volumeData = getVolumeData(data)
    volumeSeries.setData(volumeData)
  }

  return series
}

export type CrosshairCallbackData = ChartDataExtended | null

export const subscribeCrosshairMove = (
  chart: IChartApi,
  series: ISeriesApi<SeriesType>,
  chartContainerElement: HTMLDivElement,
  crosshairElement: HTMLDivElement,
  priceIndicatorElement: HTMLDivElement,
  onUpdate: (data: CrosshairCallbackData) => void,
) => {
  if (!chart || !series || !crosshairElement) return

  crosshairElement.style.top = "10px"
  priceIndicatorElement.style.left = "0px"

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

    const data: CrosshairCallbackData =
      series.seriesType() === "Candlestick"
        ? { type: "Candlestick", data: dataPoint as OhlcData }
        : { type: "Baseline", data: dataPoint as SingleValueData }

    const chartRect = chartContainerElement.getBoundingClientRect()
    const tooltipWidth = crosshairElement.offsetWidth
    const price = getCrosshairValue(data)
    const priceY = price ? series.priceToCoordinate(price) : null
    const priceFormatted = price ? series.priceFormatter().format(price) : ""
    const priceIndicatorHeight = priceIndicatorElement.offsetHeight

    let left = param.point.x - tooltipWidth / 2
    if (left < 10) {
      left = param.point.x + 10
    } else if (left + tooltipWidth > chartRect.width - 10) {
      left = param.point.x - tooltipWidth - 10
    }

    crosshairElement.style.left = `${left}px`
    crosshairElement.style.opacity = "1"

    if (priceY) {
      const top = priceY - priceIndicatorHeight / 2
      priceIndicatorElement.style.opacity = "1"
      priceIndicatorElement.style.top = `${top}px`
      priceIndicatorElement.innerHTML = priceFormatted
    } else {
      priceIndicatorElement.style.opacity = "0"
    }

    onUpdate(data)
  })
}
