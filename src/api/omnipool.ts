import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { REFETCH_INTERVAL } from "utils/constants"
import { useRpcProvider } from "providers/rpcProvider"

import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math-omnipool"
import { PoolToken } from "@galacticcouncil/sdk"
import { useMemo } from "react"
import { useSquidUrl } from "./provider"
import { millisecondsInHour } from "date-fns"
import request from "graphql-request"
import { OmnipoolYieldMetricsDocument } from "graphql/__generated__/squid/graphql"
import { isNotNil } from "utils/helpers"

export type TOmnipoolAssetsData = Array<{
  id: string
  hubReserve: string
  cap: string
  protocolShares: string
  shares: string
  bits: number
  balance: string
}>

export const useOmnipoolDataObserver = () => {
  const { data: omnipoolTokens, isLoading: isOmnipoolTokensLoading } =
    useQuery<TOmnipoolAssetsData>(QUERY_KEYS.omnipoolTokens, {
      enabled: false,
      staleTime: Infinity,
    })

  const { data: hubToken, isLoading: isHubTokenLoading } = useQuery<PoolToken>(
    QUERY_KEYS.hubToken,
    {
      enabled: false,
      staleTime: Infinity,
    },
  )

  const dataMap = useMemo(
    () =>
      omnipoolTokens
        ? new Map(omnipoolTokens.map((asset) => [asset.id, asset]))
        : undefined,
    [omnipoolTokens],
  )

  return {
    data: omnipoolTokens,
    hubToken,
    dataMap,
    isLoading: isHubTokenLoading || isOmnipoolTokensLoading,
  }
}

export const useOmnipoolFee = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.omnipoolFee, getOmnipoolFee(api))
}

export const getOmnipoolFee = (api: ApiPromise) => async () => {
  const { minFee, maxFee } = await api.consts.dynamicFees.assetFeeParameters

  return {
    minFee: minFee.toBigNumber().div(1000000),
    maxFee: maxFee.toBigNumber().div(1000000),
  }
}

export const getHubAssetImbalance = (api: ApiPromise) =>
  api.query.omnipool.hubAssetImbalance()

export const useHubAssetImbalance = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.hubAssetImbalance(),
    () => getHubAssetImbalance(api),
    {
      enabled: isLoaded,
      refetchInterval: REFETCH_INTERVAL,
    },
  )
}

export const useAllLiquidityPositions = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    queryKey: QUERY_KEYS.allOmnipoolPositions,
    queryFn: async () => {
      const collectionId = await api.consts.omnipool.nftCollectionId

      const [positions, uniques] = await Promise.all([
        api.query.omnipool.positions.entries(),
        api.query.uniques.asset.entries(collectionId.toString()),
      ])

      const data = positions.reduce<
        {
          amount: string
          shares: string
          price: string[]
          assetId: string
          owner: string
        }[]
      >((acc, [idRaw, dataRaw]) => {
        const id = idRaw.args[0].toString()

        const owner = uniques
          .find(([key]) => {
            const [, itemId] = key.args
            return itemId.toString() === id
          })?.[1]
          ?.unwrap()
          .owner.toString()

        if (owner) {
          const data = dataRaw.unwrap()

          acc.push({
            amount: data.amount.toString(),
            shares: data.shares.toString(),
            price: data.price.map((e) => e.toString()),
            assetId: data.assetId.toString(),
            owner,
          })
        }
        return acc
      }, [])

      return data
    },
    enabled: isLoaded,
  })
}

export const useOmnipoolMinLiquidity = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.omnipoolMinLiquidity, getOmnipoolMinLiquidity(api))
}

const getOmnipoolMinLiquidity = (api: ApiPromise) => async () => {
  const data = await api.consts.omnipool.minimumPoolLiquidity

  return data.toBigNumber()
}

export const getTradabilityFromBits = (bits: number) => {
  const canBuy = is_buy_allowed(bits)
  const canSell = is_sell_allowed(bits)
  const canAddLiquidity = is_add_liquidity_allowed(bits)
  const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

  return { canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
}

export const useOmnipoolYieldMetrics = () => {
  const url = useSquidUrl()

  return useQuery({
    queryKey: QUERY_KEYS.omnipoolYieldMetrics,
    queryFn: async () => {
      const data = await request(url, OmnipoolYieldMetricsDocument)

      return data.omnipoolAssetsYieldMetrics.nodes.filter(isNotNil)
    },
    staleTime: millisecondsInHour,
  })
}
