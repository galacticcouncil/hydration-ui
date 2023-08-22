import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { BN_0 } from "utils/constants"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { SContainerVertical } from "sections/stats/sections/POL/StatsPOL.styled"
import { PieTotalValue } from "sections/stats/sections/overview/components/PieTotalValue/PieTotalValue"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"
import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { useTranslation } from "react-i18next"

type PieWrapperProps = {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
}

export const PieWrapper = ({ data, isLoading }: PieWrapperProps) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const { totalVolume, totalPol } = useMemo(
    () =>
      data.reduce(
        (acc, omnipoolAsset) => ({
          totalPol: acc.totalPol.plus(omnipoolAsset.pol),
          totalVolume: acc.totalVolume.plus(omnipoolAsset.volume),
        }),
        { totalPol: BN_0, totalVolume: BN_0 },
      ),
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
          data={totalVolume}
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
