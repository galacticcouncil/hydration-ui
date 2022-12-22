import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"

export const useApiIds = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.apiIds, getApiIds(api))
}

export const getApiIds = (api: ApiPromise) => async () => {
  const apiIds = await Promise.all([
    api.consts.omnipool.hdxAssetId,
    api.consts.omnipool.hubAssetId,
    api.consts.omnipool.stableCoinAssetId,
    api.consts.omnipool.nftCollectionId,
  ])
  const [nativeId, hubId, usdId, omnipoolCollectionId] = apiIds.map((c) =>
    c.toString(),
  )

  return { nativeId, hubId, usdId, omnipoolCollectionId }
}
