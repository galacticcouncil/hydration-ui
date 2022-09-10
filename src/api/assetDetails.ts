import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"

export const useAssetDetails = (id: u32) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.assetDetails(id.toString()),
    getAssetDetails(api, id),
  )
}

export const getAssetDetails = (api: ApiPromise, id: u32) => async () => {
  const res = await api.query.assetRegistry.assets(id)
  const data = res.toHuman() as {
    name: string
    assetType: "Token" | { PoolShare: string[] }
    existentialDeposit: any
    locked: boolean
  }

  return data
}
