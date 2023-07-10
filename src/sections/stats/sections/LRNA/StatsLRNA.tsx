import { useApiPromise } from "utils/api"
import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { isApiLoaded } from "utils/helpers"
import { useOmnipoolOverviewData } from "./data/OmnipoolOverview.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsOverview.styled"
import { RecentTradesTableWrapper } from "./components/RecentTradesTable/RecentTradesTableWrapper"
import { StatsTiles } from './components/tiles/StatsTiles'

const StatsLRNAData = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const omnipoolOverview = useOmnipoolOverviewData()

  console.log('-- omnipoolOverview --', omnipoolOverview)

  return (
    <div sx={{ flex: "column", gap: 50 }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <PieWrapper
          data={omnipoolOverview.data}
          isLoading={omnipoolOverview.isLoading}
        />
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
