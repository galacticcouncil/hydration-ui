import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"

export const getPools = (api: ApiPromise) => async () => {
  const res = await api.query.xyk.poolAssets.entries()
  const pools = res.map((data) => {
    const [storageKey, codec] = data

    const id = (storageKey.toHuman() as string[])[0]
    const [assetA, assetB] = codec.toHuman() as string[]

    return { id, assetA, assetB }
  })

  return pools
}

export const usePools = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.pools, getPools(api))
}
