import { useBorrowMarketTotals } from "api/borrow"
import { useOmnipoolDataObserver } from "api/omnipool"
import { useStakingTotal } from "api/staking"
import { useSwapAssetFeesByPeriod } from "api/stats"
import BN from "bignumber.js"
import { BarChartData } from "components/VerticalBarChart/VerticalBarChart"
import { useAssets } from "providers/assets"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  useOmnipoolsTotals,
  useStablepoolsTotals,
  useXykTotals,
} from "sections/pools/PoolsPage.utils"
import { useTreasuryAssets } from "sections/stats/StatsPage.utils"
import { useAssetsPrice } from "state/displayPrice"
import { BN_0 } from "utils/constants"
import { isNotNil } from "utils/helpers"
import { prop } from "utils/rx"

type TStatsOverviewTotals = ReturnType<typeof useStatsOverviewTotals>["totals"]

export const useSwapAssetFees24hTotal = () => {
  const { getAsset } = useAssets()
  const {
    data,
    isSuccess,
    isLoading: isSwapAssetFeesLoading,
  } = useSwapAssetFeesByPeriod({ period: "24H" })

  const assets = useMemo(() => {
    return isSuccess ? data.swapAssetFeesByPeriod.nodes.filter(isNotNil) : []
  }, [data, isSuccess])

  const assetIds = isSuccess
    ? assets.map((asset) => asset.assetRegistryId as string)
    : []

  const { isLoading: isAssetsPriceLoading, getAssetPrice } =
    useAssetsPrice(assetIds)

  const swapFees24h = useMemo(() => {
    if (isAssetsPriceLoading) return "0"
    return assets.reduce((prev, curr) => {
      const asset = getAsset(curr.assetRegistryId as string)
      if (!asset) return prev

      const { price } = getAssetPrice(asset.id)

      const amount = BN(curr.amount).shiftedBy(-asset.decimals).times(price)
      return amount.isNaN() ? prev : BN(prev).plus(amount).toString()
    }, "0")
  }, [assets, getAsset, isAssetsPriceLoading, getAssetPrice])

  return {
    swapFees24h,
    isLoading: isSwapAssetFeesLoading || isAssetsPriceLoading,
  }
}

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
  ].sort((a, b) => BN(b.value).comparedTo(a.value))
}

const useStableswapTotalTvl = () => {
  const { stableswap, getAssetWithFallback } = useAssets()
  const stableswapIds = stableswap.map(prop("id"))
  const { data: omnipoolAssets = [], isLoading } = useOmnipoolDataObserver()

  const filteredOmnipoolAssets = omnipoolAssets.filter((asset) =>
    stableswapIds.includes(asset.id),
  )

  const filteredOmnipoolAssetsIds = stableswap.map(prop("id"))

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    filteredOmnipoolAssetsIds,
  )

  const totalTvl = useMemo(() => {
    return filteredOmnipoolAssets.reduce((prev, asset) => {
      const tvl = asset.balance
      const spotPrice = getAssetPrice(asset.id).price
      const meta = getAssetWithFallback(asset.id)

      const displayTvl = BN(tvl).times(spotPrice).shiftedBy(-meta.decimals)

      return prev.plus(displayTvl)
    }, BN_0)
  }, [filteredOmnipoolAssets, getAssetPrice, getAssetWithFallback])

  return {
    tvl: totalTvl,
    isLoading: isLoading || isPriceLoading,
  }
}

export const useStatsOverviewTotals = () => {
  const moneyMarket = useBorrowMarketTotals()
  const omnipools = useOmnipoolsTotals()
  const stablepools = useStablepoolsTotals()
  const treasury = useTreasuryAssets()
  const xyk = useXykTotals()
  const stableswapTvl = useStableswapTotalTvl()

  const { data: staking, isLoading: isStakingLoading } = useStakingTotal()
  const stakeTotal = staking?.totalStakeDisplay ?? "0"
  const treasuryTotal = treasury.total ?? "0"
  const hasTreasuryTotal = treasuryTotal !== "0"

  const isLoading =
    moneyMarket.isLoading ||
    omnipools.isLoading ||
    stablepools.isLoading ||
    treasury.isLoading ||
    xyk.isLoading ||
    isStakingLoading ||
    stableswapTvl.isLoading ||
    treasury.isLoading ||
    !hasTreasuryTotal

  const totals = useMemo(() => {
    if (isLoading) return null

    const volume24h = BN(xyk.volume ?? 0)
      .plus(BN(omnipools.volume ?? 0))
      .toString()

    const hydrationTvl = BN(omnipools.tvl ?? 0)
      .plus(stablepools.tvl)
      .plus(xyk.tvl ?? 0)
      .plus(moneyMarket.tvl)
      .plus(stakeTotal)
      .minus(stableswapTvl.tvl)
      .toString()

    return {
      moneyMarketTotal: moneyMarket.tvl,
      omnipoolsTotal: omnipools.tvl,
      stablePoolsTotal: stablepools.tvl,
      treasuryTotal: treasury.total ?? "0",
      stakingTotal: stakeTotal,
      xykTotal: xyk.tvl,
      hydrationTvl,
      volume24h,
    }
  }, [
    isLoading,
    stableswapTvl.tvl,
    moneyMarket.tvl,
    omnipools.tvl,
    omnipools.volume,
    stablepools.tvl,
    stakeTotal,
    treasury.total,
    xyk.tvl,
    xyk.volume,
  ])

  return {
    totals,
    isLoading,
  }
}
