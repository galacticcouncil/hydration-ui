import {
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import {
  bigShift,
  getAddressFromAssetId,
  QUERY_KEY_BLOCK_PREFIX,
  useStableArray,
} from "@galacticcouncil/utils"
import {
  QueryClient,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import Big from "big.js"
import { isNonNullish, isNullish, prop, unique, zipWith } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  borrowReserveQuery,
  lendingPoolAddressProvider,
  useBorrowIncentivesContract,
  useBorrowPoolDataContract,
} from "@/api/borrow"
import { AssetId, TShareToken, useAssets } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import {
  useDisplayAssetStore,
  useDisplaySpotPriceStore,
} from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

import { TradeRouter } from "./trade"
import { xykPoolWithLiquidityQuery } from "./xyk"

export const usePriceSubscriber = () => {
  const { isReady, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(useShallow(prop("setAssets")))
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
          const assetId = key[1]
          if (
            data &&
            (typeof assetId === "string" || typeof assetId === "number")
          ) {
            acc.push(String(assetId))
          }

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
    enabled: isReady && !isNullish(stableCoinId),
    notifyOnChangeProps: [],
    staleTime: 10000,
  })
}

export const spotPriceQuery = (
  context: TProviderContext,
  assetIn: AssetId,
  assetOut: AssetId,
) => {
  const { isReady, sdk } = context

  return queryOptions({
    enabled: isReady && !!assetIn && !!assetOut,
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "spotPrice",
      String(assetIn),
      String(assetOut),
    ],
    queryFn: async () => {
      const spotPrice = await getSpotPrice(sdk.api.router, assetIn, assetOut)()

      return spotPrice
    },
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: AssetId, tokenOut: AssetId) =>
  async () => {
    // Normalize so string/number ids compare equal (USDT→USDT self-price).
    const tokenInParam = String(tokenIn)
    const tokenOutParam = String(tokenOut)
    if (tokenInParam === tokenOutParam)
      return { tokenIn: tokenInParam, tokenOut: tokenOutParam, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string | null = null

    try {
      const res = await tradeRouter.getSpotPrice(
        Number(tokenInParam),
        Number(tokenOutParam),
      )

      if (res) {
        spotPrice = toDecimal(res.amount, res.decimals)
      }
    } catch (e) {
      return { tokenIn: tokenInParam, tokenOut: tokenOutParam, spotPrice }
    }
    return { tokenIn: tokenInParam, tokenOut: tokenOutParam, spotPrice }
  }

export const spotPriceQueryKey = (assetId: AssetId) => [
  "spotPriceKey",
  String(assetId),
]

export const spotPriceKeyQuery = (
  context: TProviderContext,
  assetId: AssetId,
) => {
  const stableCoinId = useDisplayAssetStore.getState().stableCoinId
  const setAssets = useDisplaySpotPriceStore.getState().setAssets
  const { sdk, isReady } = context
  const id = String(assetId)

  return queryOptions({
    queryKey: spotPriceQueryKey(id),
    queryFn: async () => {
      const price = await getSpotPrice(sdk.api.router, id, stableCoinId ?? "")()

      setAssets([{ id, price: price.spotPrice }])

      return price.spotPrice
    },
    notifyOnChangeProps: [],
    staleTime: Infinity,
    enabled: isReady,
  })
}

export const scSpotPriceKeyQuery = (
  rpc: TProviderContext,
  poolDataContract: UiPoolDataProvider | null,
  incentivesContract: UiIncentiveDataProvider | null,
  assetId: AssetId,
  reserveId: string,
) => {
  const setAssets = useDisplaySpotPriceStore.getState().setAssets
  const { isReady } = rpc
  const id = String(assetId)

  return queryOptions({
    queryKey: spotPriceQueryKey(id),
    queryFn: async () => {
      const reserve = await rpc.queryClient.ensureQueryData(
        borrowReserveQuery(
          rpc,
          lendingPoolAddressProvider,
          poolDataContract,
          incentivesContract,
          reserveId,
        ),
      )

      const price = reserve?.priceInUSD ?? null

      setAssets([{ id, price }])

      return price
    },
    enabled: isReady,
  })
}

const SC_ASSETS = new Map<string, string>([
  ["816", getAddressFromAssetId("816")], // AssetType: Token
  ["1816", getAddressFromAssetId("816")], // AssetType: Erc20
])

export const useSubscribedPriceKeys = (assetIds: AssetId[]) => {
  const stableAssetIds = useStableArray(unique(assetIds.map(String)))
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const incentivesContract = useBorrowIncentivesContract()

  return useQueries({
    queries: stableAssetIds.map((assetId) => {
      const reserveId = SC_ASSETS.get(assetId)

      if (reserveId) {
        return scSpotPriceKeyQuery(
          rpc,
          poolDataContract,
          incentivesContract,
          assetId,
          reserveId,
        )
      }
      return spotPriceKeyQuery(rpc, assetId)
    }),
  })
}

const combineShareTokenPrices = (
  queries: UseQueryResult<string | null, Error>[],
  addresses: Array<string>,
) => {
  const isLoading = queries.some((query) => query.isLoading)

  return {
    data: isLoading
      ? new Map<string, string>()
      : new Map(
          addresses.map((poolAddress, index) => {
            const data = queries[index]?.data

            return [poolAddress, data]
          }),
        ),
    isLoading,
  }
}

const shareTokenPriceQuery = (
  ql: QueryClient,
  rpc: TProviderContext,
  shareToken: TShareToken,
) => {
  const stableCoinId = useDisplayAssetStore.getState().stableCoinId

  return queryOptions({
    queryKey: ["shareTokenPrice", shareToken.poolAddress, stableCoinId],
    queryFn: async () => {
      const { poolAddress, assets } = shareToken
      const pool = await ql.ensureQueryData(
        xykPoolWithLiquidityQuery(rpc, ql, poolAddress),
      )

      if (!pool) return null

      const assetsWithPoolBalance = zipWith(
        pool.tokens,
        assets,
        (token, asset) => ({
          balance: token.balance,
          asset,
        }),
      )

      let shareTokenPrice: string | null = null

      for (const { asset, balance } of assetsWithPoolBalance) {
        const spotPriceAsset = await ql.ensureQueryData(
          spotPriceKeyQuery(rpc, asset.id),
        )

        if (spotPriceAsset) {
          const tvl = bigShift(
            Big(balance.toString()).times(2).toString(),
            -asset.decimals,
          )

          shareTokenPrice = tvl
            .times(spotPriceAsset)
            .div(toDecimal(pool.totalLiquidity, shareToken.decimals))
            .toString()

          break
        }
      }

      return shareTokenPrice
    },
  })
}

export const useShareTokenPrices = (poolAddresses: Array<string>) => {
  const { getShareTokensByAddress } = useAssets()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()

  // should be unique keys, since combine will not trigger with duplications
  const uniquePoolAddresses = unique(poolAddresses)

  const shareTokens =
    getShareTokensByAddress(uniquePoolAddresses).filter(isNonNullish)

  return useQueries({
    queries: shareTokens.map((shareToken) =>
      shareTokenPriceQuery(queryClient, rpc, shareToken),
    ),
    combine: (queries) =>
      combineShareTokenPrices(
        queries,
        shareTokens.map((shareToken) => shareToken.poolAddress),
      ),
  })
}
