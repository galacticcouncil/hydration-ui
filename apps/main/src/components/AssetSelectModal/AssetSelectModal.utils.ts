import Big from "big.js"
import { useMemo } from "react"

import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { sortAssets } from "@/utils/sort"

export const useAssetSelectModalAssets = (
  assets: TAsset[],
  search: string,
  selectedAssetId?: string,
) => {
  const { balances, getFreeBalance, isBalanceLoading } = useAccountBalances()

  const assetsBalanceIds = useMemo(() => {
    const assetIdSet = new Set(assets.map((a) => a.id))

    return Object.keys(balances).filter((id) => assetIdSet.has(id))
  }, [balances, assets])

  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(assetsBalanceIds)

  const assetsWithBalances = assets.map((asset) => {
    const balance = scaleHuman(getFreeBalance(asset.id), asset.decimals)

    const { price, isValid } = getAssetPrice(asset.id)
    const balanceDisplay = isValid ? Big(price).times(balance).toString() : "0"

    return {
      ...asset,
      balance,
      balanceDisplay,
    }
  })

  const filteredAssets = search.length
    ? assetsWithBalances.filter(
        (asset) =>
          asset.name.toLowerCase().includes(search.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    : assetsWithBalances

  const sortedAssets = sortAssets(
    filteredAssets,
    "balanceDisplay",
    selectedAssetId,
  )

  return { sortedAssets, isLoading: isPriceLoading || isBalanceLoading }
}
