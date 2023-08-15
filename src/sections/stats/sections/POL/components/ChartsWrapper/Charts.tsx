import { StatsTimeframe, useStats } from "api/stats"
import { BarChart } from "components/Charts/BarChart/BarChart"
import { AreaChart } from "components/Charts/AreaChart/AreaChart"
import { ChartType } from "./ChartsWrapper"

export const Charts = ({
  type,
  timeframe,
  assetSymbol,
}: {
  type: ChartType
  timeframe: StatsTimeframe
  assetSymbol?: string
}) => {
  const stats = useStats({
    timeframe,
    assetSymbol,
    type,
  })

  return type === "volume" ? (
    <BarChart
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
      timeframe={timeframe}
    />
  ) : (
    <AreaChart
      dataKey="tvl_pol_usd"
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
      timeframe={timeframe}
    />
  )
}
