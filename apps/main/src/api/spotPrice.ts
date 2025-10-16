import { sor } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import {
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { isNullish, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import {
  useDisplayAssetStore,
  useDisplaySpotPriceStore,
} from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const usePriceSubscriber = () => {
  const { isApiLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(prop("setAssets"))
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))

  return useQuery({
    queryKey: ["displayPrices", stableCoinId],
    queryFn: async () => {
      const activeAssetsIds = queryClient
        .getQueriesData({
          queryKey: ["spotPriceKey"],
          type: "active",
        })
        .reduce<string[]>((acc, [key, data]) => {
          if (data) acc.push(key[1] as string)

          return acc
        }, [])

      const prices = await Promise.all(
        activeAssetsIds.map((assetId) =>
          getSpotPrice(sdk.api.router, assetId, stableCoinId ?? "")(),
        ),
      )

      const storeData = prices.map((price) => ({
        id: price.tokenIn,
        price: price.spotPrice,
      }))

      setAssets(storeData)

      return null
    },
    enabled: isApiLoaded && !isNullish(stableCoinId),
    notifyOnChangeProps: [],
    staleTime: 10000,
  })
}

export const spotPriceQuery = (
  context: TProviderContext,
  assetIn: string,
  assetOut: string,
) => {
  const { isApiLoaded, sdk } = context

  return queryOptions({
    enabled: isApiLoaded && !!assetIn && !!assetOut,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "spotPrice", assetIn, assetOut],
    queryFn: async () => {
      const spotPrice = await getSpotPrice(sdk.api.router, assetIn, assetOut)()

      return spotPrice
    },
  })
}

export const getSpotPrice =
  (tradeRouter: sor.TradeRouter, tokenIn: string, tokenOut: string) =>
  async () => {
    const tokenInParam = tokenIn
    const tokenOutParam = tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string | null = null

    try {
      const res = await tradeRouter.getSpotPrice(
        Number(tokenInParam),
        Number(tokenOutParam),
      )

      if (res) {
        spotPrice = scaleHuman(res.amount.toString(), res.decimals)
      }
    } catch (e) {
      return { tokenIn, tokenOut, spotPrice }
    }
    return { tokenIn, tokenOut, spotPrice }
  }

export const useSubscribedPriceKeys = (assetIds: string[]) => {
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )

  const { isLoaded, sdk } = useRpcProvider()

  useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ["spotPriceKey", assetId],
      queryFn: async () => {
        const price = await getSpotPrice(
          sdk.api.router,
          assetId,
          stableCoinId ?? "",
        )()

        setAssets([{ id: assetId, price: price.spotPrice }])

        return true
      },
      notifyOnChangeProps: [],
      staleTime: Infinity,
      enabled: isLoaded,
    })),
  })
}
