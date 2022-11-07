import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { Maybe, undefinedNoop } from "utils/helpers"

export const useAssetDetails = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.assetDetails(id),
    id != null ? getAssetDetails(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

export const useAssetDetailsList = (ids?: Maybe<u32 | string>[]) => {
  const api = useApiPromise()

  return useQueries({
    queries:
      ids?.map((id) => ({
        queryKey: QUERY_KEYS.assetDetails(id),
        queryFn: !!id ? getAssetDetails(api, id) : undefinedNoop,
        enabled: !!id,
      })) ?? [],
  })
}

export const getAssetDetails =
  (api: ApiPromise, id: u32 | string) => async () => {
    if (id.toString() === NATIVE_ASSET_ID) {
      const properties = await api.rpc.system.properties()
      const symbol = properties.tokenSymbol.unwrap()[0]

      return {
        id,
        name: symbol.toHuman(),
        assetType: "Token",
        existentialDeposit: "",
        locked: false,
      }
    }

    const res = await api.query.assetRegistry.assets(id)
    const data = res.toHuman() as {
      name: string
      assetType: "Token" | { PoolShare: string[] }
      existentialDeposit: any
      locked: boolean
    }
    return { ...data, id }
  }
