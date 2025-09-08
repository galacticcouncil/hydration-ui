import {
  Bar,
  BarChart as BarChartPrimitive,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CartesianLayout } from "recharts/types/util/types"
import { isNumber } from "remeda"

import { ChartContainer } from "@/components/Chart"
import { ChartTooltip } from "@/components/Chart/ChartTooltip"
import { ChartSharedProps, TChartData } from "@/components/Chart/types"
import {
  getAxisLabelProps,
  getBarSeriesBorderRadius,
  getColorSet,
  getConfigWithDefaults,
  getDerivedChartProps,
} from "@/components/Chart/utils"
import { useTheme } from "@/theme"

type BarChartOwnProps = {
  layout?: CartesianLayout
  barSize?: number
  barGap?: number
  barCategoryGap?: number
  stacked?: boolean
}

export type BarChartProps<TData extends TChartData> = BarChartOwnProps &
  ChartSharedProps<TData>

export function BarChart<TData extends TChartData>({
  config,
  data,
  height,
  aspectRatio,
  horizontalGridHidden = true,
  verticalGridHidden = false,
  xAxisHidden = false,
  yAxisHidden = false,
  xAxisProps = {},
  yAxisProps = {},
  xAxisLabel,
  yAxisLabel,
  onCrosshairMove,
  layout,
  barSize,
  barGap,
  barCategoryGap,
  stacked = false,
}: BarChartProps<TData>) {
  const { series, xAxisKey } = getConfigWithDefaults(config)

  const { themeProps: theme } = useTheme()

  const { margin, labelFormatter, valueFormatter, tooltipWrapperStyles } =
    getDerivedChartProps(config)

  const isVerticalLayout = layout === "vertical"

  return (
    <ChartContainer config={config} height={height} aspectRatio={aspectRatio}>
      <BarChartPrimitive
        accessibilityLayer
        data={data}
        barSize={barSize}
        barGap={barGap}
        barCategoryGap={barCategoryGap}
        layout={layout}
        margin={margin}
        onMouseMove={(chartState) => {
          if (
            chartState &&
            chartState.activeTooltipIndex !== undefined &&
            chartState.activeTooltipIndex !== null &&
            series.length > 0
          ) {
            const activeData = data[chartState.activeTooltipIndex as number]
            onCrosshairMove?.(activeData)
          }
        }}
        onMouseLeave={() => onCrosshairMove?.(null)}
      >
        <CartesianGrid
          horizontal={!horizontalGridHidden}
          vertical={!verticalGridHidden}
          shapeRendering="crispEdges"
          stroke={theme.text.low}
          opacity={0.15}
          strokeWidth={1}
        />
        <XAxis
          dataKey={isVerticalLayout ? undefined : xAxisKey}
          type={isVerticalLayout ? "number" : "category"}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          shapeRendering="crispEdges"
          tickFormatter={isVerticalLayout ? valueFormatter : labelFormatter}
          hide={xAxisHidden}
          {...xAxisProps}
          label={getAxisLabelProps(
            isVerticalLayout ? yAxisLabel : xAxisLabel,
            false,
          )}
        />
        <YAxis
          dataKey={isVerticalLayout ? xAxisKey : undefined}
          type={isVerticalLayout ? "category" : "number"}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={isVerticalLayout ? labelFormatter : valueFormatter}
          hide={yAxisHidden}
          {...yAxisProps}
          label={getAxisLabelProps(
            isVerticalLayout ? xAxisLabel : yAxisLabel,
            true,
          )}
        />
        <Tooltip
          content={ChartTooltip}
          labelFormatter={labelFormatter}
          formatter={(value) => {
            if (valueFormatter && isNumber(value)) {
              return valueFormatter(value)
            }
            return value
          }}
          wrapperStyle={tooltipWrapperStyles}
          cursor={{
            fill: theme.text.low,
            fillOpacity: 0.1,
            strokeWidth: 0,
            shapeRendering: "crispEdges",
          }}
        />
        {series.map(({ key, color }, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getColorSet(color, theme.details.chart).primary}
            radius={getBarSeriesBorderRadius(
              index,
              series.length - 1,
              stacked,
              isVerticalLayout,
            )}
            shapeRendering="geometricPrecision"
            animationDuration={600}
            stackId={stacked ? "stack" : key}
          />
        ))}
      </BarChartPrimitive>
    </ChartContainer>
  )
}
