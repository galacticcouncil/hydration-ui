import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { PieTotalValue } from "../PieTotalValue/PieTotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { SContainerVertical } from "../../StatsOverview.styled"
import { TOmnipoolOverviewData } from "../../data/OmnipoolOverview.utils"
import { BN_0 } from "utils/constants"
import { ChartWrapper } from "../ChartWrapper/ChartWrapper"

type PieWrapperProps = {
  data: TOmnipoolOverviewData
  isLoading: boolean
}

export const PieWrapper = ({ data, isLoading }: PieWrapperProps) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const { totalTvl, totalPol, totalVolume } = useMemo(() => {
    return data.reduce(
      (acc, omnipoolAsset) => {
        acc = {
          totalTvl: acc.totalTvl.plus(omnipoolAsset.tvl),
          totalPol: acc.totalPol.plus(omnipoolAsset.pol),
          totalVolume: acc.totalVolume.plus(omnipoolAsset.volume),
        }
        return acc
      },
      { totalTvl: BN_0, totalPol: BN_0, totalVolume: BN_0 },
    )
  }, [data])

  return (
    <SContainerVertical>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        !isLoading ? (
          <PieChart data={data} />
        ) : (
          <PieSkeleton />
        )
      ) : (
        <ChartWrapper />
      )}

      <div sx={{ flex: "column", gap: 20 }}>
        <PieTotalValue
          title="Total value locked"
          data={totalTvl}
          isLoading={isLoading}
        />
        <div
          sx={{
            flex: ["row", "column"],
            justify: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <PieTotalValue
            title="HydraDx POL"
            data={totalPol}
            isLoading={isLoading}
          />
          <PieTotalValue
            title="24 volume"
            data={totalVolume.div(2)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </SContainerVertical>
  )
}
