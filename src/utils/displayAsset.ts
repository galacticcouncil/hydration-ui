import { useQuery } from "@tanstack/react-query"
import { useApiIds } from "api/consts"
import { useSpotPrice, useSpotPrices } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useEffect, useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { QUERY_KEYS } from "./queryKeys"

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

export const useDisplayPrice = (id: string) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(id, displayAsset.id)
  const usdPrice = useCoingeckoUsdPrice()

  const isLoading = spotPrice.isInitialLoading || usdPrice.isInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.symbol === "USD" && usdPrice.data)
      return spotPrice.data
        ? {
            ...spotPrice.data,
            spotPrice: spotPrice.data.spotPrice.times(usdPrice.data),
          }
        : undefined

    return spotPrice.data
  }, [displayAsset.symbol, isLoading, spotPrice.data, usdPrice.data])

  return { data, isLoading }
}

export const useDisplayPrices = (ids: string[]) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrices = useSpotPrices(ids, displayAsset.id)
  const usdPrice = useCoingeckoUsdPrice()

  const isLoading =
    spotPrices.some((q) => q.isInitialLoading) || usdPrice.isInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.symbol === "USD" && usdPrice.data)
      return spotPrices.map((sp) =>
        sp.data
          ? { ...sp.data, spotPrice: sp.data.spotPrice.times(usdPrice.data) }
          : undefined,
      )

    return spotPrices.map((sp) => sp.data)
  }, [displayAsset.symbol, isLoading, spotPrices, usdPrice.data])

  return { data, isLoading }
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
  const displayAsset = useDisplayAssetStore()
  const twentyFourHoursInMs = 1000 * 60 * 60 * 24

  return useQuery(
    QUERY_KEYS.coingeckoUsd,
    async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=usd`,
      )
      const json: { dai: { usd: number } } = await res.json()
      console.log(json)
      return json.dai.usd
    },
    {
      enabled: displayAsset.symbol === "USD",
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: twentyFourHoursInMs,
    },
  )
}
