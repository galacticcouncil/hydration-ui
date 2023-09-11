import { u32 } from "@polkadot/types-codec"
import { useQuery } from "@tanstack/react-query"
import { useSpotPrice, useSpotPrices } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { STABLECOIN_SYMBOL } from "./constants"
import { QUERY_KEYS } from "./queryKeys"
import { Maybe } from "./helpers"

type Props = { id: string; amount: BigNumber }

export const useDisplayValue = (props: Props) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(props.id, displayAsset.id)

  const isLoading = spotPrice.isInitialLoading

  const symbol = displayAsset.symbol
  const amount = useMemo(() => {
    if (!displayAsset.id || !spotPrice.data || spotPrice.data.spotPrice.isNaN())
      return undefined

    return props.amount.times(spotPrice.data.spotPrice)
  }, [props.amount, displayAsset, spotPrice.data])

  return { amount, symbol, isLoading }
}

export const useDisplayPrice = (id: Maybe<string | u32>) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrice = useSpotPrice(id, displayAsset.id)
  const usdPrice = useCoingeckoUsdPrice()

  const isLoading = spotPrice.isInitialLoading || usdPrice.isInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice.data)
      return spotPrice.data
        ? {
            ...spotPrice.data,
            spotPrice: spotPrice.data.spotPrice.times(usdPrice.data),
          }
        : undefined

    return spotPrice.data
  }, [displayAsset.isRealUSD, isLoading, spotPrice.data, usdPrice.data])

  return { data, isLoading, isInitialLoading: isLoading }
}

export const useDisplayPrices = (
  ids: (string | u32)[],
  noRefresh?: boolean,
) => {
  const displayAsset = useDisplayAssetStore()
  const spotPrices = useSpotPrices(ids, displayAsset.id, noRefresh)
  const usdPrice = useCoingeckoUsdPrice()

  const isLoading =
    spotPrices.some((q) => q.isInitialLoading) || usdPrice.isInitialLoading

  const data = useMemo(() => {
    if (isLoading) return undefined

    if (displayAsset.isRealUSD && usdPrice.data)
      return spotPrices.map((sp) =>
        sp.data
          ? { ...sp.data, spotPrice: sp.data.spotPrice.times(usdPrice.data) }
          : undefined,
      )

    return spotPrices.map((sp) => sp.data)
  }, [displayAsset.isRealUSD, isLoading, spotPrices, usdPrice.data])

  return { data, isLoading, isInitialLoading: isLoading }
}

type Asset = {
  id: string | undefined
  symbol: string
  isRealUSD: boolean
  isStableCoin: boolean
  isDollar?: boolean
  stableCoinId: string | undefined
}
export type DisplayAssetStore = Asset & {
  update: (asset: Asset) => void
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
    { name: "hdx-display-asset" },
  ),
)

export const useCoingeckoUsdPrice = () => {
  const displayAsset = useDisplayAssetStore()

  return useQuery(QUERY_KEYS.coingeckoUsd, getCoingeckoSpotPrice, {
    enabled: displayAsset.isRealUSD,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  })
}

export const getCoingeckoSpotPrice = async () => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${STABLECOIN_SYMBOL.toLowerCase()}&vs_currencies=usd`,
  )
  const json = await res.json()
  return json[STABLECOIN_SYMBOL.toLowerCase()].usd
}
