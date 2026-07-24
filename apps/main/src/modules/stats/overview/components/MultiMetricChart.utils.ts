import { ThemeToken } from "@galacticcouncil/ui/theme"

export const METRIC_KEYS = ["tvl", "volume", "hdx"] as const
export const TIME_RANGES = ["7D", "1M", "3M", "1Y", "ALL"] as const
export type MetricKey = (typeof METRIC_KEYS)[number]
export type TimeRange = (typeof TIME_RANGES)[number]

export const VOLUME_BAR_SIZE_BY_RANGE: Record<TimeRange, number> = {
  "7D": 4,
  "1M": 5,
  "3M": 6,
  "1Y": 7,
  ALL: 7,
}
export const VOLUME_BAR_SCALE_BY_RANGE: Record<TimeRange, number> = {
  "7D": 10,
  "1M": 10,
  "3M": 10,
  "1Y": 2.5,
  ALL: 2.5,
}

const multiMetricColors = {
  omnipool: "secondaryColors.blues.vibrantBlue",
  stablePools: "accents.success.primary",
  xykPools: "accents.alertAlt.primary",
  moneyMarket: "secondaryColors.blues.blueViolet",
} as const

export const metricsConfig: Record<
  MetricKey,
  {
    color: ThemeToken
    label: string
    yAxisId: "metric" | "price"
  }
> = {
  tvl: {
    color: multiMetricColors.stablePools,
    label: "TVL",
    yAxisId: "metric",
  },
  volume: {
    color: multiMetricColors.xykPools,
    label: "Volume",
    yAxisId: "metric",
  },
  hdx: {
    color: multiMetricColors.moneyMarket,
    label: "HDX Price",
    yAxisId: "price",
  },
}
