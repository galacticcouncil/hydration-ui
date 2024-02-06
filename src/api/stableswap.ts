import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { undefinedNoop } from "utils/helpers"

export const useStableswapPools = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.stableswapPools, getStableswapPools(api))
}

export const useStableswapPool = (poolId?: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.stableswapPool(poolId),
    poolId ? getStableswapPool(api, poolId) : undefinedNoop,
    { enabled: !!poolId },
  )
}

export const getStableswapPools = (api: ApiPromise) => async () => {
  const res = await api.query.stableswap.pools.entries()

  return res.map(([key, codec]) => {
    const id = key.args[0].toString()
    const data = codec.unwrap()
    return { id: id.toString(), data }
  })
}

export const getStableswapPool =
  (api: ApiPromise, poolId: string) => async () => {
    const res = await api.query.stableswap.pools(poolId)
    return res.unwrap()
  }
