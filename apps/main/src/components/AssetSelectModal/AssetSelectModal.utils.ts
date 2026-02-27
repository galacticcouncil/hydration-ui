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
  ...sortOptions
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

  if (!account || !assets.length) {
    return {
      sortedAssets: filteredAssets,
      isLoading: false,
    }
  }

  const assetsWithBalances = filteredAssets.map((asset) => {
    const balance = scaleHuman(getTransferableBalance(asset.id), asset.decimals)

    const { price, isValid } = getAssetPrice(asset.id)
    const balanceDisplay = isValid ? Big(price).times(balance).toString() : "0"

    return {
      ...asset,
      balance,
      balanceDisplay,
    }
  })

  const sortedAssets = sortAssets(assetsWithBalances, "balanceDisplay", {
    firstAssetId: selectedAssetId,
    search,
    ...sortOptions,
  })

  return { sortedAssets, isLoading: isPriceLoading || isBalanceLoading }
}

export const useFilteredSearchAssets = <T extends TAssetData>(
  assets: Array<T>,
  search: string,
  ignoreAssetIds?: string[],
) => {
  return useMemo(() => {
    const ignoredAssetIdSet = new Set(ignoreAssetIds ?? [])

    return search.length || ignoreAssetIds
      ? assets.filter((asset) => {
          let isVisible = true

          if (search.length) {
            isVisible =
              asset.name.toLowerCase().includes(search.toLowerCase()) ||
              asset.symbol.toLowerCase().includes(search.toLowerCase())
          }

          if (ignoreAssetIds) {
            isVisible = !ignoredAssetIdSet.has(asset.id)
          }

          return isVisible
        })
      : assets
  }, [assets, search, ignoreAssetIds])
}
