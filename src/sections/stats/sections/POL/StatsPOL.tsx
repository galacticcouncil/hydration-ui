import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartsWrapper } from "./components/ChartsWrapper/ChartsWrapper"
import { StatsTiles } from "../../components/StatsTiles/StatsTiles"
import { SContainerVertical } from "./StatsPOL.styled"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { useOmnipoolAssetDetails } from "../../StatsPage.utils"
import { OmnipoolAssetsTableWrapper } from "./components/OmnipoolAssetsTableWrapper/OmnipoolAssetsTableWrapper"

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
            <ChartsWrapper />
          </SContainerVertical>
        )}
      </div>
      <StatsTiles />
      <OmnipoolAssetsTableWrapper />
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
