// TODO: remove this before merging
// @ts-nocheck
import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from '@polkadot/types-codec'

export const useStableswapPools = () => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.stableswapPools,
    getStableswapPools(api),
  )
}

export const getStableswapPools = (api: ApiPromise) => async (): Promise<{ id: u32, data: any }[]> => {
  const res = await api.query.stableswap.pools.entries()
  return res.map(([key, codec]) => {
    const [id] = key.args
    const data = codec.unwrap()
    return { id, data }
  })
}
