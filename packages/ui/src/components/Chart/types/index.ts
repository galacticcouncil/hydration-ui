import { ThemeUICSSProperties } from "@theme-ui/css"
import { XAxisProps, YAxisProps } from "recharts"
import { CurveType } from "recharts/types/shape/Curve"
import { BaseAxisProps } from "recharts/types/util/types"

export type TChartData = Record<string, unknown>

type ExtractDataKeyOfType<TData extends TChartData, TType> = {
  [K in keyof TData]: TData[K] extends TType | null | undefined ? K : never
}[keyof TData] &
  string

export type ChartSeriesType = "time" | "number" | "category"
export type ChartTooltipType = "none" | "legend" | "timeTop" | "timeBottom"
export type ChartSeriesRenderType = "area" | "bar" | "line"

export type ChartSeriesConfig<TData extends TChartData> = {
  key: ExtractDataKeyOfType<TData, number>
  label?: string
  color?:
    | string
    | [string, string]
    | [string, string, stopOpacity?: number, opacity?: number]
  /** Series render type for ComposedChart. Ignored by AreaChart / BarChart. */
  type?: ChartSeriesRenderType
  /** Secondary / dual axis id for ComposedChart. */
  yAxisId?: string
  curveType?: CurveType
  stackId?: string
  barSize?: number
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
  strokeDasharray?: string
  connectNulls?: boolean
  radius?: number | [number, number, number, number]
  withoutDot?: boolean
  withoutActiveDot?: boolean
  /** Hide area/line fill (stroke only). */
  hideFill?: boolean
  /** Hide area/line stroke (fill only). */
  hideStroke?: boolean
}

export type ChartConfig<TData extends TChartData> = {
  xAxisKey: keyof TData & string
  xAxisType?: ChartSeriesType
  xAxisFormatter?: (value: TData[keyof TData]) => string
  tooltipFormatter?: (value: TData[keyof TData]) => string

  yAxisType?: ChartSeriesType
  yAxisFormatter?: (value: number) => string

  tooltipType?: ChartTooltipType

  seriesLabel?: string
  series: ChartSeriesConfig<TData>[]
}

export type ChartSizeProps = {
  height?: ThemeUICSSProperties["height"]
  aspectRatio?: ThemeUICSSProperties["aspectRatio"]
}

export type ChartSharedProps<TData extends TChartData> = {
  config: ChartConfig<TData>
  data: Array<TData>
  horizontalGridHidden?: boolean
  verticalGridHidden?: boolean
  gridHorizontalValues?: number[] | string[]
  gridVerticalValues?: number[] | string[]
  xAxisHidden?: boolean
  xAxisProps?: XAxisProps
  xAxisLabel?: BaseAxisProps["label"]
  yAxisHidden?: boolean
  yAxisProps?: YAxisProps
  yAxisLabel?: BaseAxisProps["label"]
  onCrosshairMove?: (data: TData | null) => void
} & ChartSizeProps

export type ChartContextProps<TData extends TChartData> = {
  config: ChartConfig<TData>
}

export type AxisLabelCssProps = {
  position?: string
  angle?: number
  dy?: number
  dx?: number
  fontSize?: number
  lineHeight?: number
  fontWeight?: number
  fill?: string
}
