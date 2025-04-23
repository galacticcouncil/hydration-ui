import {
  ColorType,
  type CrosshairOptions,
  type DeepPartial,
  type GridOptions,
  type LayoutOptions,
  type PriceScaleOptions,
  TickMarkType,
  type TimeScaleOptions,
} from "lightweight-charts"

import {
  monthFormatter,
  timeFormatter,
  yearFormatter,
} from "@/components/Chart/utils"
import { parseTradingViewTime } from "@/components/TradingViewChart/utils"
import { ThemeProps } from "@/theme"

export const layout = (theme: ThemeProps): Partial<LayoutOptions> => ({
  background: { type: ColorType.Solid, color: "transparent" },
  textColor: theme.text.low,
  fontSize: 12,
})

export const rightPriceScale: Partial<PriceScaleOptions> = {
  visible: false,
}

export const leftPriceScale: Partial<PriceScaleOptions> = {
  scaleMargins: {
    top: 0.2,
    bottom: 0.2,
  },
  visible: false,
  borderVisible: false,
  entireTextOnly: true,
}

export const timeScale: Partial<TimeScaleOptions> = {
  visible: true,
  fixLeftEdge: true,
  fixRightEdge: true,
  borderVisible: false,
  timeVisible: true,
  secondsVisible: false,
  tickMarkFormatter: (time, tickMarkType): string => {
    const timestamp = parseTradingViewTime(time)

    if (!timestamp) return ""

    switch (tickMarkType) {
      case TickMarkType.Year:
        return yearFormatter.format(timestamp)
      case TickMarkType.Month:
      case TickMarkType.DayOfMonth:
        return monthFormatter.format(timestamp)
      default:
        return timeFormatter.format(timestamp)
    }
  },
}

export const crosshair = (
  theme: ThemeProps,
): DeepPartial<CrosshairOptions> => ({
  mode: 1,
  horzLine: {
    visible: true,
    labelVisible: false,
    color: theme.text.low,
  },
  vertLine: {
    visible: true,
    labelVisible: false,
    color: theme.text.low,
  },
})

export const grid: DeepPartial<GridOptions> = {
  horzLines: {
    visible: false,
  },
  vertLines: {
    visible: false,
  },
}
