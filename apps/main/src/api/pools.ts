import { PoolToken, PoolType } from "@galacticcouncil/sdk"
import { OmniPoolToken } from "@galacticcouncil/sdk/build/types/pool/omni/OmniPool"
import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useActiveQueries } from "@/hooks/useActiveQueries"
import { useRpcProvider } from "@/providers/rpcProvider"
import { HUB_ID, QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

import { getTradeRouter } from "./provider"

export type TOmnipoolAssetsData = Array<{
  id: string
  hubReserve: string
  cap: string
  protocolShares: string
  shares: string
  bits: number
  balance: string
}>

export const allPools = (queryClient: QueryClient) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "allPools"],
    queryFn: async () => {
      const pools = await getTradeRouter().getPools()

      const stablePoolsData = pools.filter(
        (pool) => pool.type === PoolType.Stable,
      )

      const omnipoolTokensData = (
        pools.find((pool) => pool.type === PoolType.Omni)
          ?.tokens as OmniPoolToken[]
      ).map((token) => {
        return {
          ...token,
          shares: token.shares?.toString(),
          protocolShares: token.protocolShares?.toString(),
          cap: token.cap?.toString(),
          hubReserves: token.hubReserves?.toString(),
        }
      })

      const { tokens, hub } = omnipoolTokensData.reduce<{
        tokens: TOmnipoolAssetsData
        hub: PoolToken
      }>(
        (acc, token) => {
          if (token.id === HUB_ID) {
            acc.hub = token
          } else {
            const {
              id,
              hubReserves,
              cap,
              protocolShares,
              shares,
              tradeable,
              balance,
            } = token

            acc.tokens.push({
              id,
              hubReserve: hubReserves,
              cap,
              protocolShares,
              shares,
              bits: tradeable,
              balance,
            } as TOmnipoolAssetsData[number])
          }

          return acc
        },
        { tokens: [], hub: {} as PoolToken },
      )

      const xykPoolsData = pools.filter((pool) => pool.type === PoolType.XYK)

      queryClient.setQueryData(omnipoolTokens.queryKey, tokens)
      queryClient.setQueryData(stablePools.queryKey, stablePoolsData)
      queryClient.setQueryData(hubToken.queryKey, hub)
      queryClient.setQueryData(xykPools.queryKey, xykPoolsData)

      return false
    },
  })

export const useAllPools = () => {
  const { isApiLoaded } = useRpcProvider()
  const queryClient = useQueryClient()
  const activeQueriesAmount = useActiveQueries(["pools"])

  return useQuery({
    ...allPools(queryClient),
    notifyOnChangeProps: [],
    enabled: isApiLoaded && !!activeQueriesAmount,
  })
}

export const xykPools = queryOptions({
  queryKey: ["pools", "xyk"],
  staleTime: Infinity,
})

export const stablePools = queryOptions({
  queryKey: ["pools", "stable"],
  staleTime: Infinity,
})

export const hubToken = queryOptions({
  queryKey: ["pools", "hub"],
  staleTime: Infinity,
})

export const omnipoolTokens = queryOptions({
  queryKey: ["pools", "omnipool"],
  staleTime: Infinity,
})
