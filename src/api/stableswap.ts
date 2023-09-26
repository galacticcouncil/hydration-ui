// TODO: remove this before merging
// @ts-nocheck
import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"
import { useRpcProvider } from "providers/rpcProvider"

export const useStableswapPools = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.stableswapPools, getStableswapPools(api))
}

export const useStableswapPool = (poolId: u32) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.stableswapPool(poolId),
    getStableswapPool(api, poolId),
  )
}

export const getStableswapPools =
  (api: ApiPromise) => async (): Promise<{ id: u32; data: any }[]> => {
    const res = await api.query.stableswap.pools.entries()
    return res.map(([key, codec]) => {
      const [id] = key.args
      const data = codec.unwrap()
      return { id, data }
    })
  }

export const getStableswapPool =
  (api: ApiPromise, poolId: u32) => async (): Promise<any> => {
    const res = await api.query.stableswap.pools(poolId)
    return res.unwrap()
  }
