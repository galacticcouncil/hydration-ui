export const TRADE_CHART_TYPES = ["candles", "line"] as const

export type TradeChartType = (typeof TRADE_CHART_TYPES)[number]
