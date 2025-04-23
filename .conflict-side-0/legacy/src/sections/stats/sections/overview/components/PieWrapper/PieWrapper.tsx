import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { PieTotalValue } from "sections/stats/sections/overview/components/PieTotalValue/PieTotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { BN_0 } from "utils/constants"
import { useTranslation } from "react-i18next"
import { ChartWrapper } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { TUseOmnipoolAssetDetailsData } from "sections/stats/StatsPage.utils"

type PieWrapperProps = {
  data: TUseOmnipoolAssetDetailsData
  isLoading: boolean
  className?: string
}

export const PieWrapper = ({ data, isLoading, className }: PieWrapperProps) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const isLoadingVolume = !!data?.some((pool) => pool.isLoadingVolume)

  const { totalTvl, totalPol, totalVolume } = useMemo(() => {
    return data.reduce(
      (acc, omnipoolAsset) => {
        acc = {
          totalTvl: acc.totalTvl.plus(
            omnipoolAsset.tvl.isNaN() ? 0 : omnipoolAsset.tvl,
          ),
          totalPol: acc.totalPol.plus(omnipoolAsset.pol),
          totalVolume: acc.totalVolume.plus(
            omnipoolAsset.volume.isNaN() ? 0 : omnipoolAsset.volume,
          ),
        }
        return acc
      },
      { totalTvl: BN_0, totalPol: BN_0, totalVolume: BN_0 },
    )
  }, [data])

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <PieTotalValue
        title={t("stats.overview.pie.values.tvl")}
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
        css={{ "& > span": { width: "100%" } }}
      >
        <PieTotalValue
          title={t("stats.overview.pie.values.pol")}
          data={totalPol}
          isLoading={isLoading}
        />
        <PieTotalValue
          title={t("stats.overview.pie.values.volume")}
          data={totalVolume.div(2)}
          isLoading={isLoading || isLoadingVolume}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical className={className}>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        <>
          {!isLoading ? (
            <PieChart data={data} property="tvl" />
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
          <ChartWrapper />
        </div>
      )}
    </SContainerVertical>
  )
}
