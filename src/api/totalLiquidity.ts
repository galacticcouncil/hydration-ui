import { useApiPromise } from "utils/api"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { Maybe, undefinedNoop } from "utils/helpers"

export const useTotalLiquidity = (id: Maybe<AccountId32 | string>) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.totalLiquidity(id),
    id != null ? getTotalLiquidity(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

export const useTotalLiquidities = (ids: AccountId32[]) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.totalLiquidities(ids.map((id) => id.toHuman())),
    getTotalLiquidities(api, ids),
  )
}

export const getTotalLiquidity =
  (api: ApiPromise, id: string | AccountId32) => async () => {
    const res = await api.query.xyk.totalLiquidity(id)
    return res.toBigNumber()
  }

export const getTotalLiquidities =
  (api: ApiPromise, ids: AccountId32[]) => async () => {
    const requests = ids.map((id) => getTotalLiquidity(api, id)())
    const results = await Promise.all(requests)
    const totals = results.reduce((acc, total) => acc.plus(total), new BN(0))

    return totals
  }
