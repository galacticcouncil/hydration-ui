import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u128 } from "@polkadot/types-codec"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { useRpcProvider } from "providers/rpcProvider"

export const useUniques = (
  address: string | AccountId32 | undefined,
  collectionId: string | u128 | undefined,
  noRefresh?: boolean,
) => {
  const { api } = useRpcProvider()

  return useQuery(
    noRefresh
      ? QUERY_KEYS.uniques(address, collectionId)
      : QUERY_KEYS.uniquesLive(address, collectionId),
    getUniques(api, address, collectionId),
    { enabled: !!address && !!collectionId },
  )
}

export const getUniques =
  (
    api: ApiPromise,
    address?: string | AccountId32,
    collectionId?: string | u128,
  ) =>
  async () => {
    const res = await api.query.uniques.account.entries(address, collectionId)
    const data = res.map(([key]) => {
      const [address, collectionId, itemId] = key.args
      return { address, collectionId, itemId }
    })

    return data
  }

export const useUniquesAsset = (
  collectionId: string | u128,
  noRefresh?: boolean,
) => {
  const { api } = useRpcProvider()

  return useQuery(
    noRefresh
      ? QUERY_KEYS.uniquesAsset(collectionId)
      : QUERY_KEYS.uniquesAssetLive(collectionId),
    getUniquesAsset(api, collectionId),
    { enabled: !!collectionId },
  )
}

export const getUniquesAsset =
  (api: ApiPromise, collectionId: string | u128) => async () => {
    const res = await api.query.uniques.asset(collectionId)

    return res
  }
