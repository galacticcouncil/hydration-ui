import { accountsBalancesQuery } from "@galacticcouncil/indexer/neckwork"
import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import {
  arraySearch,
  isEvmParachainAccount,
  isSS58Address,
} from "@galacticcouncil/utils"
import { QueriesResults, useQueries } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"
import { chunk, pick, pipe, sortBy } from "remeda"
import { useShallow } from "zustand/shallow"

import { WalletProviderType } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks"
import {
  Account,
  PROVIDERS_BY_WALLET_MODE,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"

export const isAccountSelected = (
  currentAccount: Account | null,
  account?: Account | null,
) => {
  if (!currentAccount || !account) return false
  return (
    currentAccount.address === account.address &&
    currentAccount.provider === account.provider
  )
}

export const searchAccounts = (phrase: string) => (accounts: Account[]) => {
  if (!phrase) return accounts
  return arraySearch(accounts, phrase, [
    "name",
    "displayAddress",
    "address",
    "provider",
  ])
}

export const filterAccounts = (mode: WalletMode) => (accounts: Account[]) => {
  return accounts.filter((account) => {
    if (
      account.provider === WalletProviderType.ExternalWallet &&
      [WalletMode.Default, WalletMode.EVM, WalletMode.Substrate].includes(mode)
    ) {
      const isEvmAddress = isEvmParachainAccount(account.address)
      switch (mode) {
        case WalletMode.EVM:
          return isEvmAddress
        case WalletMode.Substrate:
          return !isEvmAddress && isSS58Address(account.address)
        default:
          return true
      }
    }

    return PROVIDERS_BY_WALLET_MODE[mode].includes(account.provider)
  })
}

export const getFilteredAccounts = (
  accounts: Account[],
  currentAccount: Account | null,
  search: string,
  mode: WalletMode,
) => {
  return pipe(
    accounts,
    sortBy((account) => !isAccountSelected(currentAccount, account)),
    searchAccounts(search),
    filterAccounts(mode),
  )
}

export const useAccountsWithBalance = (accounts: Account[]) => {
  const { account: currentAccount } = useAccount()
  const { neckwork, squidSdk } = useWeb3ConnectContext()
  const { setBalances } = useWeb3Connect(
    useShallow(pick(["accounts", "setBalances"])),
  )

  const {
    accountBalances: neckworkBalancesMap,
    isLoading: areNeckworkBalancesLoading,
  } = useQueries({
    queries: neckwork
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
    queries: neckwork
      ? []
      : accounts.map((account) =>
          latestAccountBalanceQuery(squidSdk, account.publicKey),
        ),
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
  const areBalancesLoading = neckwork
    ? areNeckworkBalancesLoading
    : areSquidBalancesLoading

  useEffect(() => {
    if (!areBalancesLoading) {
      setBalances(balancesMap)
    }
  }, [balancesMap, areBalancesLoading, setBalances])

  const accountsWithBalances = useMemo(() => {
    const accountsWithActive = accounts.map((account) => {
      const isActive =
        currentAccount?.address === account.address &&
        currentAccount?.provider === account.provider

      return {
        ...account,
        isActive,
      }
    })

    return sortBy(
      accountsWithActive,
      [(item) => item.isActive, "desc"],
      [(item) => item.balance === undefined, "desc"],
      [(item) => item.balance ?? 0, "desc"],
    )
  }, [accounts, currentAccount?.address, currentAccount?.provider])

  return {
    accountsWithBalances,
    areBalancesLoading,
  }
}
