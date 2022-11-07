import { AccountId32 } from "@polkadot/types/interfaces"
import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { Maybe, undefinedNoop } from "utils/helpers"

export const useAccountBalances = (id: Maybe<AccountId32 | string>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.accountBalances(id),
    !!id ? getAccountBalances(api, id) : undefinedNoop,
  )
}

export const getAccountBalances =
  (api: ApiPromise, accountId: AccountId32 | string) => async () => {
    const [tokens, native] = await Promise.all([
      api.query.tokens.accounts.entries(accountId),
      api.query.system.account(accountId),
    ])
    const balances = tokens.map(([key, data]) => {
      const [_, id] = key.args
      return { id, data }
    })

    return { native, balances }
  }
