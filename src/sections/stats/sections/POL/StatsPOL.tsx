import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartsWrapper } from "./components/ChartsWrapper/ChartsWrapper"
import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { SContainerVertical } from "./StatsPOL.styled"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { OmnipoolAssetsTableWrapper } from "./components/OmnipoolAssetsTableWrapper/OmnipoolAssetsTableWrapper"

export const StatsPOL = () => {
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
