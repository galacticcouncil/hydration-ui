import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import {
  myAssetsMobileSorter,
  myAssetsSorter,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalancesWithPriceByAssetType } from "@/states/account"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { getAssetOrigin } from "@/utils/externalAssets"

const SMALL_BALANCE_USD_THRESHOLD = 0.01

const isSmallBalance = (asset: MyAsset) =>
  asset.id !== NATIVE_ASSET_ID &&
  !!asset.totalDisplay &&
  Big(asset.totalDisplay).lte(SMALL_BALANCE_USD_THRESHOLD)

export const useMyAssetsTableData = (showAllAssets: boolean) => {
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const { data: balancesWithPrice, isLoading } =
    useAccountBalancesWithPriceByAssetType([AssetType.TOKEN, AssetType.ERC20])

  const { assets, hasSmallBalances } = useMemo(() => {
    if (isLoading) {
      return { assets: [], hasSmallBalances: false }
    }

    const allAssetsWithPrice = [
      ...(balancesWithPrice?.tokenBalances ?? []),
      ...(balancesWithPrice?.erc20Balances ?? []),
    ]

    const assets = allAssetsWithPrice
      .map<MyAsset>(({ meta, balance, price }) => {
        const total = bigShift(balance?.total.toString() ?? "0", -meta.decimals)
        const transferable = bigShift(
          balance?.transferable.toString() ?? "0",
          -meta.decimals,
        )

        const totalDisplay = price ? total.times(price).toString() : undefined
        const transferableDisplay = price
          ? transferable.times(price).toString()
          : undefined

        return {
          ...meta,
          origin: getAssetOrigin(meta),
          total: total.toString(),
          totalDisplay,
          transferable: transferable.toString(),
          transferableDisplay,
          canStake: meta.id === native.id,
          rugCheckData: undefined,
          reserved: balance?.reserved,
        }
      })
      .filter((asset) => Big(asset.total).gt(0))
      .sort(isMobile ? myAssetsMobileSorter : myAssetsSorter)

    return {
      assets,
      hasSmallBalances: assets.some(isSmallBalance),
    }
  }, [
    isLoading,
    balancesWithPrice?.tokenBalances,
    balancesWithPrice?.erc20Balances,
    isMobile,
    native.id,
  ])

  const data = useMemo(() => {
    if (showAllAssets) {
      return assets
    }

    return assets.filter((asset) => !isSmallBalance(asset))
  }, [assets, showAllAssets])

  return {
    data,
    hasSmallBalances,
    isEmpty: assets.length === 0,
    isLoading,
  }
}
