import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useMount } from "react-use"
import { isNullish } from "remeda"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { combine } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

import { spotPriceKey } from "@/api/spotPrice"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

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
export type AssetPrice = Record<string, { price: string; isLoading: boolean }>

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
  const queryClient = useQueryClient()

  const assets = useDisplaySpotPriceStore(
    useShallow((state) =>
      assetIds.reduce<Record<string, string>>((acc, assetId) => {
        acc[assetId] = state.assets[assetId] ?? ""
        return acc
      }, {}),
    ),
  )

  // subscribe to price changes by asset id
  useQueries({
    queries: assetIds.map((assetId) => spotPriceKey(assetId)),
  })

  // invalidate query to subscribe to new assets
  useMount(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_BLOCK_PREFIX, "displayPrices"],
    })
  })

  return useMemo(() => {
    const result: AssetPrice = {}

    Object.entries(assets).forEach(([key, price]) => {
      result[key] = {
        price,
        isLoading: isNullish(price),
      }
    })

    return result
  }, [assets])
}
