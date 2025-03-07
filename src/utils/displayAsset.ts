import { u32 } from "@polkadot/types-codec"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { STABLECOIN_SYMBOL } from "./constants"
import { QUERY_KEYS } from "./queryKeys"
import { isNotNil } from "./helpers"
import { TShareToken, useAssets } from "providers/assets"
import { useTotalIssuances } from "api/totalIssuance"
import { useXYKSDKPools } from "api/xyk"
import { useAssetsPrice } from "state/displayPrice"
import { useShallow } from "hooks/useShallow"

//TODO: mb create a hook for a single share token
export const useDisplayShareTokenPrice = (ids: string[]) => {
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )
  const { getShareTokens, getAssetWithFallback } = useAssets()
  const pools = getShareTokens(ids) as TShareToken[]

  const { data: xykPools = [], isLoading: isPoolsLoading } = useXYKSDKPools()
  const { data: issuances, isLoading: isIssuanceLoading } = useTotalIssuances()

  const shareTokensTvl = useMemo(() => {
    return pools
      .map((shareToken) => {
        const { poolAddress } = shareToken ?? {}

        if (!poolAddress) return undefined

        const pool = xykPools.find((pool) => poolAddress === pool.address)

        if (!pool) return undefined

        const { tokens } = pool
        const [assetA] = tokens

        if (!assetA) return undefined
        const { balance, decimals, id } = assetA

        const assetABalance = BigNumber(balance).shiftedBy(-decimals)

        const tvl = assetABalance.multipliedBy(2)

        return {
          spotPriceId: id,
          tvl,
          shareTokenId: shareToken.id,
        }
      })
      .filter(isNotNil)
  }, [pools, xykPools])

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    shareTokensTvl.map((shareTokenTvl) => shareTokenTvl.spotPriceId),
  )

  const isLoading = isIssuanceLoading || isPoolsLoading || isPriceLoading

  const data = useMemo(() => {
    return shareTokensTvl
      .map((shareTokenTvl) => {
        const spotPrice = getAssetPrice(shareTokenTvl.spotPriceId).price

        const tvlDisplay = shareTokenTvl.tvl.multipliedBy(spotPrice)

        const totalIssuance = issuances?.get(shareTokenTvl.shareTokenId)

        const shareTokenMeta = getAssetWithFallback(shareTokenTvl.shareTokenId)

        if (!totalIssuance) return undefined

        const shareTokenDisplay = tvlDisplay
          .div(totalIssuance.shiftedBy(-shareTokenMeta.decimals))
          .toFixed(6)

        return {
          tokenIn: shareTokenTvl.shareTokenId,
          tokenOut: stableCoinId,
          spotPrice: shareTokenDisplay,
        }
      })
      .filter(isNotNil)
  }, [
    getAssetWithFallback,
    issuances,
    shareTokensTvl,
    getAssetPrice,
    stableCoinId,
  ])

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
    { name: "hdx-display-asset", version: 1 },
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

type simplifiedAsset = {
  id: string | u32
  name: string
  symbol: string
}

export const useCoingeckoPrice = (assets: simplifiedAsset[]) => {
  return useQuery(
    [QUERY_KEYS.coingeckoUsd, assets.map((asset) => asset.name)],
    async () => {
      const prices = await getCoingeckoAssetPrices(assets)
      return prices
    },
    {
      enabled: assets.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1000 * 60 * 60, // 1h
    },
  )
}

export const getCoingeckoAssetPrices = async (
  assets: simplifiedAsset[],
): Promise<{ [key: string]: number }> => {
  const formattedAssetNames = assets
    .map((asset) => {
      let formattedName = asset.name.toLowerCase()
      if (asset.name.includes(" ")) {
        formattedName = asset.name.replace(/\s+/g, "-").toLowerCase()
      } else if (asset.name.toLowerCase() === "phala") {
        formattedName = "pha"
      } else if (asset.name.toLowerCase() === "glimmer") {
        formattedName = "moonbeam"
      }
      return formattedName
    })
    .join(",")

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${formattedAssetNames}&vs_currencies=usd`
  const res = await fetch(url)
  const json = await res.json()

  const pricesById: { [key: string]: number } = assets.reduce(
    (acc, asset) => {
      const formattedName = asset.name.toLowerCase().replace(/\s+/g, "-")
      acc[asset.id.toString()] = json[formattedName]?.usd || undefined
      return acc
    },
    {} as { [key: string]: number },
  )

  return pricesById
}
