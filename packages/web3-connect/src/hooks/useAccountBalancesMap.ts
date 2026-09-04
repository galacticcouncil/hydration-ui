import {
  accountsBalancesQuery,
  NeckworkClient,
} from "@galacticcouncil/indexer/neckwork"
import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { SquidSdk } from "@galacticcouncil/indexer/squid"
import { QueriesResults, useQueries } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { chunk } from "remeda"

type AccountWithPublicKey = {
  publicKey: string
}

type UseAccountBalancesMapOptions = {
  accounts: AccountWithPublicKey[]
  neckwork: NeckworkClient | null
  squidSdk: SquidSdk
  enabled?: boolean
}

export const useAccountBalancesMap = ({
  accounts,
  neckwork,
  squidSdk,
  enabled = true,
}: UseAccountBalancesMapOptions) => {
  const {
    accountBalances: neckworkBalancesMap,
    isLoading: areNeckworkBalancesLoading,
  } = useQueries({
    queries:
      enabled && neckwork
        ? chunk(accounts, 50).map((batch) =>
            accountsBalancesQuery(
              neckwork,
              batch.map((account) => account.publicKey),
            ),
          )
        : [],
    combine: useCallback(
      (
        queries: QueriesResults<
          Array<ReturnType<typeof accountsBalancesQuery>>
        >,
      ) => {
        const isLoading = queries.some((query) => query.isLoading)
        const rows = queries.flatMap((query) => query.data ?? [])
        const lookup = new Map(rows.map((row) => [row.account, row.balance]))

        const accountBalances = isLoading
          ? new Map<string, number>()
          : new Map(
              accounts.map((account) => [
                account.publicKey,
                lookup.get(account.publicKey) ?? 0,
              ]),
            )

        return {
          isLoading,
          accountBalances,
        }
      },
      [accounts],
    ),
  })

  const {
    accountBalances: squidBalancesMap,
    isLoading: areSquidBalancesLoading,
  } = useQueries({
    queries:
      enabled && !neckwork
        ? accounts.map((account) =>
            latestAccountBalanceQuery(squidSdk, account.publicKey),
          )
        : [],
    combine: useCallback(
      (
        queries: QueriesResults<
          Array<ReturnType<typeof latestAccountBalanceQuery>>
        >,
      ) => {
        const isLoading = queries.some((query) => query.isLoading)
        const accountBalances = isLoading
          ? new Map<string, number>()
          : new Map(
              accounts.map((account, index) => {
                const data = queries[index]?.data
                const balances =
                  data?.accountTotalBalanceHistoricalData?.nodes.at(0)
                const transferable =
                  Number(balances?.totalTransferableNorm) || 0
                const locked = Number(balances?.totalLockedNorm) || 0
                const balance = transferable + locked

                return [account.publicKey, balance]
              }),
            )

        return {
          isLoading,
          accountBalances,
        }
      },
      [accounts],
    ),
  })

  const balancesMap = neckwork ? neckworkBalancesMap : squidBalancesMap
  const isLoading = neckwork
    ? areNeckworkBalancesLoading
    : areSquidBalancesLoading

  return useMemo(
    () => ({
      balancesMap,
      isLoading: enabled && isLoading,
    }),
    [balancesMap, enabled, isLoading],
  )
}
