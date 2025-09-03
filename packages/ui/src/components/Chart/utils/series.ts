import { isValidElement } from "react"
import { BaseAxisProps } from "recharts/types/util/types"
import { first, isArray, isNumber, isObjectType, isString } from "remeda"

import {
  AxisLabelCssProps,
  ChartConfig,
  ChartSeriesType,
  TChartData,
} from "@/components/Chart/types"
import {
  dateFormatter,
  numberFormatter,
} from "@/components/Chart/utils/formatters"

export const pickPrimarySeries = <T extends TChartData>(
  config: ChartConfig<T>,
) => {
  return first(config.series)
}

export const getColorSet = (
  color?: string | [string, string],
  defaultColor: string = "#000",
) => {
  if (isArray(color)) {
    return {
      primary: color[0] || defaultColor,
      secondary: color[1] || defaultColor,
    }
  }

  if (isString(color))
    return {
      primary: color,
      secondary: color,
    }

  return {
    primary: defaultColor,
    secondary: defaultColor,
  }
}

export const getDefaultFormatterByType = (type?: ChartSeriesType) => {
  if (!type) return undefined
  switch (type) {
    case "time":
      return dateFormatter.format
    case "number":
      return numberFormatter.format
    default:
      return undefined
  }
}

export const getConfigWithDefaults = <T extends TChartData>(
  config: ChartConfig<T>,
) => {
  return {
    ...config,
    xAxisType: config.xAxisType || "category",
    yAxisType: config.yAxisType || "number",
    tooltipType: config.tooltipType || "legend",
  }
}

export const getDerivedChartProps = <T extends TChartData>(
  config: ChartConfig<T>,
) => {
  const {
    yAxisFormatter,
    yAxisType,
    xAxisFormatter,
    tooltipFormatter,
    xAxisType,
    tooltipType,
  } = getConfigWithDefaults(config)

  const labelFormatter = xAxisFormatter || getDefaultFormatterByType(xAxisType)
  const valueFormatter = yAxisFormatter || getDefaultFormatterByType(yAxisType)

  const marginTop = tooltipType === "timeTop" ? 40 : 0
  const marginBot = tooltipType === "timeBottom" ? 40 : 0
  const margin = { top: marginTop, bottom: marginBot }

  const isTimeTooltip =
    tooltipType === "timeTop" || tooltipType === "timeBottom"

  const tooltipWrapperStyles = isTimeTooltip
    ? ({ position: "static" } as const)
    : undefined

  return {
    margin,
    labelFormatter,
    tooltipFormatter: tooltipFormatter || labelFormatter,
    valueFormatter,
    tooltipWrapperStyles,
  }
}

export const getBarSeriesBorderRadius = (
  index: number,
  total: number,
  isStacked = false,
  isVerticalLayout = false,
): [number, number, number, number] => {
  if (!isStacked) return [4, 4, 4, 4]

  const isFirst = index === total
  const isLast = index === 0

  if (isFirst && isLast) return [4, 4, 4, 4]

  if (isVerticalLayout) {
    if (isFirst) return [0, 4, 4, 0]
    if (isLast) return [4, 0, 0, 4]
    return [0, 0, 0, 0]
  } else {
    if (isFirst) return [4, 4, 0, 0]
    if (isLast) return [0, 0, 4, 4]
    return [0, 0, 0, 0]
  }
}

export const getAxisLabelProps = (
  config: BaseAxisProps["label"],
  isVerticalLayout: boolean,
  labelProps?: AxisLabelCssProps,
) => {
  if (!config) return

  const defaultProps = {
    position: isVerticalLayout ? "insideLeft" : "insideRight",
    angle: isVerticalLayout ? -90 : 0,
    dy: isVerticalLayout ? 35 : 3,
    dx: isVerticalLayout ? 35 : 0,
    fontSize: 12,
    ...labelProps,
  }

  if (isString(config) || isNumber(config)) {
    return {
      value: config,
      ...defaultProps,
    }
  }

  if (isObjectType(config)) {
    return {
      ...defaultProps,
      ...config,
    }
  }

  if (isValidElement(config)) {
    return config
  }
}
