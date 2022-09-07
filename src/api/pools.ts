import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"

export const getPools = (api: ApiPromise) => async () => {
  const res = await api.query.xyk.poolAssets.entries()
  const pools = res.map(([storageKey, data]) => {
    const [id] = storageKey.args
    const [assetA, assetB] = data.unwrap()

    return { id, assetA, assetB }
  })

  return pools
}

export const usePools = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.pools, getPools(api))
}
