import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartsWrapper } from "./components/ChartsWrapper/ChartsWrapper"
// TODO: Not ready. Requested in #861n9ffe4
// import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
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
              p: 24,
              justify: "space-between",
              flexGrow: 3,
              gap: 20,
            }}
          >
            <ChartsWrapper />
          </SContainerVertical>
        )}
      </div>
      {/*TODO: Not ready. Requested in #861n9ffe4*/}
      {/*<StatsTiles />*/}
      <OmnipoolAssetsTableWrapper />
    </div>
  )
}
