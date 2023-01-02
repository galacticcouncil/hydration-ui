import { useApiPromise } from "utils/api"
import { useQueries, useQuery } from "@tanstack/react-query"
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

    return res.unwrap()
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

  return useQueries({
    queries: itemIds.map((id) => ({
      queryKey: QUERY_KEYS.omnipoolPosition(id),
      queryFn: getOmnipoolPosition(api, id),
      enabled: !!itemIds.length,
    })),
  })
}

export const useOmnipoolFee = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.omnipoolFee, getOmnipoolFee(api))
}

export const getOmnipoolFee = (api: ApiPromise) => async () => {
  const [assetFee, protocolFee] = await Promise.all([
    api.consts.omnipool.assetFee,
    api.consts.omnipool.protocolFee,
  ])

  return {
    fee: assetFee.toBigNumber().plus(protocolFee.toBigNumber()).div(10000),
  }
}

export const getOmnipoolPosition =
  (api: ApiPromise, itemId: u128) => async () => {
    const res = await api.query.omnipool.positions(itemId)
    const data = res.unwrap()

    return {
      id: itemId,
      assetId: data.assetId,
      amount: data.amount,
      shares: data.shares,
      price: data.price,
    }
  }

export const getOmnipoolPositions =
  (api: ApiPromise, itemIds: u128[]) => async () => {
    const res = await api.query.omnipool.positions.multi(itemIds)
    const data = res.map((entry) => entry.unwrap())

    return data
  }
