import { useApiPromise } from "utils/network"

import { useEffect, useState } from "react"
import BN from "bignumber.js"
import { useStore } from "../state/store"
import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../utils/queryKeys"

// TODO: determine, whether we want to
// - use subscribe method for each query
// - use react-query and invalidate on each block globally
export function useBalances(address: string) {
  const api = useApiPromise()

  const [value, setValue] = useState<BN | null>(null)

  useEffect(() => {
    let cancel: () => void | undefined
    let cancelled = false
    const callback = api.query.system.account(address, (res) => {
      if (!cancelled) {
        const freeBalance = new BN(res.data.free.toHex())
        const miscFrozenBalance = new BN(res.data.miscFrozen.toHex())
        const feeFrozenBalance = new BN(res.data.feeFrozen.toHex())
        const maxFrozenBalance = miscFrozenBalance.gt(feeFrozenBalance)
          ? miscFrozenBalance
          : feeFrozenBalance

        setValue(freeBalance.minus(maxFrozenBalance))
      }
    })

    callback.then((res) => (cancel = res))
    return () => {
      cancelled = true
      cancel?.()
    }
  }, [api, address])

  return value
}

export const getTokenBalance =
  (api: ApiPromise, account: string, id: string) => async () => {
    const res = await api.query.tokens.accounts(account, id)
    const data = res.toHuman() as
      | { free: string; frozen: string; reserved: string }
      | undefined
    return new BigNumber(data?.free ?? NaN)
  }

export const useTokenBalance = (id: string, accountAddress?: string) => {
  const api = useApiPromise()
  const { account } = useStore()
  return useQuery(
    QUERY_KEYS.tokenBalance(id),
    getTokenBalance(api, accountAddress ?? account?.address ?? "", id),
    {
      enabled: !!account,
    },
  )
}

export function useTokensBalances(tokenIds: string[]) {
  const { account } = useStore()
  const api = useApiPromise()

  const queries = useQueries({
    queries: tokenIds.map((id) => ({
      queryKey: QUERY_KEYS.tokenBalance(id),
      queryFn: () => getTokenBalance(api, account?.address ?? "", id)(),
      enabled: !!account,
    })),
  })

  return queries.map((balance) => balance.data ?? new BigNumber(NaN))
}
