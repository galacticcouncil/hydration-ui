import BN from "bignumber.js"
import { useBorrowMarketTotals } from "api/borrow"
import {
  useOmnipoolsTotals,
  useStablepoolsTotals,
  useXykTotals,
} from "sections/pools/PoolsPage.utils"
import { useTreasuryAssets } from "sections/stats/StatsPage.utils"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { useTranslation } from "react-i18next"
import { BarChartData } from "components/VerticalBarChart/VerticalBarChart"
import { useStakingTotal } from "api/staking"

type TStatsOverviewTotals = ReturnType<typeof useStatsOverviewTotals>["totals"]

export const useStatsOverviewChartData = (
  totals: TStatsOverviewTotals,
): BarChartData[] => {
  const { t } = useTranslation()
  return [
    {
      value: totals?.omnipoolsTotal ?? BN_0,
      label: t("stats.overview.omnipool"),
      color: "#FF2982",
    },
    {
      value: totals?.treasuryTotal ?? BN_0,
      label: t("stats.overview.treasury"),
      color: "#FFA629",
    },
    {
      value: totals?.stakingTotal ?? BN_0,
      label: t("stats.overview.staking"),
      color: "#ED6AFF",
    },
    {
      value: totals?.stablePoolsTotal ?? BN_0,
      label: t("stats.overview.stablepool"),
      color: "#3DFDA4",
    },
    {
      value: totals?.moneyMarketTotal ?? BN_0,
      label: t("stats.overview.borrow"),
      color: "#05C5FF",
    },
    {
      value: totals?.xykTotal ?? BN_0,
      label: t("stats.overview.xyk"),
      color: "#564FB2",
    },
  ].sort((a, b) => b.value.comparedTo(a.value))
}

export const useStatsOverviewTotals = () => {
  const moneyMarket = useBorrowMarketTotals()
  const omnipools = useOmnipoolsTotals()
  const stablepools = useStablepoolsTotals()
  const treasury = useTreasuryAssets()
  const xyk = useXykTotals()
  const { data: staking, isLoading: isStakingLoading } = useStakingTotal()

  const hasTreasuryTotal = !!treasury?.total
  const hasStakingTotal = !!staking?.totalStakeDisplay

  const isLoading =
    moneyMarket.isLoading ||
    omnipools.isLoading ||
    stablepools.isLoading ||
    treasury.isLoading ||
    xyk.isLoading ||
    isStakingLoading ||
    !hasTreasuryTotal ||
    !hasStakingTotal

  const totals = useMemo(() => {
    if (isLoading) return null

    const volume24h = xyk.volume.plus(omnipools.volume.div(2))

    const hydrationTvl = moneyMarket.tvl
      .plus(omnipools.tvl)
      .plus(stablepools.tvl)
      .plus(xyk.tvl)
      .plus(staking.totalStakeDisplay)

    return {
      moneyMarketTotal: moneyMarket.tvl,
      omnipoolsTotal: omnipools.tvl,
      stablePoolsTotal: stablepools.tvl,
      treasuryTotal: BN(treasury.total ?? "0"),
      stakingTotal: BN(staking.totalStakeDisplay),
      xykTotal: xyk.tvl,
      hydrationTvl,
      volume24h,
    }
  }, [
    isLoading,
    moneyMarket.tvl,
    omnipools.tvl,
    omnipools.volume,
    stablepools.tvl,
    staking?.totalStakeDisplay,
    treasury.total,
    xyk.tvl,
    xyk.volume,
  ])

  return {
    totals,
    isLoading,
  }
}
