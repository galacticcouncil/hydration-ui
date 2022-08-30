import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"

export const useAssetMeta = (id: string) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.assetMeta(id), getAssetMeta(api, id))
}

export const getAssetMeta = (api: ApiPromise, id: string) => async () => {
  const res = await api.query.assetRegistry.assetMetadataMap(id)
  const data = res.toHuman() as { symbol: string; decimals: string } | undefined

  return data
}
