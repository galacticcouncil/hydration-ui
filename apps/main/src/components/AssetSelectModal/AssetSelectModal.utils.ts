import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useMemo } from "react"

import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { sortAssets } from "@/utils/sort"

type TAssetWithBalance = TAsset & {
  readonly balance?: string
  readonly balanceDisplay?: string
}

export const useAssetSelectModalAssets = (
  assets: TAsset[],
  search: string,
  selectedAssetId?: string,
) => {
  const { account } = useAccount()
  const { balances, getFreeBalance, isBalanceLoading } = useAccountBalances()

  const filteredAssets = useMemo<ReadonlyArray<TAssetWithBalance>>(
    () =>
      search.length
        ? assets.filter(
            (asset) =>
              asset.name.toLowerCase().includes(search.toLowerCase()) ||
              asset.symbol.toLowerCase().includes(search.toLowerCase()),
          )
        : assets,
    [assets, search],
  )

  const assetsBalanceIds = useMemo(() => {
    const assetIdSet = new Set(filteredAssets.map((a) => a.id))

    return Object.keys(balances).filter((id) => assetIdSet.has(id))
  }, [balances, filteredAssets])

  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(assetsBalanceIds)

  if (!account) {
    return {
      sortedAssets: filteredAssets,
      isLoading: false,
    }
  }

  const assetsWithBalances = filteredAssets.map((asset) => {
    const balance = scaleHuman(getFreeBalance(asset.id), asset.decimals)

    const { price, isValid } = getAssetPrice(asset.id)
    const balanceDisplay = isValid ? Big(price).times(balance).toString() : "0"

    return {
      ...asset,
      balance,
      balanceDisplay,
    }
  })

  const sortedAssets = sortAssets(
    assetsWithBalances,
    "balanceDisplay",
    selectedAssetId,
  )

  return { sortedAssets, isLoading: isPriceLoading || isBalanceLoading }
}
