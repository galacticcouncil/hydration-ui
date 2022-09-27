import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/network"
import { QUERY_KEYS } from "utils/queryKeys"
import { u128 } from "@polkadot/types-codec"

export type DepositType = Awaited<
  ReturnType<ReturnType<typeof getDeposits>>
>[number]

export const useDeposits = (poolId?: string) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.deposits(poolId), getDeposits(api, poolId))
}

export const useDeposit = (id: u128) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.deposit(id), getDeposit(api, id))
}

export const getDeposits = (api: ApiPromise, poolId?: string) => async () => {
  const res = await api.query.warehouseLM.deposit.entries()
  const data = res.map(([storageKey, codec]) => {
    const [id] = storageKey.args
    const deposit = codec.unwrap()
    return { id, deposit }
  })

  if (poolId) return data.filter(({ deposit }) => deposit.ammPoolId.eq(poolId))

  return data
}

export const getDeposit = (api: ApiPromise, id: u128) => async () => {
  const res = await api.query.warehouseLM.deposit(id)
  const data = res.unwrap()

  return data
}
