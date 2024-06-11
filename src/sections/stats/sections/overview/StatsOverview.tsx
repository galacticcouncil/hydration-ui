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
import { Spacer } from "components/Spacer/Spacer"
import { StatsTabs } from "sections/stats/components/tabs/StatsTabs"

export const StatsOverview = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const omnipoolOverview = useOmnipoolAssetDetails("tvl")

  return (
    <>
      <Spacer size={[20, 30]} />
      <StatsTabs />
      <Spacer size={30} />
      <div sx={{ flex: "column", gap: [24, 50] }}>
        <div sx={{ flex: "row", gap: 20, height: ["auto", 690] }}>
          <PieWrapper
            data={[...omnipoolOverview.data].reverse()}
            isLoading={omnipoolOverview.isLoading}
            sx={{
              p: [20, 40],
              width: ["100%", 420],
              minWidth: 0,
            }}
          />
          {isDesktop && (
            <SContainerVertical
              sx={{
                p: 24,
                justify: "space-between",
                flexGrow: 1,
                minWidth: 0,
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
    </>
  )
}
