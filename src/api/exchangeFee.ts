import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/api"
import { ApiPromise } from "@polkadot/api"
import BN from "bignumber.js"
import { TRADING_FEE } from "utils/constants"

export const useExchangeFee = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.exchangeFee, getExchangeFee(api))
}

export const getExchangeFee = (api: ApiPromise) => async () => {
  const res = await api.consts.xyk.getExchangeFee
  const [fee, precision] = res.toJSON() as number[]

  if (!fee || !precision) return TRADING_FEE

  return new BN(fee).div(new BN(precision))
}
