import { ChartTheme, ChartValue } from "@tanstack/charts"
import { motion } from "@tanstack/charts/motion"
import {
  RendererChart,
  RendererChartProps,
} from "@tanstack/charts/react/tooltip"
import { ResponsiveStyleValue } from "@theme-ui/css"
import { useMemo } from "react"

import { CHART_BARE_TOOLTIP_CLASS } from "@/components/Chart/ChartTooltip"
import { ThemeToken, useResponsiveValue, useTheme } from "@/theme"

const defaultRenderer = motion({
  initial: "always",
  transition: {
    type: "spring",
    stiffness: 170,
    damping: 18,
    mass: 1,
  },
})

const toAspectRatio = (value: number | string | undefined) => {
  if (typeof value !== "string") return value

  const [width, height] = value.split("/")
  const ratio = Number(width) / Number(height ?? 1)

  return Number.isFinite(ratio) ? ratio : undefined
}

export const chartColorScale = (
  tokens: Readonly<Record<string, ThemeToken>>,
  getToken: (path: ThemeToken) => string,
) => ({
  domain: Object.keys(tokens),
  range: Object.values(tokens).map(getToken),
})

export type ChartProps<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = Omit<
  RendererChartProps<TDatum, TXValue, TYValue>,
  "renderer" | "height" | "aspectRatio"
> & {
  renderer?: RendererChartProps<TDatum, TXValue, TYValue>["renderer"]
  height?: ResponsiveStyleValue<number>
  aspectRatio?: ResponsiveStyleValue<number | string>
}

export const Chart = <
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  renderer = defaultRenderer,
  height,
  aspectRatio,
  definition,
  ...props
}: ChartProps<TDatum, TXValue, TYValue>) => {
  const { themeProps, theme } = useTheme()

  const resolvedHeight = useResponsiveValue(height)
  const resolvedAspectRatio = useResponsiveValue(aspectRatio)

  const themedDefinition = useMemo(() => {
    const chartTheme: Partial<ChartTheme> = {
      foreground: themeProps.text.high,
      muted: themeProps.text.medium,
      grid: themeProps.text.medium,
    }

    if ("marks" in definition) {
      return {
        ...definition,
        theme: {
          ...chartTheme,
          ...definition.theme,
        },
      }
    }

    const { chart, ...rest } = definition

    return {
      ...rest,
      chart: (
        context: Parameters<typeof chart>[0],
      ): ReturnType<typeof chart> => {
        const spec = chart(context)

        return {
          ...spec,
          theme: {
            ...chartTheme,
            ...spec.theme,
          },
        }
      },
    }
  }, [definition, themeProps.text.high, themeProps.text.medium])

  return (
    <RendererChart
      renderer={renderer}
      definition={themedDefinition}
      css={{
        "--ts-chart-tooltip-background":
          theme === "light"
            ? themeProps.surfaces.themeBasePalette.surfaceHigh
            : themeProps.details.tooltips,

        "--ts-chart-tooltip-border": "none",
        "--ts-chart-tooltip-border-radius": themeProps.radii.m,
        "--ts-chart-tooltip-shadow": "4px 8px 20px 0px rgba(41, 41, 60, 0.3)",
        "--ts-chart-tooltip-padding": "0",
        "--ts-chart-tooltip-max-width": themeProps.sizes["4xl"],
        "--ts-chart-tooltip-color": "inherit",
        "--ts-chart-tooltip-font": "inherit",
        "--ts-chart-focus-fill":
          themeProps.surfaces.themeBasePalette.surfaceHigh,

        [`& .${CHART_BARE_TOOLTIP_CLASS}`]: {
          "--ts-chart-tooltip-background": "transparent",
          "--ts-chart-tooltip-shadow": "none",
        },

        [`& .ts-chart`]: {
          outline: "none",
        },
      }}
      height={resolvedHeight}
      aspectRatio={toAspectRatio(resolvedAspectRatio)}
      {...props}
    />
  )
}
