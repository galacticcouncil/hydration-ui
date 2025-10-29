import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { ReactNode, useId, useState } from "react"
import {
  Area,
  AreaChart as AreaChartPrimitive,
  CartesianGrid,
  DotProps,
  Label,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CategoricalChartFunc } from "recharts/types/chart/types"
import { CurveType } from "recharts/types/shape/Curve"
import { isNumber, isString } from "remeda"

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

type AreaChartOwnProps<TData extends TChartData> = {
  curveType?: CurveType
  gradient?: "area" | "line" | "all" | "none"
  strokeWidth?: number
  customDot?: (
    props: DotProps & {
      payload: TData
    },
  ) => React.ReactElement<SVGElement>
  referenceLines?: React.ComponentPropsWithoutRef<typeof ReferenceLine>[]
  xAxisLabelProps?: AxisLabelCssProps
  yAxisLabelProps?: AxisLabelCssProps
  withoutReferenceLine?: boolean
  withoutTooltip?: boolean
  legend?: ReactNode
}

export type AreaChartProps<TData extends TChartData> =
  AreaChartOwnProps<TData> & ChartSharedProps<TData>

export function AreaChart<TData extends TChartData>({
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
  customDot,
  referenceLines = [],
  xAxisLabelProps,
  yAxisLabelProps,
  withoutReferenceLine,
  withoutTooltip,
  legend,
}: AreaChartProps<TData>) {
  const { series, xAxisKey } = getConfigWithDefaults(config)
  const { themeProps: theme } = useTheme()
  const chartId = useId()

  const primarySeries = pickPrimarySeries(config)
  const primarySeriesKey = primarySeries?.key

  const [activePointValue, setActivePointValue] = useState<number | null>(null)

  const onMouseMove: CategoricalChartFunc = (chartState) => {
    const index = Number(chartState?.activeTooltipIndex)

    if (Number.isNaN(index)) {
      return onCrosshairMove?.(null)
    }

    const activeData = data[index]

    if (isString(primarySeriesKey) && isNumber(activeData[primarySeriesKey])) {
      setActivePointValue(activeData[primarySeriesKey])
      onCrosshairMove?.(activeData)
    }
  }

  const {
    margin,
    labelFormatter,
    tooltipFormatter,
    valueFormatter,
    tooltipWrapperStyles,
  } = getDerivedChartProps(config)

  const isAreaGradientFill = gradient === "area" || gradient === "all"
  const isLineGradientFill = gradient === "line" || gradient === "all"

  return (
    <ChartContainer config={config} height={height} aspectRatio={aspectRatio}>
      <AreaChartPrimitive
        accessibilityLayer
        data={data}
        onMouseMove={onMouseMove}
        onMouseLeave={() => {
          setActivePointValue(null)
          onCrosshairMove?.(null)
        }}
        margin={margin}
      >
        <CartesianGrid
          horizontal={!horizontalGridHidden}
          vertical={!verticalGridHidden}
          shapeRendering="crispEdges"
          horizontalValues={gridHorizontalValues}
          verticalValues={gridVerticalValues}
          stroke={theme.text.low}
          opacity={0.15}
          strokeWidth={1}
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
        {!withoutTooltip && (
          <Tooltip
            content={ChartTooltip}
            labelFormatter={tooltipFormatter}
            formatter={(value) => {
              if (valueFormatter && isNumber(value)) {
                return valueFormatter(value)
              }
              return value
            }}
            wrapperStyle={tooltipWrapperStyles}
            cursor={{
              shapeRendering: "crispEdges",
              stroke: theme.text.low,
              strokeWidth: 1,
              strokeDasharray: "6 6",
            }}
          />
        )}
        {!withoutReferenceLine && (
          <ReferenceLine
            y={activePointValue ?? 0}
            stroke={theme.text.low}
            strokeDasharray="6 6"
            opacity={activePointValue ? 1 : 0}
            shapeRendering="crispEdges"
          />
        )}
        {series.map(({ key, color }) => {
          const colors = getColorSet(color, theme.details.chart)
          const stopOpacity1 = color?.[2] ?? 1
          const stopOpacity2 =
            color?.[3] ?? (colors.primary === colors.secondary ? 0 : 1)

          const gradientId = `${chartId}-${key}-gradient`

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
                type={curveType}
                strokeWidth={strokeWidth}
                fill={isAreaGradientFill ? `url(#${gradientId})` : "none"}
                fillOpacity={0.4}
                stroke={
                  isLineGradientFill ? `url(#${gradientId})` : colors.primary
                }
                dot={customDot}
                activeDot={{ fill: colors.primary, r: 5 }}
                stackId="a"
                animationDuration={600}
              />
            </Fragment>
          )
        })}
        {referenceLines.map((props) => (
          <ReferenceLine key={props.x} shapeRendering="crispEdges" {...props} />
        ))}
        {legend}
      </AreaChartPrimitive>
    </ChartContainer>
  )
}
