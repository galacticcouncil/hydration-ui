import { hexToRgba } from "@galacticcouncil/utils"
import {
  BaselineSeries,
  BaselineStyleOptions,
  CandlestickSeries,
  HistogramData,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type PriceFormat,
  type SingleValueData,
  type Time,
  type UTCTimestamp,
  WhitespaceData,
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

export type BaselineChartData = SingleValueData & { volume?: number }

export type ChartDataExtended =
  | { type: "Candlestick"; data: OhlcData }
  | {
      type: "Baseline"
      data: BaselineChartData
    }

export type SeriesType = ChartDataExtended["type"]

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
  color: ColorOptions,
  baseline: Partial<BaselineStyleOptions>,
): ISeriesApi<"Baseline"> => {
  return chart.addSeries(BaselineSeries, {
    topLineColor: color.lineColor,
    topFillColor1: hexToRgba(color.lineColor, 0.5),
    topFillColor2: hexToRgba(color.lineColor, 0),
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: true,
    ...baseline,
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
  color: ColorOptions,
  baseline: Partial<BaselineStyleOptions>,
) => {
  switch (type) {
    case "Candlestick":
      return getCandlestickSeries(chart, color)
    case "Baseline":
      return getBaselineSeries(chart, color, baseline)
    default:
      throw new Error(`Unknown series type: ${type}`)
  }
}

const getMainSeriesData = (
  type: SeriesType,
  data: Array<OhlcData>,
): Array<OhlcData> | Array<SingleValueData> => {
  if (type === "Candlestick") return data
  return data.map((item) => ({ time: item.time, value: item.close }))
}

const getVolumeData = (data: ReadonlyArray<OhlcData>): SingleValueData[] => {
  return data.map((item) => ({
    time: item.time,
    value: item.volume ?? 0,
  }))
}

const getPriceFormatFromSample = (
  sample: OhlcData,
): Partial<PriceFormat> | undefined => {
  const value = sample.close
  if (value <= 0 || !isFinite(value)) return

  if (value >= 1) {
    return { precision: 2, minMove: 0.01 }
  }

  const leadingZeros = Math.floor(Math.abs(Math.log10(value)))
  const precision = leadingZeros + 2
  const minMove = Math.pow(10, -(leadingZeros + 2))

  return { precision, minMove }
}

export const renderSeries = (
  chart: IChartApi,
  type: SeriesType,
  data: Array<OhlcData> = [],
  color: ColorOptions,
  baseline: Partial<BaselineStyleOptions> = {},
): [
  ISeriesApi<SeriesType>,
  ISeriesApi<"Histogram", Time, WhitespaceData<Time> | HistogramData<Time>>?,
] => {
  const series = getMainSeries(chart, type, color, baseline)
  const seriesData = getMainSeriesData(type, data)
  series.setData(seriesData)

  const sample = last(data)
  const hasVolume = isNumber(sample?.volume)

  if (sample) {
    series.applyOptions({
      priceFormat: getPriceFormatFromSample(sample),
    })
  }

  if (hasVolume) {
    const volumeSeries = getVolumeSeries(chart, color)
    const volumeData = getVolumeData(data)
    volumeSeries.setData(volumeData)

    return [series, volumeSeries]
  }

  return [series]
}

export type TradingViewChartSeries = ReturnType<typeof renderSeries>[0]

export type CrosshairCallbackData = ChartDataExtended | null

export const subscribeCrosshairMove = (
  chart: IChartApi,
  [series, volumeSeries]: [
    ISeriesApi<SeriesType>,
    ISeriesApi<"Histogram", Time, WhitespaceData<Time> | HistogramData<Time>>?,
  ],
  chartContainerElement: HTMLDivElement,
  crosshairElement: HTMLDivElement,
  priceIndicatorElement: HTMLDivElement | null,
  onUpdate: (data: CrosshairCallbackData) => void,
) => {
  if (!chart || !series || !crosshairElement) return

  crosshairElement.style.top = "10px"

  if (priceIndicatorElement) {
    priceIndicatorElement.style.left = "0px"
    priceIndicatorElement.style.opacity = "0"
  }

  chart.subscribeCrosshairMove((param) => {
    if (!param || !param.time || param.point === undefined) {
      crosshairElement.style.opacity = "0"

      if (priceIndicatorElement) {
        priceIndicatorElement.style.opacity = "0"
      }

      onUpdate(null)
      return
    }

    const dataPoint = param.seriesData.get(series)

    if (!dataPoint) {
      crosshairElement.style.opacity = "0"

      if (priceIndicatorElement) {
        priceIndicatorElement.style.opacity = "0"
      }

      onUpdate(null)
      return
    }

    const volumeDataPoint =
      volumeSeries &&
      (param.seriesData.get(volumeSeries) as HistogramData | undefined)

    const data: CrosshairCallbackData =
      series.seriesType() === "Candlestick"
        ? { type: "Candlestick", data: dataPoint as OhlcData }
        : {
            type: "Baseline",
            data: {
              ...(dataPoint as SingleValueData),
              volume: volumeDataPoint?.value,
            },
          }

    const chartRect = chartContainerElement.getBoundingClientRect()
    const tooltipWidth = crosshairElement.offsetWidth
    const price = getCrosshairValue(data)
    const priceY = price ? series.priceToCoordinate(price) : null
    const priceFormatted = price ? series.priceFormatter().format(price) : ""
    const priceIndicatorHeight = priceIndicatorElement?.offsetHeight ?? 0

    let left = param.point.x - tooltipWidth / 2
    if (left < 10) {
      left = param.point.x + 10
    } else if (left + tooltipWidth > chartRect.width - 10) {
      left = param.point.x - tooltipWidth - 10
    }

    crosshairElement.style.left = `${left}px`
    crosshairElement.style.opacity = "1"

    if (priceIndicatorElement) {
      if (priceY) {
        const top = priceY - priceIndicatorHeight / 2
        priceIndicatorElement.style.opacity = "1"
        priceIndicatorElement.style.top = `${top}px`
        priceIndicatorElement.innerHTML = priceFormatted
      } else {
        priceIndicatorElement.style.opacity = "0"
      }
    }

    onUpdate(data)
  })
}
