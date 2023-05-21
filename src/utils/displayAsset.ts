import { useQuery } from "@tanstack/react-query"
import { useApiIds } from "api/consts"
import { useSpotPrice } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useEffect, useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Props = { id: string; amount: BigNumber }

export const useDisplayValue = (props: Props) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(props.id, displayAsset.id)

  const isLoading = spotPrice.isLoading

  const symbol = displayAsset.symbol
  const amount = useMemo(() => {
    if (
      !displayAsset.id ||
      !spotPrice.data ||
      spotPrice.data.spotPrice.isNaN()
    ) {
      return undefined
    }

    return props.amount.times(spotPrice.data.spotPrice)
  }, [props.amount, displayAsset, spotPrice.data])

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

export const useDefaultDisplayAsset = () => {
  const store = useDisplayAssetStore()
  const apiIds = useApiIds()

  useEffect(() => {
    if (!store.id && apiIds.data) {
      store.update({ id: apiIds.data.stableCoinId, symbol: "USD" })
    }
  }, [apiIds.data, store])
}

export const useCoingeckoUsdPrice = () => {
  const twentyFourHoursInMs = 1000 * 60 * 60 * 24

  return useQuery(
    ["coingecko-usd"],
    async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=usd`,
      )
      const json: { dai: { usd: number } } = await res.json()
      return json.dai.usd
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: twentyFourHoursInMs,
    },
  )
}
