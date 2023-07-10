import { useApiPromise } from "utils/api"
import { ChartWrapper } from "./components/ChartWrapper/ChartWrapper"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { isApiLoaded } from "utils/helpers"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SContainerVertical } from "./StatsOverview.styled"
import { RecentTradesTableWrapper } from "./components/RecentTradesTable/RecentTradesTableWrapper"
import { StatsTiles } from './components/StatsTiles/StatsTiles'
import { PieChart } from './components/PieChart/PieChart'
import BN from 'bignumber.js'

const StatsLRNAData = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flex: "column", gap: 50 }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <PieWrapper
          data={[
            {
              id: "0",
              name: "HDX",
              symbol: "HDX",
              tvl: new BN(1234),
              volume: new BN(0),
              fee: new BN(0),
              pol: new BN(567)
            },
            {
              id: "1",
              name: "Ether (via Wormhole)",
              symbol: "ETH",
              tvl: new BN(890),
              volume: new BN(0),
              fee: new BN(0),
              pol: new BN(123)
            }
          ]}
          isLoading={false}
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
      <SContainerVertical sx={{ width: "100%", p: 40 }}>
        <PieChart percentage={20} loading={false} />
      </SContainerVertical>
      <StatsTiles />
      <RecentTradesTableWrapper />
    </div>
  )
}

export const StatsLRNA = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) {
    return null
  }

  return <StatsLRNAData />
}
