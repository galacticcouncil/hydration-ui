import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { isNotNil, undefinedNoop } from "utils/helpers"
import { StableSwap } from "@galacticcouncil/sdk"
import { useSquidUrl } from "./provider"
import request from "graphql-request"
import { StableswapYieldMetricsDocument } from "graphql/__generated__/squid/graphql"
import { millisecondsInHour } from "date-fns"

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

  return useQuery({
    queryKey: QUERY_KEYS.stablepoolFees(poolIds),
    queryFn: async () => {
      const data = await request(url, StableswapYieldMetricsDocument, {
        filter: { poolIds },
      })

      return data.stableswapYieldMetrics.nodes.filter(isNotNil)
    },
    staleTime: millisecondsInHour,
    enabled: !!poolIds.length,
  })
}
