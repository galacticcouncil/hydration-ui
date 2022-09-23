import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/types"
import { undefinedNoop } from "utils/helpers"

export const useAssetMeta = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.assetMeta(id),
    id != null ? getAssetMeta(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

export const getAssetMeta = (api: ApiPromise, id: u32 | string) => async () => {
  const res = await api.query.assetRegistry.assetMetadataMap(id)
  return { id, data: res.unwrapOr(null) }
}
