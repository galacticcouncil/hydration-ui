import { TotalValue } from "./TotalValue"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useState } from "react"
import { SContainerVertical } from "sections/stats/sections/LRNA/StatsLRNA.styled"
import { ChartWrapper } from "sections/stats/sections/LRNA/components/ChartWrapper/ChartWrapper"
import { useTranslation } from "react-i18next"
import { ChartLabel } from "./ChartLabel"
import { DoughnutChart } from "sections/stats/components/DoughnutChart/DoughnutChart"
import {
  makePercent,
  useLRNAOmnipoolBalance,
  useLRNATotalIssuance,
} from "./Distribution.utils"
import { DistributionSliceLabel } from "./DistributionSliceLabel"
import { useLRNAMeta } from "api/assetMeta"
import { DEPOSIT_CLASS_ID } from "utils/api"

export const Distribution = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const meta = useLRNAMeta()
  const totalIssuanceQuery = useLRNATotalIssuance()
  const omnipoolBalanceQuery = useLRNAOmnipoolBalance()

  const symbol = meta?.data?.data?.symbol?.toString()

  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  const hasData = !!(totalIssuanceQuery.data && omnipoolBalanceQuery.data)
  const isLoading =
    totalIssuanceQuery.isLoading || omnipoolBalanceQuery.isLoading

  const outsideOmnipool = hasData
    ? totalIssuanceQuery.data.minus(omnipoolBalanceQuery.data)
    : undefined

  const outsidePercent = makePercent(outsideOmnipool, totalIssuanceQuery.data)
  const insidePercent = makePercent(
    omnipoolBalanceQuery.data,
    totalIssuanceQuery.data,
  )

  const pieChartValues = (
    <div sx={{ flex: "column", gap: 20 }}>
      <TotalValue
        title={t("stats.lrna.pie.values.total")}
        data={totalIssuanceQuery.data}
        isLoading={totalIssuanceQuery.isLoading}
      />
      <div
        sx={{
          flex: ["row", "column"],
          justify: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <TotalValue
          title={t("stats.lrna.pie.values.inside")}
          data={omnipoolBalanceQuery.data}
          isLoading={omnipoolBalanceQuery.isLoading}
          compact={true}
        />
        <TotalValue
          title={t("stats.lrna.pie.values.outside")}
          data={outsideOmnipool}
          isLoading={isLoading}
          compact={true}
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
            <DoughnutChart
              slices={[
                {
                  label: (
                    <DistributionSliceLabel
                      text={t("stats.lrna.distribution.inside")}
                      symbol={symbol}
                      percentage={insidePercent?.toNumber() ?? 0}
                    />
                  ),
                  percentage: insidePercent?.toNumber() ?? 0,
                  color: "#A6DDFF",
                  name: "in",
                  id: DEPOSIT_CLASS_ID,
                },
                {
                  label: (
                    <DistributionSliceLabel
                      text={t("stats.lrna.distribution.outside")}
                      symbol={symbol}
                      percentage={outsidePercent?.toNumber() ?? 0}
                    />
                  ),
                  percentage: outsidePercent?.toNumber() ?? 0,
                  color: "#2489FF",
                  name: "out",
                  id: DEPOSIT_CLASS_ID,
                },
              ]}
              label={ChartLabel}
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
