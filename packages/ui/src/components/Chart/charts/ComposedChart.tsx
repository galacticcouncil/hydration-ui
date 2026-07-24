import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { ReactNode, useCallback, useId, useMemo, useState } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart as ComposedChartPrimitive,
  DotProps,
  Label,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisProps,
} from "recharts"
import { CategoricalChartFunc } from "recharts/types/chart/types"
import { CurveType } from "recharts/types/shape/Curve"
import { Margin } from "recharts/types/util/types"
import { funnel, isArray, isNumber, isString } from "remeda"

import { ChartContainer } from "@/components/Chart"
import { ChartTooltip } from "@/components/Chart/ChartTooltip"
import {
  AxisLabelCssProps,
  ChartSharedProps,
  TChartData,
} from "@/components/Chart/types"
import {
  getAxisLabelProps,
  getColorSet,
  getConfigWithDefaults,
  getDerivedChartProps,
  pickPrimarySeries,
} from "@/components/Chart/utils"
import { useTheme } from "@/theme"

export type ComposedYAxisConfig = YAxisProps & {
  yAxisId: string
}

type ComposedChartOwnProps<TData extends TChartData> = {
  curveType?: CurveType
  gradient?: "area" | "line" | "all" | "none"
  strokeWidth?: number
  strokeDasharray?: string
  barSize?: number
  barGap?: number
  barCategoryGap?: number | string
  margin?: Margin
  customDot?: (
    props: DotProps & {
      payload: TData
    },
  ) => React.ReactElement<SVGElement>
  referenceLines?: React.ComponentPropsWithoutRef<typeof ReferenceLine>[]
  xAxisLabelProps?: AxisLabelCssProps
  yAxisLabelProps?: AxisLabelCssProps
  /** Explicit dual / multi Y-axis definitions. Falls back to a single YAxis. */
  yAxes?: ComposedYAxisConfig[]
  withoutReferenceLine?: boolean
  withoutTooltip?: boolean
  withoutActiveDot?: boolean
  legend?: ReactNode
  gridStroke?: string
  gridOpacity?: number
  gridStrokeDasharray?: string
  customTooltipContent?: React.ComponentProps<typeof Tooltip>["content"]
  tooltipCursor?: React.ComponentProps<typeof Tooltip>["cursor"]
  tooltipProps?: Omit<
    React.ComponentProps<typeof Tooltip>,
    "content" | "cursor" | "formatter" | "labelFormatter"
  >
}

export type ComposedChartProps<TData extends TChartData> =
  ComposedChartOwnProps<TData> & ChartSharedProps<TData>

