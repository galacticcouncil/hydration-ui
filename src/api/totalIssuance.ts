import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import BigNumber from "bignumber.js"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/types"
import { undefinedNoop } from "utils/helpers"

const getTotalIssuance = (api: ApiPromise, lpToken: u32) => async () => {
  const res = await api.query.tokens.totalIssuance(lpToken)
  return new BigNumber(res.toHex())
}

export const useTotalIssuance = (lpToken: Maybe<u32>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.totalIssuance(lpToken),
    lpToken != null ? getTotalIssuance(api, lpToken) : undefinedNoop,
    { enabled: !!lpToken },
  )
}
