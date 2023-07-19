import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { BN_0 } from "utils/constants"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { SContainerVertical } from "../StatsPOL.styled"
import { PieTotalValue } from "../../overview/components/PieTotalValue/PieTotalValue"
import { TUseOmnipoolAssetDetailsData } from "../../../StatsPage.utils"
import { PieChart } from "../../../components/PieChart/PieChart"

type PieWrapperProps = {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
}

export const PieWrapper = ({ data, isLoading }: PieWrapperProps) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const totalPol = useMemo(
    () =>
      Object.values(data ?? {}).reduce(
        (acc, value) => acc.plus(value.pol),
        BN_0,
      ),
    [data],
  )

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <PieTotalValue
        title="Protocol Owned Liquidity"
        data={totalPol}
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
          title="24h volume"
          data={totalPol}
          isLoading={isLoading}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical
      sx={{
        width: ["100%", "fit-content"],
        height: [500, "100%"],
        p: [20, 40],
      }}
    >
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        <>
          {!isLoading ? (
            <PieChart data={data} property="pol" />
          ) : (
            <PieSkeleton />
          )}
          {pieChartValues}
        </>
      ) : (
        <ChartWrapper />
      )}
    </SContainerVertical>
  )
}
