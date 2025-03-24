import { useCallback, useMemo } from "react"
import { create } from "zustand"
import { combine, persist } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

import { usePriceKeys } from "@/api/spotPrice"

type TDisplayAsset = {
  id: string | undefined
  symbol: string
  isRealUSD: boolean
  isStableCoin: boolean
  isDollar?: boolean
  stableCoinId: string | undefined
}

export type DisplayAssetStore = TDisplayAsset & {
  update: (asset: TDisplayAsset) => void
}

export const useDisplayAssetStore = create<DisplayAssetStore>()(
  persist(
    (set) => ({
      id: undefined,
      stableCoinId: undefined,
      symbol: "$",
      isDollar: true,
      isRealUSD: false,
      isStableCoin: true,
      update: (value) =>
        set({ ...value, isDollar: value.isRealUSD || value.isStableCoin }),
    }),
    { name: "hdx-display-asset", version: 1 },
  ),
)

type TStoredAssetPrice = Record<string, string>
export type AssetPrice = { price: string; isLoading: boolean; isNaN: boolean }

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
        acc[assetId] = state.assets[assetId] ?? ""
        return acc
      }, {}),
    ),
  )

  // subscribe to price changes by asset id
  usePriceKeys(assetIds)

  const prices = useMemo(() => {
    const result: Record<string, AssetPrice> = {}

    Object.entries(assets).forEach(([key, price]) => {
      result[key] = {
        price,
        isLoading: !price.length,
        isNaN: price === "NaN",
      }
    })
    return result
  }, [assets])

  const getAssetPrice = useCallback(
    (assetId: string): AssetPrice => {
      return prices[assetId] ?? { price: "NaN", isLoading: false, isNaN: true }
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
