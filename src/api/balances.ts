import { NATIVE_ASSET_ID, useApiPromise } from "utils/network"

import { useStore } from "../state/store"
import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../utils/queryKeys"

function calculateFreeBalance(
  free: BigNumber,
  miscFrozen: BigNumber,
  feeFrozen: BigNumber,
) {
  const maxFrozenBalance = miscFrozen.gt(feeFrozen) ? miscFrozen : feeFrozen
  return free.minus(maxFrozenBalance)
}

export const getTokenBalance =
  (api: ApiPromise, account: string, id: string) => async () => {
    if (id === NATIVE_ASSET_ID) {
      const res = await api.query.system.account(account)
      const freeBalance = new BigNumber(res.data.free.toHex())
      const miscFrozenBalance = new BigNumber(res.data.miscFrozen.toHex())
      const feeFrozenBalance = new BigNumber(res.data.feeFrozen.toHex())

      return new BigNumber(
        calculateFreeBalance(
          freeBalance,
          miscFrozenBalance,
          feeFrozenBalance,
        ) ?? NaN,
      )
    }

    const res = (await api.query.tokens.accounts(account, id)) as any

    const freeBalance = new BigNumber(res.free.toHex())
    const reservedBalance = new BigNumber(res.reserved.toHex())
    const frozenBalance = new BigNumber(res.frozen.toHex())

    return new BigNumber(
      calculateFreeBalance(freeBalance, reservedBalance, frozenBalance) ?? NaN,
    )
  }

export const useTokenBalance = (id: string, address?: string) => {
  const api = useApiPromise()
  const { account } = useStore()

  const finalAddress = address ?? account?.address ?? ""

  return useQuery(
    QUERY_KEYS.tokenBalance(id, finalAddress),
    getTokenBalance(api, finalAddress, id),
    {
      enabled: !!finalAddress,
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

  return queries.map((balance) => balance.data)
}
