import { useNavigate, useSearch } from "@tanstack/react-location"
import { useTokensBalances } from "api/balances"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
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
  const farmsTotal = useFarmDepositsTotal(address)

  const shareTokenIds = shareTokens.map((shareToken) => shareToken.id)
  const shareTokenBalances = useTokensBalances(shareTokenIds, account?.address)
  const spotPrices = useDisplayShareTokenPrice(shareTokenIds)

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

        return acc.plus(!value.isNaN() ? value : BN_0)
      }
      return acc
    }, BN_0)
  }, [getAsset, shareTokenBalances, spotPrices.data])

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
