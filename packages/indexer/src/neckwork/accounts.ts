import { queryOptions } from "@tanstack/react-query"

import {
  NECKWORK_ACCOUNT_KEY,
  NECKWORK_BASE_STALE_TIME,
  NeckworkClient,
} from "."

export const accountsBalancesQuery = (
  client: NeckworkClient,
  publicKeys: string[],
) =>
  queryOptions({
    queryKey: [...NECKWORK_ACCOUNT_KEY, "accountBalances", publicKeys],
    staleTime: NECKWORK_BASE_STALE_TIME,
    queryFn: async () => {
      const { data } = await client.GET("/v1/accounts/balances", {
        params: { query: { accounts: publicKeys.join(",") } },
      })

      if (!data) throw new Error("Neckwork API returned no account balances")

      return data.items.map((item) => ({
        account: item.account,
        balance: Number(item.totalUsd) - Number(item.debtUsd ?? 0),
      }))
    },
  })
