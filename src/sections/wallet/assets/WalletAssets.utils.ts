import { useNavigate, useSearch } from "@tanstack/react-location"
import BN from "bignumber.js"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useEffect, useMemo } from "react"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAssetsTableData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0 } from "utils/constants"

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

export const useWalletAssetsTotals = () => {
  const assets = useAssetsTableData({ isAllAssets: false })
  const lpPositions = useOmnipoolPositionsData()
  const farmsPositions = useAllUserDepositShare()

  const { warnings, setWarnings } = useWarningsStore()

  const isHdxPosition = lpPositions.data.some(
    (position) => position.assetId === NATIVE_ASSET_ID,
  )

  useEffect(() => {
    if (lpPositions.data.length) {
      if (isHdxPosition && warnings.hdxLiquidity.visible == null) {
        setWarnings("hdxLiquidity", true)
      }
    }
  }, [
    warnings.hdxLiquidity.visible,
    setWarnings,
    lpPositions.data.length,
    isHdxPosition,
  ])

  const assetsTotal = useMemo(() => {
    if (!assets.data) return BN_0

    return assets.data.reduce((acc, cur) => {
      if (!cur.totalDisplay.isNaN()) {
        return acc.plus(cur.totalDisplay)
      }
      return acc
    }, BN_0)
  }, [assets])

  const farmsTotal = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in farmsPositions.data) {
      const poolTotal = farmsPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [farmsPositions])

  const lpTotal = useMemo(() => {
    if (!lpPositions.data) return BN_0

    return lpPositions.data.reduce(
      (acc, { valueDisplay }) => acc.plus(BN(valueDisplay)),
      BN_0,
    )
  }, [lpPositions.data])

  const balanceTotal = assetsTotal.plus(farmsTotal).plus(lpTotal)
  const isLoading =
    assets.isLoading || lpPositions.isLoading || farmsPositions.isLoading

  return {
    assetsTotal,
    farmsTotal,
    lpTotal,
    balanceTotal,
    isLoading,
  }
}
