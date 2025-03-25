import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Spacer } from "components/Spacer/Spacer"
import { useMedia } from "react-use"
import { StatsTabs } from "sections/stats/components/tabs/StatsTabs"
import { VerticalBarChart } from "sections/stats/sections/overview/components/VerticalBarChart/VerticalBarChart"
import {
  SStatsContainer,
  SContainer,
} from "sections/stats/sections/overview/StatsOverview.styled"
import { theme } from "theme"

export type StatsOverviewProps = {}

const DATA = [
  {
    value: 30000000,
    label: "Stablepool",
    color: "#3DFDA4",
  },

  {
    value: 40000000,
    label: "Omnipool",
    color: "#FF2982",
  },
  {
    value: 15000000,
    label: "Money Market",
    color: "#05C5FF",
  },
  {
    value: 20000000,
    label: "Isolated pools",
    color: "#564FB2",
  },
  {
    value: 8000000,
    label: "Treasury",
    color: "#FFA629",
  },
]

export const StatsOverview: React.FC<StatsOverviewProps> = () => {
  const isSmallMedia = useMedia(theme.viewport.lt.md)
  return (
    <>
      <Spacer size={[20, 30]} />
      <StatsTabs />
      <Spacer size={30} />
      <SContainer>
        <DataValue
          labelColor="brightBlue300"
          label="Hydration TVL"
          size="extra-large"
        >
          <DisplayValue value={1000000} isUSD />
        </DataValue>
        <VerticalBarChart data={DATA} />
        <SStatsContainer columns={isSmallMedia ? 2 : 3}>
          {DATA.map(({ value, label }) => (
            <DataValue
              labelColor="brightBlue300"
              label={label}
              size="extra-large"
            >
              <DisplayValue value={value} isUSD />
            </DataValue>
          ))}
          <DataValue
            labelColor="brightBlue300"
            label="24h Volume"
            size="extra-large"
          >
            <DisplayValue value={13000000} isUSD />
          </DataValue>
        </SStatsContainer>
      </SContainer>
    </>
  )
}
