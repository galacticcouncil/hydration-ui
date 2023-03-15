import { ApiPromise } from "@polkadot/api"
import { u128, u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useAccountStore } from "state/store"
import { useApiPromise } from "utils/api"
import { Maybe, undefinedNoop, useQueryReduce } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

const DEPOSIT_NFT_COLLECTION_ID = "2584"

export type DepositNftType = Awaited<
  ReturnType<ReturnType<typeof getDeposits>>
>[number]

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
    const res = await api.query.uniques.account.entries(
      accountId,
      DEPOSIT_NFT_COLLECTION_ID,
    )
    const nfts = res.map(([storageKey]) => {
      const [owner, classId, instanceId] = storageKey.args
      return { owner, classId, instanceId }
    })

    return nfts
  }

export const useAllDeposits = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.allDeposits, getDeposits(api))
}

export const usePoolDeposits = (poolId?: u32 | string) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.poolDeposits(poolId), getDeposits(api), {
    enabled: !!poolId,
    select: (data) =>
      data.filter(
        (item) => item.deposit.ammPoolId.toString() === poolId?.toString(),
      ),
  })
}

export const useOmniPositionId = (positionId: u128 | string) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.omniPositionId(positionId),
    getOmniPositionId(api, positionId),
  )
}

export const useOmniPositionIds = (positionIds: Array<u32 | string>) => {
  const api = useApiPromise()

  return useQueries({
    queries: positionIds.map((id) => ({
      queryKey: QUERY_KEYS.omniPositionId(id.toString()),
      queryFn: getOmniPositionId(api, id.toString()),
      enabled: !!positionIds.length,
    })),
  })
}

const getDeposits = (api: ApiPromise) => async () => {
  const res = await api.query.omnipoolWarehouseLM.deposit.entries()
  return res.map(([key, value]) => ({
    id: key.args[0],
    deposit: value.unwrap(),
  }))
}

const getOmniPositionId =
  (api: ApiPromise, depositionId: u128 | string) => async () => {
    const res = await api.query.omnipoolLiquidityMining.omniPositionId(
      depositionId,
    )
    return { depositionId, value: res.value }
  }

export const useAccountDeposits = (poolId?: u32) => {
  const { account } = useAccountStore()
  const accountDepositIds = useAccountDepositIds(account?.address)
  const deposits = usePoolDeposits(poolId)

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
