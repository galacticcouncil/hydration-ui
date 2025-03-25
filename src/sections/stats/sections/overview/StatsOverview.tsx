import BN from "bignumber.js"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { VerticalBarChart } from "components/VerticalBarChart/VerticalBarChart"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  SContainer,
  SStatsContainer,
} from "sections/stats/sections/overview/StatsOverview.styled"
import {
  useStatsOverviewChartData,
  useStatsOverviewTotals,
  useSwapAssetFees24hTotal,
} from "sections/stats/sections/overview/StatsOverview.utils"
import { theme } from "theme"
import { BN_BILL } from "utils/constants"

export type StatsOverviewProps = {}

export const StatsOverview: React.FC<StatsOverviewProps> = () => {
  const { t } = useTranslation()
  const isSmallMedia = useMedia(theme.viewport.lt.md)

  const { totals, isLoading: isLoadingTotals } = useStatsOverviewTotals()
  const { swapFees24h, isLoading: isLoadingSwapFees } =
    useSwapAssetFees24hTotal()

  const data = useStatsOverviewChartData(totals)

  return (
    <SContainer>
      <DataValueList>
        <DataValue
          isLoading={isLoadingTotals}
          labelColor="brightBlue300"
          label={t("stats.overview.hydrationTvl")}
          size="extra-large"
        >
          <DisplayValue
            value={totals?.hydrationTvl}
            isUSD
            compact={BN(totals?.hydrationTvl ?? "0").gt(BN_BILL)}
          />
        </DataValue>
        <DataValue
          isLoading={isLoadingTotals}
          labelColor="brightBlue300"
          label={t("24hVolume")}
          size="extra-large"
        >
          <DisplayValue value={totals?.volume24h} isUSD />
        </DataValue>
        <DataValue
          isLoading={isLoadingSwapFees}
          labelColor="brightBlue300"
          label={t("24hSwapFees")}
          size="extra-large"
        >
          <DisplayValue value={swapFees24h} isUSD />
        </DataValue>
      </DataValueList>
      <VerticalBarChart isLoading={isLoadingTotals} data={data} slanted />
      <SStatsContainer columns={isSmallMedia ? 2 : 3}>
        {data.map(({ value, label }) => (
          <DataValue
            key={label}
            isLoading={isLoadingTotals}
            labelColor="brightBlue300"
            label={label}
            size="extra-large"
          >
            <DisplayValue value={value} isUSD compact={BN(value).gt(BN_BILL)} />
          </DataValue>
        ))}
      </SStatsContainer>
    </SContainer>
  )
}
