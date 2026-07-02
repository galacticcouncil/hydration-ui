import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import {
  arraySearch,
  isEvmParachainAccount,
  isSS58Address,
} from "@galacticcouncil/utils"
import { QueriesResults, useQueries } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"
import { useLocalStorage } from "react-use"
import { pick, pipe, sortBy, uniqueBy } from "remeda"
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
  const { squidSdk, useExtraAccountBalances } = useWeb3ConnectContext()
  const { setBalances } = useWeb3Connect(
    useShallow(pick(["accounts", "setBalances"])),
  )

  const [accountBalancesStorage, setAccountBalancesStorage] = useLocalStorage<
    ReadonlyMap<string, number>
  >("account-balances-v2", new Map(), {
    raw: false,
    serializer: (map) => JSON.stringify(Array.from(map.entries())),
    deserializer: (entries) => {
      try {
        return new Map(JSON.parse(entries))
      } catch {
        return new Map()
      }
    },
  })

  const balanceQueryAccounts = useMemo(
    () => uniqueBy(accounts, (account) => account.publicKey),
    [accounts],
  )
  const hasAllBalancesPreloaded =
    !!accountBalancesStorage &&
    balanceQueryAccounts.every(
      (account) => accountBalancesStorage.get(account.publicKey) !== undefined,
    )

  const {
    accountBalances: hydrationBalancesMap,
    isLoading: areHydrationBalancesLoading,
  } = useQueries({
    queries: balanceQueryAccounts.map((account) =>
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
              balanceQueryAccounts.map((account, index) => {
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
      [balanceQueryAccounts],
    ),
  })
  const {
    accountBalances: extraBalancesMap,
    isLoading: areExtraBalancesLoading,
  } = useExtraAccountBalances(balanceQueryAccounts)
  const balancesMap = useMemo(() => {
    return new Map(
      balanceQueryAccounts.map((account) => {
        const hydrationBalance =
          hydrationBalancesMap.get(account.publicKey) ?? 0
        const extraBalance = extraBalancesMap.get(account.publicKey) ?? 0

        return [account.publicKey, hydrationBalance + extraBalance]
      }),
    )
  }, [balanceQueryAccounts, extraBalancesMap, hydrationBalancesMap])
  const areBalancesLoading =
    areHydrationBalancesLoading || areExtraBalancesLoading

  useEffect(() => {
    if (!areBalancesLoading) {
      setAccountBalancesStorage(balancesMap)
    }
  }, [areBalancesLoading, balancesMap, setAccountBalancesStorage])

  useEffect(() => {
    if (!areBalancesLoading) {
      setBalances(balancesMap)
    } else if (hasAllBalancesPreloaded) {
      setBalances(accountBalancesStorage)
    }
  }, [
    balancesMap,
    accountBalancesStorage,
    hasAllBalancesPreloaded,
    areBalancesLoading,
    setBalances,
  ])

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
    areBalancesLoading: areBalancesLoading && !hasAllBalancesPreloaded,
  }
}
