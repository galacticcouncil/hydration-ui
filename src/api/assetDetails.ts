import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"

export const useAssetDetails = (id: string) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.assetDetails(id), getAssetDetails(api, id))
}

export const getAssetDetails = (api: ApiPromise, id: string) => async () => {
  const res = await api.query.assetRegistry.assets(id)
  const data = res.toHuman() as {
    name: string
    assetType: "Token" | { PoolShare: string[] }
    existentialDeposit: any
    locked: boolean
  }

  return data
}
