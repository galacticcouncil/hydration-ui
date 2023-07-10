import { PieTotalValue } from "../PieTotalValue/PieTotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo, useState } from "react"
import { SContainerVertical } from "../../StatsLRNA.styled"
import { BN_0 } from "utils/constants"
import { ChartWrapper } from "../ChartWrapper/ChartWrapper"
import { useTranslation } from "react-i18next"
import BigNumber from 'bignumber.js'
import { PieLabel } from './PieLabel'
import { DoughnutChart } from '../../../../components/DoughnutChart/DoughnutChart'

type PieWrapperProps = {
  data: Array<{
    id: string;
    name: string;
    symbol: string;
    tvl: BigNumber;
    volume: BigNumber;
    fee: BigNumber;
    pol: BigNumber;
  }>
  isLoading: boolean
}

export const PieWrapper = ({ data, isLoading }: PieWrapperProps) => {
  const { t } = useTranslation()
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
      >
        <PieTotalValue
          title={t("stats.overview.pie.values.pol")}
          data={totalPol}
          isLoading={isLoading}
        />
        <PieTotalValue
          title={t("stats.overview.pie.values.volume")}
          data={totalVolume.div(2)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )

  return (
    <SContainerVertical sx={{ width: ["100%", "fit-content"], p: [20, 40] }}>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        !isLoading ? (
          <>
            <DoughnutChart slices={[
              {
                label: <div>in label</div>,
                percentage: 40,
                color: '#A6DDFF',
                name: 'in'
              },
              {
                label: <div>out label</div>,
                percentage: 60,
                color: '#2489FF',
                name: 'out'
              }
            ]}
             label={PieLabel}
            />
            {pieChartValues}
          </>
        ) : (
          <>
            <PieSkeleton />
            {pieChartValues}
          </>
        )
      ) : (
        <ChartWrapper />
      )}
    </SContainerVertical>
  )
}
