import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsLRNA.styled"
import { Distribution } from "./components/Distribution/Distribution"
import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { RecentTradesTableWrapper } from "sections/stats/components/RecentTradesTable/RecentTradesTableWrapper"
import { StatusBar } from "./sections/StatusBar"

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
      <StatsTiles />
      <RecentTradesTableWrapper />
    </div>
  )
}
