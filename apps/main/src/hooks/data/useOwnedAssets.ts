import { useMemo } from "react"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"

export const useOwnedAssets = (): Array<TAsset> => {
  const { all, isExternal } = useAssets()

  const allAssets = useMemo(
    () =>
      all
        .values()
        .filter((asset) => !isExternal(asset) && !!asset.name)
        .toArray(),
    [all, isExternal],
  )

  const { balances } = useAccountBalances()

  return useMemo(() => {
    const assetIds = new Set(Object.keys(balances))
    return allAssets.filter((asset) => assetIds.has(asset.id))
  }, [allAssets, balances])
}
