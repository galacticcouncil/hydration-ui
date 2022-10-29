import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { Maybe, undefinedNoop } from "utils/helpers"

export const useAssetMeta = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.assetMeta(id),
    id != null ? getAssetMeta(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

export const useAssetMetaList = (ids: Array<Maybe<u32 | string>>) => {
  const api = useApiPromise()

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: QUERY_KEYS.assetMeta(id),
      queryFn: id != null ? getAssetMeta(api, id) : undefinedNoop,
      enabled: !!id,
    })),
  })
}

export const getAssetMeta = (api: ApiPromise, id: u32 | string) => async () => {
  if (id.toString() === NATIVE_ASSET_ID) {
    const properties = await api.rpc.system.properties()

    const decimals = properties.tokenDecimals.unwrap()[0]
    const symbol = properties.tokenSymbol.unwrap()[0]

    return {
      id,
      data: {
        symbol,
        decimals,
      },
    }
  }

  const res = await api.query.assetRegistry.assetMetadataMap(id)
  return { id, data: res.unwrapOr(null) }
}
