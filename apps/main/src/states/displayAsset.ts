import { create } from "zustand"
import { persist } from "zustand/middleware"

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
