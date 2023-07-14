import { StatsTimeframe, useStats } from "api/stats"
import { ChartType } from "../../ChartWrapper"
import { BarChart } from "components/Charts/BarChart/BarChart"
import { AreaChart } from "components/Charts/AreaChart/AreaChart"

export const Charts = ({
  type,
  timeframe,
}: {
  type: ChartType
  timeframe: StatsTimeframe
}) => {
  const stats = useStats({
    timeframe,
  })
  console.log(stats)
  return type === "volume" ? (
    <BarChart
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
    />
  ) : (
    <AreaChart
      data={stats.data}
      loading={stats.isLoading}
      error={stats.isError}
    />
  )
}
