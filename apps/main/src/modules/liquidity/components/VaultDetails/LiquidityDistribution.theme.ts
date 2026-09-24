import type { ResponsiveStyleValue } from "@galacticcouncil/ui/types"

import type { BandId } from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution.utils"

export const TICK_PADDING = 8
export const CHART_GUIDE_INSET = 4
export const CHART_PLOT_INSET = CHART_GUIDE_INSET * 2
export const BAR_RADIUS = 4
export const BAR_GAP = 4
export const MIN_BAR_HEIGHT = 12
export const BAND_GAP = 3
export const BAND_RADIUS = 3

export const FADED_OPACITY = 0.3
export const BACKGROUND_TIER_TINT = 0.45

export const FOCUS_TRANSITION = {
  type: "tween" as const,
  duration: 350,
  easing: "ease-out" as const,
}

export const SCENARIO_TRANSITION = {
  transition: {
    type: "tween" as const,
    duration: 650,
    easing: "ease-in-out" as const,
  },
}

export const DEFAULT_DESKTOP_HEIGHT = 420
export const DEFAULT_HEIGHT: ResponsiveStyleValue<number> = [
  280,
  DEFAULT_DESKTOP_HEIGHT,
]

export const plotCssPos = (fraction: number) =>
  `calc(${CHART_GUIDE_INSET}px + ${fraction} * (100% - ${CHART_PLOT_INSET}px))`

export const plotCssWidth = (fraction: number) =>
  `calc(${fraction} * (100% - ${CHART_PLOT_INSET}px))`

type ManagedRangeTheme = {
  controls: {
    outline: { active: string }
  }
  accents: {
    alert: { primary: string }
  }
}

export type ManagedRangeStyle = {
  color: string
  fillOpacity: number
  borderOpacity: number
}

export const managedRangeStyle = (
  { controls, accents }: ManagedRangeTheme,
  id?: BandId,
): ManagedRangeStyle => ({
  color: id === "limit" ? accents.alert.primary : controls.outline.active,
  fillOpacity: id === "limit" ? 0.05 : 0.15,
  borderOpacity: 1,
})

export const managedRangeMixedColor = (color: string, opacity: number) =>
  `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`

export const managedRangeChartStroke = (
  color: string,
  borderOpacity: number,
) =>
  borderOpacity <= 0
    ? { stroke: "none", strokeWidth: 0 }
    : {
        stroke: managedRangeMixedColor(color, borderOpacity),
        strokeWidth: 2,
      }
