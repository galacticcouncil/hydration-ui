import { StatsTimeframe, useStats } from "api/stats"
import { BarChart } from "components/Charts/BarChart/BarChart"
import { AreaChart } from "components/Charts/AreaChart/AreaChart"
import { ChartType } from "./ChartsWrapper"

export const Charts = ({
  type,
  timeframe,
  assetId,
}: {
  type: ChartType
  timeframe: StatsTimeframe
  assetId?: string
}) => {
  const stats = useStats({
    timeframe,
    assetId,
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
      dataKey="tvl_usd"
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
      timeframe={timeframe}
    />
  )
}
