import { useNavigate, useSearch } from "@tanstack/react-location"
import { useTokensBalances } from "api/balances"
import BN from "bignumber.js"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useEffect, useMemo } from "react"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0 } from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useAssetsData } from "./table/data/WalletAssetsTableData.utils"

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
  const {
    assets: { shareTokens, getAsset },
  } = useRpcProvider()
  const { account } = useAccount()
  const assets = useAssetsData({ isAllAssets: false, address })
  const lpPositions = useOmnipoolPositionsData({ address })
  const farmsPositions = useAllUserDepositShare({ address })

  const shareTokenIds = shareTokens.map((shareToken) => shareToken.id)
  const shareTokenBalances = useTokensBalances(shareTokenIds, account?.address)
  const spotPrices = useDisplayShareTokenPrice(shareTokenIds)

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

  const xykTotal = useMemo(() => {
    if (
      shareTokenBalances.some((shareTokenBalance) => !shareTokenBalance.data) ||
      !spotPrices.data
    )
      return BN_0
    return shareTokenBalances.reduce<BN>((acc, shareTokenBalance) => {
      if (shareTokenBalance.data && shareTokenBalance.data.freeBalance.gt(0)) {
        const meta = getAsset(shareTokenBalance.data.assetId.toString())
        const spotPrice = spotPrices.data.find(
          (spotPrice) => spotPrice.tokenIn === meta.id,
        )

        const value = shareTokenBalance.data.freeBalance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice?.spotPrice ?? 1)

        return acc.plus(value)
      }
      return acc
    }, BN_0)
  }, [getAsset, shareTokenBalances, spotPrices.data])

  const balanceTotal = assetsTotal.plus(farmsTotal).plus(lpTotal).plus(xykTotal)
  const isLoading =
    assets.isLoading || lpPositions.isLoading || farmsPositions.isLoading

  return {
    assetsTotal,
    farmsTotal,
    lpTotal: lpTotal.plus(xykTotal),
    balanceTotal,
    isLoading,
  }
}
