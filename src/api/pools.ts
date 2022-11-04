import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise, useTradeRouter } from "utils/api"
import { ApiPromise } from "@polkadot/api"
import { TradeRouter } from "@galacticcouncil/sdk"

export const usePools = () => {
  const tradeRouter = useTradeRouter()

  return useQuery(QUERY_KEYS.pools, getPools(tradeRouter))
}

export const usePoolShareToken = (poolId: string) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.poolShareToken(poolId),
    getPoolShareToken(api, poolId),
  )
}

export const usePoolShareTokens = (poolIds: string[]) => {
  const api = useApiPromise()

  return useQueries({
    queries: poolIds.map((id) => ({
      queryKey: QUERY_KEYS.poolShareToken(id),
      queryFn: getPoolShareToken(api, id),
      enabled: !!id,
    })),
  })
}

export const getPools = (tradeRouter: TradeRouter) => async () => {
  try {
    const res = await tradeRouter.getPools()
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}

const getPoolShareToken = (api: ApiPromise, poolId: string) => async () => {
  const token = await api.query.xyk.shareToken(poolId)
  return { poolId, token }
}
