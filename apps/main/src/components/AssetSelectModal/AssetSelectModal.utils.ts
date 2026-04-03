import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useMemo } from "react"

import { TAssetData } from "@/api/assets"
import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { sortAssets, SortAssetsOptions } from "@/utils/sort"

export type TAssetWithBalance = TAsset & {
  readonly balance?: string
  readonly balanceDisplay?: string
}

export const useAssetSelectModalAssets = ({
  assets,
  search,
  selectedAssetId,
  ignoreAssetIds,
  tickerOrder,
  lowPriorityAssetIds,
  highPriorityAssetIds,
}: {
  assets: TAssetData[]
  ignoreAssetIds?: string[]
  search: string
  selectedAssetId?: string
} & SortAssetsOptions) => {
  const { account } = useAccount()
  const { balances, getTransferableBalance, isBalanceLoading } =
    useAccountBalances()

  const filteredAssets: TAssetWithBalance[] = useFilteredSearchAssets(
    assets,
    search,
    ignoreAssetIds,
  )

  const assetsBalanceIds = useMemo(() => {
    const assetIdSet = new Set(filteredAssets.map((a) => a.id))

    return Object.keys(balances).filter((id) => assetIdSet.has(id))
  }, [balances, filteredAssets])

  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(assetsBalanceIds)

  const invalidState = !account || !assets.length

  const isLoading = isPriceLoading || isBalanceLoading

  const sortedAssets = useMemo(() => {
    if (invalidState || isLoading) {
      return filteredAssets
    }

    const assetsWithBalances = filteredAssets.map((asset) => {
      const balance = scaleHuman(
        getTransferableBalance(asset.id),
        asset.decimals,
      )

      const { price, isValid } = getAssetPrice(asset.id)
      const balanceDisplay = isValid
        ? Big(price).times(balance).toString()
        : "0"

      return {
        ...asset,
        balance,
        balanceDisplay,
      }
    })

    return sortAssets(assetsWithBalances, "balanceDisplay", {
      firstAssetId: selectedAssetId,
      search,
      tickerOrder,
      lowPriorityAssetIds,
      highPriorityAssetIds,
    })
  }, [
    invalidState,
    filteredAssets,
    getAssetPrice,
    getTransferableBalance,
    highPriorityAssetIds,
    isLoading,
    lowPriorityAssetIds,
    selectedAssetId,
    search,
    tickerOrder,
  ])

  return { sortedAssets, isLoading: invalidState ? false : isLoading }
}

export const useFilteredSearchAssets = <T extends TAssetData>(
  assets: Array<T>,
  search: string,
  ignoreAssetIds?: string[],
) => {
  return useMemo(() => {
    if (!search.length && !ignoreAssetIds?.length) {
      return assets
    }

    const ignoredAssetIdSet = new Set(ignoreAssetIds ?? [])
    const searchLower = search.length ? search.toLowerCase() : ""

    return assets.filter((asset) => {
      if (ignoredAssetIdSet.has(asset.id)) {
        return false
      }

      if (search.length) {
        return (
          asset.name.toLowerCase().includes(searchLower) ||
          asset.symbol.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [assets, search, ignoreAssetIds])
}
