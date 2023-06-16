import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u128 } from "@polkadot/types-codec"
import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"

export const useUniques = (
  address: string | AccountId32,
  collectionId: string | u128,
  noRefresh?: boolean,
) => {
  const api = useApiPromise()

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
    address: string | AccountId32,
    collectionId: string | u128,
  ) =>
  async () => {
    const res = await api.query.uniques.account.entries(address, collectionId)
    const data = res.map(([key]) => {
      const [address, collectionId, itemId] = key.args
      return { address, collectionId, itemId }
    })

    return data
  }
