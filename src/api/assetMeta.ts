import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"

export const useAssetMeta = (id: u32) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assetMeta(id.toString()), getAssetMeta(api, id))
}

export const getAssetMeta = (api: ApiPromise, id: u32) => async () => {
  const res = await api.query.assetRegistry.assetMetadataMap(id)
  const data = res.toHuman() as { symbol: string; decimals: string } | undefined

  return data
}
