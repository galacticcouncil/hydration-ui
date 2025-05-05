import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { isNonNullish } from "remeda"
import { create } from "zustand"
import { combine, persist } from "zustand/middleware"
import { useShallow } from "zustand/shallow"

import { TAssetData } from "@/api/assets"
import { useSubscribedPriceKeys } from "@/api/spotPrice"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetRegistry } from "@/states/assetRegistry"

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

type TStoredAssetPrice = Record<string, string | null>
export type AssetPrice = { price: string; isLoading: boolean; isValid: boolean }

type Store = {
  assets: TStoredAssetPrice
  setAssets: (asset: { id: string; price: string | null }[]) => void
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
      assetIds.reduce<Record<string, string | null | undefined>>(
        (acc, assetId) => {
          acc[assetId] = state.assets[assetId]
          return acc
        },
        {},
      ),
    ),
  )

  // subscribe to price changes by asset id
  useSubscribedPriceKeys(assetIds)

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
  const price = useDisplaySpotPriceStore((state) => state.assets[assetId ?? ""])

  // subscribe to price changes by asset id
  useSubscribedPriceKeys(assetId ? [assetId] : [])

  return {
    price: price ?? "",
    isLoading: price === undefined,
    isValid: isNonNullish(price),
  }
}

const findStableCoinId = (assets: TAssetData[]): string | null => {
  const usdtAsset = assets.find((asset) => asset.symbol === "USDT")
  if (usdtAsset) {
    return usdtAsset.id
  }

  const daiAsset = assets.find((asset) => asset.symbol === "DAI")
  if (daiAsset) {
    return daiAsset.id
  }

  return null
}

export const useDisplayAssetStablecoinUpdate = () => {
  const { assets } = useAssetRegistry()
  const { dataEnv } = useRpcProvider()
  const {
    isStableCoin,
    stableCoinId: currentStableCoinId,
    update,
  } = useDisplayAssetStore()

  useQuery({
    notifyOnChangeProps: [],
    queryKey: ["displayAssetStablecoin", dataEnv],
    queryFn: () => {
      if (!assets.length) return null

      const stableCoinId = findStableCoinId(assets)

      if (
        stableCoinId &&
        isStableCoin &&
        currentStableCoinId !== stableCoinId
      ) {
        // setting stable coin id from asset registry
        update({
          id: stableCoinId,
          symbol: "$",
          isRealUSD: false,
          isStableCoin: true,
          stableCoinId,
        })
      }

      return stableCoinId
    },
  })
}
