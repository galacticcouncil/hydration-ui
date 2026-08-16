import { ChartValue } from "@tanstack/charts"
import {
  ChartPoint,
  ChartTooltipBodyRenderContext,
} from "@tanstack/charts/react/tooltip"
import { ReactNode } from "react"

import { Flex, Grid, Stack, Text } from "@/components"
import { ChartCrosshair } from "@/components/Chart/ChartCrosshair"
import { STooltipContainer } from "@/components/Chart/ChartTooltip.styled"
import {
  dateFormatter,
  timeFormatter,
} from "@/components/Chart/utils/formatters"
import { getToken } from "@/utils"

type ChartTooltipBodyProps<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> = Pick<ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>, "points">

export type ChartLegendTooltipBodyProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartTooltipBodyProps<TDatum, TXValue, TYValue> & {
  label?: ReactNode
  formatLabel?: (value: TXValue) => ReactNode
  formatSeriesLabel?: (point: ChartPoint<TDatum, TXValue, TYValue>) => ReactNode
  formatValue?: (point: ChartPoint<TDatum, TXValue, TYValue>) => ReactNode
}

export const ChartLegendTooltipBody = <
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  points,
  label,
  formatLabel,
  formatSeriesLabel,
  formatValue,
}: ChartLegendTooltipBodyProps<TDatum, TXValue, TYValue>) => {
  const [first] = points

  if (!first) return null

  const heading = formatLabel ? formatLabel(first.xValue) : String(first.xValue)

  return (
    <STooltipContainer>
      {(label || heading) && (
        <Flex justify="space-between">
          {label && (
            <Text fs="p3" fw={600}>
              {label}
            </Text>
          )}
          {heading && (
            <Text fs="p3" fw={600} align="left">
              {heading}
            </Text>
          )}
        </Flex>
      )}
      <Stack gap="base">
        {points.map((point) => (
          <Flex gap="s" align="center" key={point.key}>
            <Flex bg={point.color} size="2xs" borderRadius="full" />
            <Grid columns={2} justify="space-between" gap="xl" sx={{ flex: 1 }}>
              <Text
                color={getToken("text.medium")}
                fs="p5"
                fw={500}
                lh={1}
                whiteSpace="nowrap"
              >
                {formatSeriesLabel
                  ? formatSeriesLabel(point)
                  : point.groupLabel}
              </Text>
              <Text
                color={getToken("text.high")}
                fs="p4"
                fw={600}
                lh={1}
                align="end"
                fontVariantNumeric="tabular-nums"
              >
                {formatValue ? formatValue(point) : String(point.yValue)}
              </Text>
            </Grid>
          </Flex>
        ))}
      </Stack>
    </STooltipContainer>
  )
}

export type ChartTimeTooltipBodyProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartTooltipBodyProps<TDatum, TXValue, TYValue>

export const ChartTimeTooltipBody = <
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  points,
}: ChartTimeTooltipBodyProps<TDatum, TXValue, TYValue>) => {
  const [first] = points

  if (!first || typeof first.xValue === "string") return null

  return (
    <ChartCrosshair
      date={dateFormatter.format(first.xValue)}
      time={timeFormatter.format(first.xValue)}
    />
  )
}

export const CHART_BARE_TOOLTIP_CLASS = "ts-chart-tooltip--bare"

export const chartTimeTooltipPlacement = (placement: "top" | "bottom") =>
  ({
    anchor: {
      x: "pointer",
      y: placement === "bottom" ? "plot-bottom" : "plot-top",
    },
    placement,
    className: CHART_BARE_TOOLTIP_CLASS,
  }) as const
