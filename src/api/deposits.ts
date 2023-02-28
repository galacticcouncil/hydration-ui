import { ApiPromise } from "@polkadot/api"
import { u128, u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { useAccountStore } from "state/store"
import { useApiPromise } from "utils/api"
import { Maybe, undefinedNoop, useQueryReduce } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

export const useAccountDepositIds = (
  accountId: Maybe<AccountId32 | string>,
) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.accountDepositIds(accountId),
    accountId != null ? getAccountDepositIds(api, accountId) : undefinedNoop,
    { enabled: !!accountId },
  )
}

const getAccountDepositIds =
  (api: ApiPromise, accountId: AccountId32 | string) => async () => {
    const res = await api.query.uniques.account.entries(accountId, "1337")
    const nfts = res.map(([storageKey]) => {
      const [owner, classId, instanceId] = storageKey.args
      return { owner, classId, instanceId }
    })

    return nfts
  }

export const useDeposit = (id: Maybe<u128>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.deposit(id),
    id != null ? getDeposit(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

const getDeposit = (api: ApiPromise, id: u128) => async () => {
  const res = await api.query.omnipoolWarehouseLM.deposit(id)
  return res.unwrap()
}

export const useDeposits = (poolId: u32 | string) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.deposits(poolId), getDeposits(api, poolId))
}

const getDeposits = (api: ApiPromise, poolId: u32 | string) => async () => {
  const res = await api.query.omnipoolWarehouseLM.deposit.entries()
  return res
    .map(([key, value]) => ({
      id: key.args[0],
      deposit: value.unwrap(),
    }))
    .filter((item) => item.deposit.ammPoolId.toString() === poolId.toString())
}

export const useAccountDeposits = (poolId: u32) => {
  const { account } = useAccountStore()
  const accountDepositIds = useAccountDepositIds(account?.address)
  const deposits = useDeposits(poolId)

  return useQueryReduce(
    [accountDepositIds, deposits] as const,
    (accountDepositIds, deposits) => {
      const ids = new Set<string>(
        accountDepositIds?.map((i) => i.instanceId.toString()),
      )
      return deposits.filter((item) => ids.has(item.id.toString()))
    },
  )
}
