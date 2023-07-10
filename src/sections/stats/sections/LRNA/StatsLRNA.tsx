import { useApiPromise } from "utils/api"
import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { isApiLoaded } from "utils/helpers"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsLRNA.styled"
import { RecentTradesTableWrapper } from "./components/RecentTradesTable/RecentTradesTableWrapper"
import { StatsTiles } from "./components/StatsTiles/StatsTiles"
import { PieChart } from "./components/PieChart/PieChart"
import { Distribution } from './components/Distribution/Distribution'

const StatsLRNAData = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flex: "column", gap: 50 }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <Distribution />
        {isDesktop && (
          <SContainerVertical
            sx={{
              width: "100%",
              p: 24,
            }}
          >
            <ChartWrapper />
          </SContainerVertical>
        )}
      </div>
      <SContainerVertical sx={{ width: "100%", p: 40 }}>
        <PieChart percentage={20} loading={false} />
      </SContainerVertical>
      <StatsTiles />
      <RecentTradesTableWrapper />
    </div>
  )
}

export const StatsLRNA = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) {
    return null
  }

  return <StatsLRNAData />
}
