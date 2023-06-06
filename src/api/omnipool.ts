import { useApiPromise } from "utils/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { u128, u32 } from "@polkadot/types-codec"
import { ITuple } from "@polkadot/types-codec/types"
import { undefinedNoop } from "utils/helpers"

export const useOmnipoolAsset = (id: u32 | string) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.omnipoolAsset(id), getOmnipoolAsset(api, id))
}

export const useOmnipoolAssets = (noRefresh?: boolean) => {
  const api = useApiPromise()
  return useQuery(
    noRefresh ? QUERY_KEYS.omnipoolAssets : QUERY_KEYS.omnipoolAssetsLive,
    getOmnipoolAssets(api),
  )
}

export const useHubAssetTradability = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.hubAssetTradability, getHubAssetTradability(api))
}

export const getHubAssetTradability = (api: ApiPromise) => async () =>
  api.query.omnipool.hubAssetTradability()

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

export const useOmnipoolPositions = (
  itemIds: Array<u128 | undefined>,
  noRefresh?: boolean,
) => {
  const api = useApiPromise()

  return useQueries({
    queries: itemIds.map((id) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.omnipoolPosition(id)
        : QUERY_KEYS.omnipoolPositionLive(id),
      queryFn: id != null ? getOmnipoolPosition(api, id) : undefinedNoop,
      enabled: !!id,
    })),
  })
}

export const useOmnipoolPosition = (itemId: u128 | undefined) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.omnipoolPosition(itemId),
    itemId != null ? getOmnipoolPosition(api, itemId) : undefinedNoop,
    { enabled: itemId != null },
  )
}

export const useOmnipoolFee = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.omnipoolFee, getOmnipoolFee(api))
}

export const getOmnipoolFee = (api: ApiPromise) => async () => {
  const assetFee = await api.consts.omnipool.assetFee

  return {
    fee: assetFee.toBigNumber().div(1000000),
  }
}

export type OmnipoolPosition = {
  id: u128
  assetId: u32
  amount: u128
  shares: u128
  price: ITuple<[u128, u128]>
}

export const getOmnipoolPosition =
  (api: ApiPromise, itemId: u128) => async () => {
    const res = await api.query.omnipool.positions(itemId)
    const data = res.unwrap()
    const position: OmnipoolPosition = {
      id: itemId,
      assetId: data.assetId,
      amount: data.amount,
      shares: data.shares,
      price: data.price,
    }

    return position
  }

export const getOmnipoolPositions =
  (api: ApiPromise, itemIds: u128[]) => async () => {
    const res = await api.query.omnipool.positions.multi(itemIds)
    const data = res.map((entry) => entry.unwrap())

    return data
  }
