import { ApiPromise } from "@polkadot/api"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { Maybe, undefinedNoop } from "utils/helpers"
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

export const getAccountDepositIds =
  (api: ApiPromise, accountId: AccountId32 | string) => async () => {
    const res = await api.query.uniques.account.entries(accountId, "1337")
    const nfts = res.map(([storageKey]) => {
      const [owner, classId, instanceId] = storageKey.args
      return { owner, classId, instanceId }
    })

    return nfts
  }
