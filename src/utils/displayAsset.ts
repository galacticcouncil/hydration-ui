import { useApiIds } from "api/consts"
import { useSpotPrice } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Props = { id: string; amount: BigNumber }

export const useDisplayValue = (props: Props) => {
  const apiIds = useApiIds()
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(props.id, displayAsset.id)

  const isLoading = apiIds.isLoading || spotPrice.isLoading

  const symbol = displayAsset.symbol
  const amount = useMemo(() => {
    if (!displayAsset.id && !apiIds.data?.stableCoinId) {
      return undefined
    }
    if (!displayAsset.id && apiIds.data?.stableCoinId) {
      displayAsset.update({ id: apiIds.data.stableCoinId, symbol: "USD" })
    }
    if (!spotPrice.data || spotPrice.data.spotPrice.isNaN()) {
      return undefined
    }

    return props.amount.times(spotPrice.data.spotPrice)
  }, [props.amount, apiIds.data?.stableCoinId, displayAsset, spotPrice.data])

  return { amount, symbol, isLoading }
}

export type DisplayAssetStore = {
  id: string
  symbol: string
  update: (value: { id: string; symbol: string }) => void
}

export const useDisplayAssetStore = create<DisplayAssetStore>()(
  persist((set) => ({ id: "", symbol: "", update: (value) => set(value) }), {
    name: "hdx-display-asset",
  }),
)
