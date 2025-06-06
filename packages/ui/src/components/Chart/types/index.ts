import { ThemeUICSSProperties } from "@theme-ui/css"
import { XAxisProps, YAxisProps } from "recharts"
import { BaseAxisProps } from "recharts/types/util/types"

export type TChartData = Array<Record<string, unknown>>

export type ExtractDataKey<TData extends TChartData> = Extract<
  keyof TData[number],
  string
>

export type ChartSeriesType = "time" | "number" | "category"
export type ChartTooltipType = "none" | "legend" | "timeTop" | "timeBottom"

export type ChartConfig<TData extends TChartData> = {
  xAxisKey: ExtractDataKey<TData>
  xAxisType?: ChartSeriesType
  xAxisFormatter?: (value: TData[number][ExtractDataKey<TData>]) => string

  yAxisType?: ChartSeriesType
  yAxisFormatter?: (value: number) => string

  tooltipType?: ChartTooltipType

  seriesLabel?: string
  series: {
    key: ExtractDataKey<TData>
    label: string
    color?: string | [string, string]
  }[]
}

export type ChartSizeProps = {
  height?: ThemeUICSSProperties["height"]
  aspectRatio?: ThemeUICSSProperties["aspectRatio"]
}

export type ChartSharedProps<TData extends TChartData> = {
  config: ChartConfig<TData>
  data: TData
  horizontalGridHidden?: boolean
  verticalGridHidden?: boolean
  xAxisHidden?: boolean
  xAxisProps?: XAxisProps
  xAxisLabel?: BaseAxisProps["label"]
  yAxisHidden?: boolean
  yAxisProps?: YAxisProps
  yAxisLabel?: BaseAxisProps["label"]
  onCrosshairMove?: (data: TData[number] | null) => void
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
  fill?: string
}
