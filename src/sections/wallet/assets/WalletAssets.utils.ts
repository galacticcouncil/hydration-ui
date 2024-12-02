import { useNavigate, useSearch } from "@tanstack/react-location"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0, BN_NAN } from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useAssetsData } from "./table/data/WalletAssetsTableData.utils"
import { useAccountAssets } from "api/deposits"

type AssetCategory = "all" | "assets" | "liquidity" | "farming"

type FilterValues = {
  category?: AssetCategory
  search?: string
}

export const useWalletAssetsFilters = () => {
  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      category?: AssetCategory
      search?: string
    }
  }>()

  const setFilter = (filter: Partial<FilterValues>) => {
    navigate({
      search: {
        ...search,
        ...filter,
      },
    })
  }

  return {
    category: search.category ?? "all",
    search: search.search ?? "",
    setFilter,
  }
}

export const useWalletAssetsTotals = ({
  address,
}: {
  address?: string
} = {}) => {
  const assets = useAssetsData({ isAllAssets: false, address })
  const lpPositions = useOmnipoolPositionsData({ address })
  const farmsTotal = useFarmDepositsTotal(address)
  const balances = useAccountAssets(address)

  const shareTokenBalances = useMemo(
    () => [...(balances.data?.accountShareTokensMap.values() ?? [])],
    [balances.data?.accountShareTokensMap],
  )

  const spotPrices = useDisplayShareTokenPrice(
    shareTokenBalances?.map((token) => token.asset.id),
  )

  const assetsTotal = useMemo(() => {
    if (!assets.data) return BN_0

    return assets.data.reduce((acc, cur) => {
      if (!cur.totalDisplay.isNaN()) {
        return acc.plus(cur.totalDisplay)
      }
      return acc
    }, BN_0)
  }, [assets])

  const lpTotal = useMemo(() => {
    if (!lpPositions.data) return BN_0

    return lpPositions.data.reduce(
      (acc, { valueDisplay }) => acc.plus(BN(valueDisplay)),
      BN_0,
    )
  }, [lpPositions.data])

  const xykTotal = useMemo(() => {
    if (!shareTokenBalances || !spotPrices.data) return BN_0
    return shareTokenBalances.reduce<BN>((acc, { asset, balance }) => {
      if (BN(balance.freeBalance).gt(0)) {
        const meta = asset
        const spotPrice = spotPrices.data.find(
          (spotPrice) => spotPrice.tokenIn === meta.id,
        )

        const value = BN(balance.freeBalance)
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice?.spotPrice ?? BN_NAN)

        return acc.plus(!value.isNaN() ? value : BN_0)
      }
      return acc
    }, BN_0)
  }, [shareTokenBalances, spotPrices.data])

  const balanceTotal = assetsTotal
    .plus(farmsTotal.value)
    .plus(lpTotal)
    .plus(xykTotal)

  const isLoading =
    assets.isLoading || lpPositions.isLoading || farmsTotal.isLoading

  return {
    assetsTotal,
    farmsTotal: farmsTotal.value,
    lpTotal: lpTotal.plus(xykTotal),
    balanceTotal,
    isLoading,
  }
}
