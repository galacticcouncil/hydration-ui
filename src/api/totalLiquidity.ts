import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"

export const useTotalLiquidity = (id: string) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.totalLiquidity(id), getTotalLiquidity(api, id))
}

export const useTotalLiquidities = (ids: string[]) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.totalLiquidities(ids),
    getTotalLiquidities(api, ids),
  )
}

export const getTotalLiquidity = (api: ApiPromise, id: string) => async () => {
  const res = await api.query.xyk.totalLiquidity(id)
  const bn = new BN(res.toHex())

  return bn
}

export const getTotalLiquidities =
  (api: ApiPromise, ids: string[]) => async () => {
    const requests = ids.map((id) => getTotalLiquidity(api, id)())
    const results = await Promise.all(requests)
    const totals = results.reduce((acc, total) => acc.plus(total), new BN(0))

    return totals
  }
