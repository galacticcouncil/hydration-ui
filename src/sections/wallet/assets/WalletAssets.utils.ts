import { useNavigate, useSearch } from "@tanstack/react-location"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0, BN_NAN } from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useAssetsData } from "./table/data/WalletAssetsTableData.utils"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { useUserBorrowSummary } from "api/borrow"
import { useAssetsPrice } from "state/displayPrice"

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
  const borrows = useUserBorrowSummary(address)
  const assets = useAssetsData({ isAllAssets: false, address })
  const lpPositions = useOmnipoolPositionsData({ address })
  const farmsTotal = useFarmDepositsTotal(address)
  const { data: balances, isLoading: isAccountAssetsLoading } =
    useAccountAssets(address)

  const stableswaps = useMemo(
    () => [...(balances?.accountStableswapMap.values() ?? [])],
    [balances?.accountStableswapMap],
  )

  const shareTokenBalances = useMemo(
    () => [...(balances?.accountShareTokensMap.values() ?? [])],
    [balances?.accountShareTokensMap],
  )

  const { getAssetPrice, isLoading: isLoadingPrices } = useAssetsPrice(
    stableswaps.map((stableswap) => stableswap.asset.id),
  )

  const spotPrices = useDisplayShareTokenPrice(
    shareTokenBalances.map((token) => token.asset.id),
  )

  const assetsTotal = useMemo(
    () =>
      assets.data.reduce((acc, cur) => {
        if (cur.totalDisplay) {
          return BigNumber(acc).plus(cur.totalDisplay).toString()
        }
        return acc
      }, "0"),
    [assets.data],
  )

  const lpTotal = useMemo(
    () =>
      lpPositions.data.reduce(
        (acc, { valueDisplay }) => BigNumber(acc).plus(valueDisplay).toString(),
        "0",
      ),
    [lpPositions.data],
  )

  const stableswapsTotal = useMemo(() => {
    return stableswaps
      .reduce((acc, stableswap) => {
        const balance = BigNumber(stableswap.balance.freeBalance).shiftedBy(
          -stableswap.asset.decimals,
        )

        const spotPrice = getAssetPrice(stableswap.asset.id).price

        if (spotPrice !== undefined) {
          const displayValue = balance.times(spotPrice)

          return acc.plus(displayValue)
        }

        return acc
      }, BN_0)
      .toString()
  }, [getAssetPrice, stableswaps])

  const xykTotal = useMemo(() => {
    if (!shareTokenBalances || !spotPrices.data) return BN_NAN
    return shareTokenBalances.reduce<string>((acc, { asset, balance }) => {
      if (BN(balance.freeBalance).gt(0)) {
        const meta = asset
        const spotPrice = spotPrices.data.find(
          (spotPrice) => spotPrice.tokenIn === meta.id,
        )

        const value = BN(balance.freeBalance)
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice?.spotPrice ?? BN_NAN)

        return BN(acc)
          .plus(!value.isNaN() ? value : BN_0)
          .toString()
      }

      return acc
    }, "0")
  }, [shareTokenBalances, spotPrices.data])

  const borrowsTotal = borrows.data?.totalBorrowsUSD ?? "0"

  const balanceTotal = useMemo(
    () =>
      BigNumber(assetsTotal)
        .plus(farmsTotal.value)
        .plus(lpTotal)
        .plus(xykTotal)
        .plus(stableswapsTotal)
        .minus(borrowsTotal)
        .toString(),
    [
      assetsTotal,
      farmsTotal.value,
      lpTotal,
      xykTotal,
      borrowsTotal,
      stableswapsTotal,
    ],
  )

  const isLoading =
    borrows.isLoading ||
    assets.isLoading ||
    lpPositions.isLoading ||
    farmsTotal.isLoading ||
    isAccountAssetsLoading ||
    spotPrices.isInitialLoading ||
    isLoadingPrices

  return {
    assetsTotal,
    farmsTotal: farmsTotal.value,
    lpTotal: BigNumber(lpTotal)
      .plus(xykTotal)
      .plus(farmsTotal.value)
      .plus(stableswapsTotal)
      .toString(),
    balanceTotal,
    borrowsTotal,
    stableswapsTotal,
    isLoading,
  }
}
