import { usePriceKeys } from "api/spotPrice"
import { useShallow } from "hooks/useShallow"
import { useCallback, useMemo } from "react"
import { isNil } from "utils/helpers"

import { create } from "zustand"
import { combine } from "zustand/middleware"

type TStoredAssetPrice = Record<string, string>
type AssetPrice = Record<
  string,
  { price: string; isLoading: boolean } | undefined
>

type Store = {
  assets: TStoredAssetPrice
  setAssets: (asset: { id: string; price: string }[]) => void
}

export const useDisplaySpotPriceStore = create<Store>(
  combine({ assets: {} as TStoredAssetPrice }, (set) => ({
    setAssets: (assets) => {
      set((state) => {
        const newValues = { ...state.assets }

        assets.forEach((asset) => (newValues[asset.id] = asset.price))
        return { assets: newValues }
      })
    },
  })),
)

export const useAssetsPrice = (assetIds: string[]) => {
  const assets = useDisplaySpotPriceStore(
    useShallow((state) =>
      assetIds.reduce<Record<string, string>>((acc, assetId) => {
        acc[assetId] = state.assets[assetId]
        return acc
      }, {}),
    ),
  )

  // subscribe to price changes by asset id
  usePriceKeys(assetIds)

  const prices = useMemo(() => {
    const result: AssetPrice = {}

    Object.entries(assets).forEach(([key, price]) => {
      result[key] = {
        price,
        isLoading: isNil(price),
      }
    })
    return result
  }, [assets])

  const getAssetPrice = useCallback(
    (assetId: string) => {
      return prices[assetId] ?? { price: "NaN", isLoading: false }
    },
    [prices],
  )

  const isLoading = useMemo(() => {
    for (const [, price] of Object.entries(prices)) {
      if (price && price.isLoading === true) {
        return true
      }
    }
    return false
  }, [prices])

  return { prices, isLoading, getAssetPrice }
}
