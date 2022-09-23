import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import BigNumber from "bignumber.js"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/types"
import { undefinedNoop } from "utils/helpers"

export const useTotalIssuance = (token: Maybe<u32>) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.totalIssuance(token),
    token ? getTotalIssuance(api, token) : undefinedNoop,
    { enabled: !!token },
  )
}

export const useTotalIssuances = (tokens: Maybe<u32>[]) => {
  const api = useApiPromise()

  const tokenIds = tokens.filter((token): token is u32 => !!token)

  return useQueries({
    queries: tokenIds.map((id) => ({
      queryKey: QUERY_KEYS.totalIssuance(id),
      queryFn: getTotalIssuance(api, id),
      enabled: !!id,
    })),
  })
}

export const getTotalIssuance = (api: ApiPromise, token: u32) => async () => {
  const res = await api.query.tokens.totalIssuance(token)
  const total = new BigNumber(res.toHex())
  return { token, total }
}
