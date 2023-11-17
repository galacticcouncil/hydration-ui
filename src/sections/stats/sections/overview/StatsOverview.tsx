import { PieWrapper } from "./components/PieWrapper/PieWrapper"
// TODO: Not ready. Requested in #861n9ffe4
// import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { useMedia } from "react-use"
import { theme } from "theme"
import { RecentTradesTableWrapper } from "sections/stats/components/RecentTradesTable/RecentTradesTableWrapper"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { OmnipoolAssetsTableWrapperData } from "./components/OmnipoolAssetsTableWrapper/OmnipoolAssetsTableWrapper"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"

export const StatsOverview = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const omnipoolOverview = useOmnipoolAssetDetails()

  return (
    <div sx={{ flex: "column", gap: [24, 50] }}>
      <div sx={{ flex: "row", gap: 20, height: ["auto", 690] }}>
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

      {/* TODO: Not ready. Requested in #861n9ffe4 */}
      {/*<StatsTiles />*/}
      <OmnipoolAssetsTableWrapperData
        data={omnipoolOverview.data}
        isLoading={omnipoolOverview.isLoading}
      />
      <RecentTradesTableWrapper />
    </div>
  )
}
