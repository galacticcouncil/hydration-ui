import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartWrapper } from "../LRNA/components/ChartWrapper/ChartWrapper"
import { StatsTiles } from "../../components/StatsTiles/StatsTiles"
import { RecentTradesTableWrapper } from "../../components/RecentTradesTable/RecentTradesTableWrapper"
import { SContainerVertical } from "./StatsPOL.styled"
import { PieWrapper } from "./PieWrapper/PieWrapper"
import { useOmnipoolAssetDetails } from "../../StatsPage.utils"

const StatsPOLData = () => {
  const data = useOmnipoolAssetDetails()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flex: "column", gap: 50 }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <PieWrapper data={data.data} isLoading={data.isLoading} />
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

export const StatsPOL = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) {
    return null
  }

  return <StatsPOLData />
}