export function ComposedChart<TData extends TChartData>({
  data,
  config,
  height,
  aspectRatio,
  horizontalGridHidden = true,
  verticalGridHidden = false,
  gridHorizontalValues,
  gridVerticalValues,
  xAxisHidden = false,
  yAxisHidden = false,
  xAxisProps = {},
  yAxisProps = {},
  xAxisLabel,
  yAxisLabel,
  onCrosshairMove,
  curveType = "natural",
  gradient = "area",
  strokeWidth = 2,
  strokeDasharray,
  barSize,
  barGap,
  barCategoryGap,
  margin: marginProp,
  customDot,
  referenceLines = [],
  xAxisLabelProps,
  yAxisLabelProps,
  yAxes,
  withoutReferenceLine,
  withoutTooltip,
  legend,
  gridStroke,
  gridOpacity,
  gridStrokeDasharray,
  withoutActiveDot,
  customTooltipContent,
  tooltipCursor,
  tooltipProps,
}: ComposedChartProps<TData>) {
  const { series, xAxisKey } = getConfigWithDefaults(config)
  const { themeProps: theme } = useTheme()
  const chartId = useId()

  const primarySeries = pickPrimarySeries(config)
  const primarySeriesKey = primarySeries?.key

  const [activePointValue, setActivePointValue] = useState<number | null>(null)

  const { call: onMouseMove } = useMemo(() => {
    if (withoutReferenceLine && !onCrosshairMove) {
      return {
        call: undefined,
      }
    }

    return funnel(
      (chartState: Parameters<CategoricalChartFunc>[0]) => {
        const index = Number(chartState?.activeTooltipIndex)

        if (Number.isNaN(index)) {
          return onCrosshairMove?.(null)
        }

        const activeData = data[index]

        if (
          isString(primarySeriesKey) &&
          isNumber(activeData?.[primarySeriesKey])
        ) {
          setActivePointValue(activeData[primarySeriesKey])
          onCrosshairMove?.(activeData)
        }
      },
      {
        minGapMs: 200,
        triggerAt: "start",
        reducer: (_, next: Parameters<CategoricalChartFunc>[0]) => next,
      },
    )
  }, [withoutReferenceLine, onCrosshairMove, primarySeriesKey, data])

  const onMouseLeave = useCallback(() => {
    if (withoutReferenceLine && !onCrosshairMove) return
    setActivePointValue(null)
    onCrosshairMove?.(null)
  }, [withoutReferenceLine, onCrosshairMove])

  const {
    margin: derivedMargin,
    labelFormatter,
    tooltipFormatter,
    valueFormatter,
    tooltipWrapperStyles,
  } = getDerivedChartProps(config)

  const margin = marginProp ?? derivedMargin

  const isAreaGradientFill = gradient === "area" || gradient === "all"
  const isLineGradientFill = gradient === "line" || gradient === "all"

  const defaultTooltipCursor = {
    shapeRendering: "crispEdges" as const,
    stroke: theme.text.low,
    strokeWidth: 1,
    strokeDasharray: "6 6",
  }

  return (
    <ChartContainer config={config} height={height} aspectRatio={aspectRatio}>
      <ComposedChartPrimitive
        accessibilityLayer
        data={data}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        margin={margin}
        barSize={barSize}
        barGap={barGap}
        barCategoryGap={barCategoryGap}
      >
        <CartesianGrid
          horizontal={!horizontalGridHidden}
          vertical={!verticalGridHidden}
          shapeRendering="crispEdges"
          horizontalValues={gridHorizontalValues}
          verticalValues={gridVerticalValues}
          stroke={gridStroke ?? theme.text.low}
          opacity={gridOpacity ?? 0.15}
          strokeWidth={1}
          strokeDasharray={gridStrokeDasharray}
        />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          shapeRendering="crispEdges"
          domain={["dataMin", "dataMax"]}
          style={{ fontSize: 12, fill: theme.text.medium }}
          tickFormatter={labelFormatter}
          hide={xAxisHidden}
          {...xAxisProps}
          label={getAxisLabelProps(xAxisLabel, false, xAxisLabelProps)}
        />
        <Label />
        {yAxes?.length ? (
          yAxes.map(({ yAxisId, ...axisProps }) => (
            <YAxis
              key={yAxisId}
              yAxisId={yAxisId}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              style={{ fontSize: 12, fill: theme.text.medium }}
              allowDataOverflow
              tickFormatter={valueFormatter}
              hide={yAxisHidden}
              {...axisProps}
            />
          ))
        ) : (
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            style={{ fontSize: 12, fill: theme.text.medium }}
            allowDataOverflow
            tickFormatter={valueFormatter}
            hide={yAxisHidden}
            {...yAxisProps}
            label={getAxisLabelProps(yAxisLabel, true, yAxisLabelProps)}
          />
        )}
        {!withoutTooltip && (
          <Tooltip
            content={customTooltipContent ?? ChartTooltip}
            labelFormatter={tooltipFormatter}
            formatter={(value) => {
              if (valueFormatter && isNumber(value)) {
                return valueFormatter(value)
              }
              return value
            }}
            wrapperStyle={tooltipWrapperStyles}
            cursor={tooltipCursor ?? defaultTooltipCursor}
            {...tooltipProps}
          />
        )}
        {!withoutReferenceLine && (
          <ReferenceLine
            y={activePointValue ?? 0}
            yAxisId={primarySeries?.yAxisId}
            stroke={theme.text.low}
            strokeDasharray="6 6"
            opacity={activePointValue !== null ? 1 : 0}
            shapeRendering="crispEdges"
          />
        )}
        {series.map((seriesItem) => {
          const {
            key,
            color,
            label,
            type = "area",
            yAxisId,
            curveType: seriesCurveType,
            stackId,
            barSize: seriesBarSize,
            fillOpacity,
            strokeOpacity,
            strokeWidth: seriesStrokeWidth,
            strokeDasharray: seriesStrokeDasharray,
            connectNulls,
            radius = [4, 4, 0, 0],
            withoutDot,
            withoutActiveDot: seriesWithoutActiveDot,
            hideFill,
            hideStroke,
          } = seriesItem

          const colors = getColorSet(color, theme.details.chart)
          const stopOpacity1 = (isArray(color) ? color[2] : undefined) ?? 1
          const stopOpacity2 =
            (isArray(color) ? color[3] : undefined) ??
            (colors.primary === colors.secondary ? 0 : 1)
          const gradientId = `${chartId}-${key}-gradient`
          const resolvedCurveType = seriesCurveType ?? curveType
          const resolvedStrokeWidth = seriesStrokeWidth ?? strokeWidth
          const resolvedStrokeDasharray =
            seriesStrokeDasharray ?? strokeDasharray
          const showActiveDot = !(
            seriesWithoutActiveDot ??
            withoutActiveDot ??
            false
          )

          if (type === "bar") {
            return (
              <Bar
                key={key}
                dataKey={key}
                name={label}
                yAxisId={yAxisId}
                fill={colors.primary}
                fillOpacity={fillOpacity}
                barSize={seriesBarSize}
                radius={radius}
                stackId={stackId}
                shapeRendering="geometricPrecision"
                animationDuration={600}
              />
            )
          }

          if (type === "line") {
            return (
              <Fragment key={key}>
                {(isLineGradientFill || isAreaGradientFill) && (
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={colors.primary}
                        stopOpacity={stopOpacity1}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors.secondary}
                        stopOpacity={stopOpacity2}
                      />
                    </linearGradient>
                  </defs>
                )}
                <Line
                  dataKey={key}
                  name={label}
                  yAxisId={yAxisId}
                  type={resolvedCurveType}
                  strokeWidth={resolvedStrokeWidth}
                  strokeDasharray={resolvedStrokeDasharray}
                  strokeOpacity={strokeOpacity}
                  stroke={
                    hideStroke
                      ? "transparent"
                      : isLineGradientFill
                        ? `url(#${gradientId})`
                        : colors.primary
                  }
                  dot={withoutDot ? false : customDot}
                  activeDot={
                    showActiveDot ? { fill: colors.primary, r: 5 } : false
                  }
                  connectNulls={connectNulls}
                  animationDuration={600}
                />
              </Fragment>
            )
          }

          return (
            <Fragment key={key}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.primary}
                    stopOpacity={stopOpacity1}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.secondary}
                    stopOpacity={stopOpacity2}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey={key}
                name={label}
                yAxisId={yAxisId}
                type={resolvedCurveType}
                strokeWidth={resolvedStrokeWidth}
                strokeDasharray={resolvedStrokeDasharray}
                strokeOpacity={strokeOpacity}
                fillOpacity={fillOpacity ?? 0.4}
                fill={
                  hideFill || !isAreaGradientFill
                    ? "none"
                    : `url(#${gradientId})`
                }
                stroke={
                  hideStroke
                    ? "transparent"
                    : isLineGradientFill
                      ? `url(#${gradientId})`
                      : colors.primary
                }
                dot={withoutDot ? false : (customDot ?? false)}
                activeDot={
                  showActiveDot ? { fill: colors.primary, r: 4 } : false
                }
                stackId={stackId}
                connectNulls={connectNulls}
                animationDuration={600}
              />
            </Fragment>
          )
        })}
        {referenceLines.map((props) => (
          <ReferenceLine key={props.x} shapeRendering="crispEdges" {...props} />
        ))}
        {legend}
      </ComposedChartPrimitive>
    </ChartContainer>
  )
}
