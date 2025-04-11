import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { undefinedNoop } from "utils/helpers"
import { StableSwap } from "@galacticcouncil/sdk"
import { useSquidUrl } from "./provider"
import request, { gql } from "graphql-request"

export const useStableswapPool = (poolId?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.stableswapPool(poolId),
    poolId ? getStableswapPool(api, poolId) : undefinedNoop,
    { enabled: !!poolId },
  )
}

export const getStableswapPool =
  (api: ApiPromise, poolId: string) => async () => {
    const res = await api.query.stableswap.pools(poolId)
    return res.unwrap()
  }

export const useStableSDKPools = () => {
  return useQuery<StableSwap[]>(QUERY_KEYS.stablePools, {
    enabled: false,
    staleTime: Infinity,
  })
}

export const useStablepoolFees = (poolIds: string[]) => {
  const url = useSquidUrl()

  return useQuery(
    QUERY_KEYS.stablepoolFees(poolIds),
    async () => {
      return await request<{
        stableswapYieldMetrics: {
          nodes: {
            poolId: string
            projectedAprPerc: string
            projectedApyPerc: string
          }[]
        }
      }>(
        url,
        gql`
          query StablepoolFees($poolIds: [String!]!) {
            stableswapYieldMetrics(
              filter: { poolIds: $poolIds, interval: _1MON_ }
            ) {
              nodes {
                poolId
                projectedAprPerc
                projectedApyPerc
              }
            }
          }
        `,
        { poolIds },
      )
    },
    {
      enabled: !!poolIds.length,
      select: (data) => data.stableswapYieldMetrics.nodes,
    },
  )
}
