import { useApiPromise } from "utils/api"
import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { OmnipoolAssetsTableWrapper } from "./components/OmnipoolAssetsTable/OmnipoolAssetsTableWrapper"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { StatsTiles } from "./components/tiles/StatsTiles"
import { isApiLoaded } from "utils/helpers"
import { useOmnipoolOverviewData } from "./data/OmnipoolOverview.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsOverview.styled"
import { RecentTradesTableWrapper } from "./components/RecentTradesTable/RecentTradesTableWrapper"

export const StatsOverviewData = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const omnipoolOverview = useOmnipoolOverviewData()

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

      <OmnipoolAssetsTableWrapper />

      <RecentTradesTableWrapper />
    </div>
  )
}

export const StatsOverview = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return <StatsOverviewData />
}
