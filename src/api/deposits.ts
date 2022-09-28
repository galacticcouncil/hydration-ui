import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { DEPOSIT_CLASS_ID, useApiPromise } from "utils/network"
import { QUERY_KEYS } from "utils/queryKeys"
import { u128 } from "@polkadot/types-codec"
import { AccountId32 } from "@polkadot/types/interfaces"

export type DepositType = Awaited<
  ReturnType<ReturnType<typeof getDeposits>>
>[number]

export const useDeposits = (poolId?: string) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.deposits(poolId), getDeposits(api, poolId))
}

export const useAllDeposits = (poolIds?: string[]) => {
  const api = useApiPromise()
  const ids = poolIds?.filter((id): id is string => !!id) ?? []

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: QUERY_KEYS.deposits(id),
      queryFn: getDeposits(api, id),
      enabled: !!id,
    })),
  })
}

export const useDeposit = (id: u128) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.deposit(id), getDeposit(api, id))
}

export const useAccountDepositIds = (accountId: AccountId32 | string) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.accountDepositIds(accountId),
    getAccountDepositIds(api, accountId),
    { enabled: !!accountId },
  )
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

export const getAccountDepositIds =
  (api: ApiPromise, accountId: AccountId32 | string) => async () => {
    const res = await api.query.uniques.account.entries(
      accountId,
      DEPOSIT_CLASS_ID,
    )
    const nfts = res.map(([storageKey]) => {
      const [owner, classId, instanceId] = storageKey.args
      return { owner, classId, instanceId }
    })

    return nfts
  }

export const getDeposit = (api: ApiPromise, id: u128) => async () => {
  const res = await api.query.warehouseLM.deposit(id)
  const data = res.unwrap()

  return data
}
