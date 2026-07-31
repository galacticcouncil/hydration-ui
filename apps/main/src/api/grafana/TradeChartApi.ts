import {
  OhlcData,
  SingleValueData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"

import tradeChart from "./tradeChart.sql?raw"

export type TradeChartRawData = [
  timestamps: number[],
  prices: number[],
  volumes: number[],
]

export type TradeChartOhlcRawData = [
  timestamps: number[],
  values: number[],
  low: number[],
  high: number[],
  open: number[],
  close: number[],
]

export type TradeChartQueryParams = {
  assetInId: string
  assetInSymbol: string
  assetInDecimals: number
  assetOutId: string
  assetOutSymbol: string
  assetOutDecimals: number
  from: string
  to: string
  interval: string
}

export class TradeChartApi {
  buildQuery(params: TradeChartQueryParams): string {
    return tradeChart
      .replaceAll("$assetInId", params.assetInId)
      .replaceAll("$assetInSymbol", params.assetInSymbol)
      .replaceAll("$assetInDecimals", params.assetInDecimals.toString())
      .replaceAll("$assetOutId", params.assetOutId)
      .replaceAll("$assetOutSymbol", params.assetOutSymbol)
      .replaceAll("$assetOutDecimals", params.assetOutDecimals.toString())
      .replaceAll("$from", params.from)
      .replaceAll("$to", params.to)
      .replaceAll("$interval", params.interval)
  }

  /**
   * Filter outliers from dataset
   *
   * Effect of changing the iqr (interquartile range) multiplier:
   *
   * [1.5] Standard threshold — flags typical outliers (used in box plots, common in stats)
   * [2.0–3.0] More tolerant — only filters values that are more obviously extreme
   * [3.5] Very loose — almost nothing gets filtered out unless it's way outside the norm
   *
   * @param originDs - original bucket frames
   * @param iqrMultiplies - iqr multiplier (default to 1.5)
   * @returns buckets without outliers
   */
  filterOutliers(
    originDs: TradeChartRawData,
    iqrMultiplier = 3.5,
  ): TradeChartRawData {
    const [ts, price, volume] = originDs
    const priceCp = price.slice().sort((a, b) => a - b)

    const quantile = (arr: number[], q: number): number => {
      const pos = (arr.length - 1) * q
      const base = Math.floor(pos)
      const rest = pos - base
      const baseValue = arr[base] ?? 0
      const nextValue = arr[base + 1]
      if (nextValue !== undefined) {
        return baseValue + rest * (nextValue - baseValue)
      }
      return baseValue
    }

    const q1 = quantile(priceCp, 0.25)
    const q3 = quantile(priceCp, 0.75)
    const iqr = q3 - q1

    const maxValue = q3 + iqr * iqrMultiplier
    const minValue = q1 - iqr * iqrMultiplier

    const outlierIndexes = new Set<number>()
    price.forEach((p, index) => {
      if (p > maxValue || p < minValue) {
        outlierIndexes.add(index)
      }
    })

    if (outlierIndexes.size === 0) {
      return originDs
    }

    return [
      ts.filter((_, index) => !outlierIndexes.has(index)),
      price.filter((_, index) => !outlierIndexes.has(index)),
      volume.filter((_, index) => !outlierIndexes.has(index)),
    ]
  }

  formatPriceData([ts, price]: TradeChartRawData): SingleValueData[] {
    return ts.map((time, index) => ({
      time: toUTCTimestamp(time),
      value: price[index] ?? 0,
    }))
  }

  formatVolumeData([ts, , volume]: TradeChartRawData): SingleValueData[] {
    return ts.map((time, index) => ({
      time: toUTCTimestamp(time),
      value: volume[index] ?? 0,
    }))
  }

  formatOhlcData([
    ts,
    ,
    low,
    high,
    open,
    close,
  ]: TradeChartOhlcRawData): OhlcData[] {
    return ts.map((time, index) => ({
      time: toUTCTimestamp(time),
      low: low[index] ?? 0,
      high: high[index] ?? 0,
      open: open[index] ?? 0,
      close: close[index] ?? 0,
    }))
  }

  transform(data: TradeChartRawData): OhlcData[] {
    const normalized = this.filterOutliers(data)
    const prices = this.formatPriceData(normalized)
    const volumes = this.formatVolumeData(normalized)

    return prices.map((point, index) => ({
      time: point.time,
      close: point.value,
      volume: volumes[index]?.value ?? 0,
    }))
  }
}
