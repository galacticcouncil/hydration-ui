import { useStableArray } from "@galacticcouncil/utils"
import { minutesToMilliseconds } from "date-fns"
import { useCallback, useMemo } from "react"
import { isNonNullish, pickBy, unique } from "remeda"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

import { useSubscribedPriceKeys } from "@/api/spotPrice"
import { ENV } from "@/config/env"

const SPOT_PRICE_MAX_AGE = minutesToMilliseconds(5)

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
      id: ENV.VITE_DISPLAY_ASSET_ID,
      stableCoinId: ENV.VITE_DISPLAY_ASSET_ID,
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

type TStoredAssetPrice = Record<string, string | null>
export type AssetPrice = { price: string; isLoading: boolean; isValid: boolean }

type Store = {
  assets: TStoredAssetPrice
  updatedAt: number
  setAssets: (asset: { id: string; price: string | null }[]) => void
}

export const useDisplaySpotPriceStore = create<Store>()(
  persist(
    (set) => ({
      assets: {},
      updatedAt: 0,
      setAssets: (assets) => {
        set((state) => {
          const hasChanges = assets.some(
            (asset) => state.assets[asset.id] !== asset.price,
          )

          if (!hasChanges) return state

          const newValues = { ...state.assets }

          assets.forEach((asset) => (newValues[asset.id] = asset.price))

          return { assets: newValues, updatedAt: Date.now() }
        })
      },
    }),
    {
      // prices are denominated in the display asset — a different one must not
      // read the previous denomination back off disk
      name: `prices-${ENV.VITE_DISPLAY_ASSET_ID}`,
      version: 1,
      // never persist a null: it reads back as "fetched, no price" with no
      // loading state, so a single failed fetch would replay until it expires
      partialize: ({ assets, updatedAt }) => ({
        assets: pickBy(assets, isNonNullish),
        updatedAt,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<Store> | undefined

        if (
          !stored?.assets ||
          Date.now() - (stored.updatedAt ?? 0) > SPOT_PRICE_MAX_AGE
        ) {
          return current
        }

        return {
          ...current,
          assets: stored.assets,
          updatedAt: stored.updatedAt ?? 0,
        }
      },
    },
  ),
)

export const useAssetsPrice = (assetIds: string[]) => {
  const stableAssetIds = useStableArray(unique(assetIds))

  const assets = useDisplaySpotPriceStore(
    useShallow((state) =>
      stableAssetIds.reduce<Record<string, string | null | undefined>>(
        (acc, assetId) => {
          acc[assetId] = state.assets[assetId]
          return acc
        },
        {},
      ),
    ),
  )

  // subscribe to price changes by asset id
  useSubscribedPriceKeys(stableAssetIds)

  const [prices, isLoading] = useMemo(
    () =>
      Object.entries(assets).reduce<[Record<string, AssetPrice>, boolean]>(
        ([prices, isLoading], [key, price]) => [
          {
            ...prices,
            [key]: {
              price: price ?? "",
              isLoading: price === undefined,
              isValid: isNonNullish(price),
            },
          },
          isLoading || price === undefined,
        ],
        [{}, false],
      ),
    [assets],
  )

  const getAssetPrice = useCallback(
    (assetId: string): AssetPrice => {
      return prices[assetId] ?? { price: "", isLoading: false, isValid: false }
    },
    [prices],
  )

  return { prices, isLoading, getAssetPrice }
}

export const useAssetPrice = (assetId?: string): AssetPrice => {
  const stableAssetIds = useStableArray(assetId ? [assetId] : [])
  const price = useDisplaySpotPriceStore((state) => state.assets[assetId ?? ""])

  // subscribe to price changes by asset id
  useSubscribedPriceKeys(stableAssetIds)

  return {
    price: price ?? "",
    isLoading: !!assetId && price === undefined,
    isValid: isNonNullish(price),
  }
}
