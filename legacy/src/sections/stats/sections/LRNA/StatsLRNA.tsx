import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Distribution } from "./components/Distribution/Distribution"
// TODO: Not ready. Requested in #861n9ffe4
// import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { RecentTradesTableWrapper } from "sections/stats/components/RecentTradesTable/RecentTradesTableWrapper"
import { StatusBar } from "./sections/StatusBar"
import { SContainerVertical } from "sections/stats/StatsPage.styled"

export const StatsLRNA = () => {
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
      <StatusBar />
      {/* TODO: Not ready. Requested in #861n9ffe4 */}
      {/*<StatsTiles />*/}
      <RecentTradesTableWrapper />
    </div>
  )
}
