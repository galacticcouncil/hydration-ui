import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { bigShift } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { uniqueBy } from "remeda"

import { AssetType } from "@/api/assets"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import {
  myAssetsMobileSorter,
  myAssetsSorter,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.utils"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import {
  Balance,
  useAccountBalancesWithPriceByAssetType,
} from "@/states/account"
import { getAssetOrigin } from "@/utils/externalAssets"

export const useMyAssetsTableData = (showAllAssets: boolean) => {
  const { isMobile } = useBreakpoints()
  const { native, tokens, erc20 } = useAssets()

  const { data: balancesWithPrice, isLoading } =
    useAccountBalancesWithPriceByAssetType([AssetType.TOKEN, AssetType.ERC20])

  const tableAssets = useMemo(() => {
    if (isLoading) {
      return []
    }

    let assetsToDisplay: Array<{
      meta: TAsset
      balance: Balance | undefined
      price: string | undefined
    }> = []

    const allAssetsWithPrice = [
      ...(balancesWithPrice?.tokenBalances ?? []),
      ...(balancesWithPrice?.erc20Balances ?? []),
    ]

    if (showAllAssets) {
      const validAssets = [...tokens, ...erc20].map((asset) => ({
        meta: asset,
        balance: undefined,
        price: undefined,
      }))

      assetsToDisplay = uniqueBy(
        [...allAssetsWithPrice, ...validAssets],
        (asset) => asset.meta.id,
      )
    } else {
      assetsToDisplay = allAssetsWithPrice
    }

    return assetsToDisplay
      .map<MyAsset>(({ meta, balance, price }) => {
        const total = bigShift(balance?.total.toString() ?? "0", -meta.decimals)
        const transferable = bigShift(
          balance?.transferable.toString() ?? "0",
          -meta.decimals,
        )
        const reserved = bigShift(
          balance?.reserved.toString() ?? "0",
          -meta.decimals,
        )

        const totalDisplay = price ? total.times(price).toString() : "0"
        const transferableDisplay = price
          ? transferable.times(price).toString()
          : "0"

        return {
          ...meta,
          origin: getAssetOrigin(meta),
          total: total.toString(),
          totalDisplay,
          transferable: transferable.toString(),
          transferableDisplay,
          reserved: reserved.toString(),
          reservedDca: undefined,
          canStake: meta.id === native.id,
          rugCheckData: undefined,
        }
      })
      .sort(isMobile ? myAssetsMobileSorter : myAssetsSorter)
  }, [
    isLoading,
    balancesWithPrice?.tokenBalances,
    balancesWithPrice?.erc20Balances,
    showAllAssets,
    isMobile,
    tokens,
    erc20,
    native.id,
  ])

  return {
    data: tableAssets,
    isLoading,
  }
}
