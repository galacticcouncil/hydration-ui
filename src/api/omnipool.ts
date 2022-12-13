import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { u128, u32 } from "@polkadot/types-codec"

export const useOmnipoolAsset = (id: u32 | string) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.omnipoolAsset(id), getOmnipoolAsset(api, id))
}

export const useOmnipoolAssets = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.omnipoolAssets, getOmnipoolAssets(api))
}

export const getOmnipoolAsset =
  (api: ApiPromise, id: u32 | string) => async () => {
    const res = await api.query.omnipool.assets(id)

    return res.value
  }

export const getOmnipoolAssets = (api: ApiPromise) => async () => {
  const res = await api.query.omnipool.assets.entries()
  const data = res.map(([key, codec]) => {
    const [id] = key.args
    const data = codec.unwrap()
    return { id, data }
  })

  return data
}

export const useOmnipoolPositions = (itemIds: u128[]) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.omnipoolPositions,
    getOmnipoolPositions(api, itemIds),
    { enabled: !!itemIds.length },
  )
}

export const getOmnipoolPositions =
  (api: ApiPromise, itemIds: u128[]) => async () => {
    const res = await api.query.omnipool.positions.multi(itemIds)
    const data = res.map((entry) => entry.unwrap())

    return data
  }
