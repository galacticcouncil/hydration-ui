import { useApiPromise } from "utils/api"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { StatsTiles } from "../../components/StatsTiles/StatsTiles"
import { isApiLoaded } from "utils/helpers"
import { useOmnipoolOverviewData } from "./data/OmnipoolOverview.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsOverview.styled"
import { RecentTradesTableWrapper } from "../../components/RecentTradesTable/RecentTradesTableWrapper"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { OmnipoolAssetsTableWrapper } from "./components/OmnipoolAssetsTableWrapper/OmnipoolAssetsTableWrapper"

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
              p: 24,
              justify: "space-between",
              flexGrow: 3,
              gap: 20,
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
