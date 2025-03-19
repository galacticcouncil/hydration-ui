import { TradeRouter } from "@galacticcouncil/sdk"
import {
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { isNullish } from "remeda"
import { useShallow } from "zustand/shallow"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import {
  useDisplayAssetStore,
  useDisplaySpotPriceStore,
} from "@/states/displayAsset"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

import { getTradeRouter } from "./provider"

export const usePriceSubscriber = () => {
  const { isApiLoaded } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  return useQuery({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "displayPrices", stableCoinId],
    queryFn: async () => {
      const tradeRouter = getTradeRouter()
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
          getSpotPrice(tradeRouter, assetId, stableCoinId ?? "")(),
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

export const spotPrice = (
  context: TProviderContext,
  assetIn: string,
  assetOut: string,
) => {
  const { isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "spotPrice", assetIn, assetOut],
    queryFn: async () => {
      const { spotPrice } = await getSpotPrice(
        getTradeRouter(),
        assetIn,
        assetOut,
      )()

      return spotPrice
    },
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    const tokenInParam = tokenIn
    const tokenOutParam = tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string = "NaN"

    try {
      const res = await tradeRouter.getBestSpotPrice(
        tokenInParam,
        tokenOutParam,
      )

      if (res) {
        spotPrice = res.amount
          .shiftedBy(-res.decimals)
          .decimalPlaces(12)
          .toString()
      }
    } catch (e) {
      return { tokenIn, tokenOut, spotPrice }
    }
    return { tokenIn, tokenOut, spotPrice }
  }

export const usePriceKeys = (assetIds: string[]) => {
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )

  const { isLoaded } = useRpcProvider()

  useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ["spotPriceKey", assetId],
      queryFn: async () => {
        const price = await getSpotPrice(
          getTradeRouter(),
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
