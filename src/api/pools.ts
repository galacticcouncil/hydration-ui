import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"
import { AccountId32 } from "@polkadot/types/interfaces"
import {
  AugmentedQuery,
  MethodResult,
  PromiseResult,
  QueryableStorageEntry,
} from "@polkadot/api/types"
import {
  AnyFunction,
  AnyNumber,
  AnyTuple,
  Observable,
} from "@polkadot/types/types"
import { Option, u32 } from "@polkadot/types"
import { XcmV1MultiLocation } from "@polkadot/types/lookup"

export const getPools = (api: ApiPromise) => async () => {
  const res = await api.query.xyk.poolAssets.entries()
  const pools = res.map(([storageKey, data]) => {
    const [id] = storageKey.args
    const [assetA, assetB] = data.unwrap()

    return { id, assetA, assetB }
  })

  return pools
}

export const usePools = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.pools, getPools(api))
}

const getPoolShareToken =
  (api: ApiPromise, poolId: AccountId32) => async () => {
    return await api.query.xyk.shareToken(poolId)
  }

export const usePoolShareToken = (poolId: AccountId32) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.poolShareToken(poolId),
    getPoolShareToken(api, poolId),
  )
}
