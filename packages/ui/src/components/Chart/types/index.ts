import { ThemeUICSSProperties } from "@theme-ui/css"
import { XAxisProps, YAxisProps } from "recharts"
import { BaseAxisProps } from "recharts/types/util/types"

export type TChartData = Record<string, unknown>

type ExtractDataKeyOfType<TData extends TChartData, TType> = {
  [K in keyof TData]: TData[K] extends TType ? K : never
}[keyof TData] &
  string

export type ChartSeriesType = "time" | "number" | "category"
export type ChartTooltipType = "none" | "legend" | "timeTop" | "timeBottom"

export type ChartConfig<TData extends TChartData> = {
  xAxisKey: keyof TData & string
  xAxisType?: ChartSeriesType
  xAxisFormatter?: (value: TData[keyof TData]) => string
  tooltipFormatter?: (value: TData[keyof TData]) => string

  yAxisType?: ChartSeriesType
  yAxisFormatter?: (value: number) => string

  tooltipType?: ChartTooltipType

  seriesLabel?: string
  series: {
    key: ExtractDataKeyOfType<TData, number>
    label?: string
    color?:
      | string
      | [string, string]
      | [string, string, stopOpacity?: number, opacity?: number]
  }[]
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
