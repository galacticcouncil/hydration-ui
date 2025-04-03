import { createContext, useContext, useId } from "react"
import { ResponsiveContainer } from "recharts"
import { isArray, isNonNull, isObjectType, isString } from "remeda"

import { SChartContainer } from "@/components/Chart/ChartContainer.styled"
import {
  ChartConfig,
  ChartContextProps,
  ChartSizeProps,
  TChartData,
} from "@/components/Chart/types"
import { getConfigWithDefaults } from "@/components/Chart/utils"

const ChartContext = createContext<ChartContextProps<TChartData> | null>(null)

export function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  const config = getConfigWithDefaults(context.config)
  return { ...context, config }
}

const isConfigValid = <TData extends TChartData>(
  config: unknown,
): config is ChartConfig<TData> => {
  return (
    isNonNull(config) &&
    isObjectType(config) &&
    isString((config as Partial<ChartConfig<TData>>).xAxisKey) &&
    isArray((config as Partial<ChartConfig<TData>>).series)
  )
}

export type ChartContainerProps<TData extends TChartData> =
  React.ComponentProps<"div"> & {
    config: ChartConfig<TData>
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  } & ChartSizeProps

export function ChartContainer<TData extends TChartData>({
  id,
  children,
  config,
  height = "100%",
  aspectRatio,
  ...props
}: ChartContainerProps<TData>) {
  const uniqueId = useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  if (!isConfigValid(config)) {
    throw new Error(`Invalid chart ${chartId} configuration`)
  }

  const sizeProps = aspectRatio ? { aspectRatio } : { height }

  return (
    <ChartContext.Provider value={{ config }}>
      <SChartContainer data-chart={chartId} sx={sizeProps} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </SChartContainer>
    </ChartContext.Provider>
  )
}
