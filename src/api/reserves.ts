import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { Maybe, undefinedNoop } from "utils/helpers"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useRpcProvider } from "providers/rpcProvider"

export const useReserves = (
  token: Maybe<u32>,
  address: string | AccountId32,
) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.reserves(token, address),
    token ? getReserves(api, token, address) : undefinedNoop,
  )
}

export const getReserves =
  (api: ApiPromise, token: u32, address: string | AccountId32) => async () => {
    const res = await api.query.tokens.reserves(address, token)
    const data = res.map((data) => {
      return {
        id: data.id.toString(),
        value: data.amount.toBigNumber(),
      }
    })
    return data
  }
