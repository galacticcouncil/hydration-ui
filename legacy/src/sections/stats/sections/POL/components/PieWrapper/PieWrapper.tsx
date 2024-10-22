import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { PieTotalValue } from "sections/stats/sections/overview/components/PieTotalValue/PieTotalValue"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"
import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { useTranslation } from "react-i18next"
import { omit } from "utils/rx"
import { ChartsWrapper } from "sections/stats/sections/POL/components/ChartsWrapper/ChartsWrapper"
import BN from "bignumber.js"

type PieWrapperProps = {
  data: TUseOmnipoolAssetDetailsData
  POLMultiplier: BN
  totalVolume: BN
  totalPol: BN
  isLoading: boolean
}

export const PieWrapper = ({
  data,
  POLMultiplier,
  totalPol,
  totalVolume,
  isLoading,
}: PieWrapperProps) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const pieChartData = useMemo(
    () => data.map((props) => omit(["iconIds"], props)),
    [data],
  )

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <PieTotalValue
        title={t("stats.pol.total")}
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
          title={t("stats.pol.volume")}
          data={totalVolume.div(2).multipliedBy(POLMultiplier)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical
      sx={{
        width: ["100%", "fit-content"],
        p: [20, 40],
      }}
    >
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        <>
          {!isLoading ? (
            <PieChart data={pieChartData} property="pol" />
          ) : (
            <PieSkeleton />
          )}
          {pieChartValues}
        </>
      ) : (
        <div
          sx={{
            flex: "column",
            height: [500, "100%"],
            gap: [24, 40],
            pt: [40, 0],
          }}
        >
          <ChartsWrapper POLMultiplier={POLMultiplier} />
        </div>
      )}
    </SContainerVertical>
  )
}
