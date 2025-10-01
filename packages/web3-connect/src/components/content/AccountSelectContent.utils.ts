import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { isEvmAccount } from "@galacticcouncil/sdk"
import { arraySearch, isSS58Address } from "@galacticcouncil/utils"
import { useQueries } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { pipe, sortBy } from "remeda"

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
    if (account.provider !== WalletProviderType.ExternalWallet) {
      return PROVIDERS_BY_WALLET_MODE[mode].includes(account.provider)
    }

    const isEvmAddress = isEvmAccount(account.address)
    switch (mode) {
      case WalletMode.EVM:
        return isEvmAddress
      case WalletMode.Substrate:
        return !isEvmAddress && isSS58Address(account.address)
      default:
        return true
    }
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
  const { squidSdk } = useWeb3ConnectContext()
  const { setBalances } = useWeb3Connect()

  const accountBalancesQueries = useQueries({
    queries: accounts.map((account) =>
      latestAccountBalanceQuery(squidSdk, account.publicKey),
    ),
  })

  const areBalancesLoading = accountBalancesQueries.some(
    (query) => query.isLoading,
  )

  const balancesMap = useMemo(
    () =>
      areBalancesLoading
        ? new Map<string, number>()
        : new Map(
            accounts.map((account, index) => {
              const data = accountBalancesQueries[index]?.data
              const balance =
                Number(
                  data?.accountTotalBalanceHistoricalData?.nodes.at(0)
                    ?.totalTransferableNorm,
                ) || 0

              return [account.publicKey, balance]
            }),
          ),
    [accounts, accountBalancesQueries, areBalancesLoading],
  )

  useEffect(() => {
    setBalances(balancesMap)
  }, [balancesMap, setBalances])

  const accountsWithBalances = useMemo(() => {
    const accountsWtihActive = accounts.map((account) => {
      const isActive =
        currentAccount?.address === account.address &&
        currentAccount?.provider === account.provider

      return {
        ...account,
        isActive,
      }
    })

    return sortBy(
      accountsWtihActive,
      [(item) => item.isActive, "desc"],
      [(item) => item.balance === undefined, "desc"],
      [(item) => item.balance ?? 0, "desc"],
    )
  }, [accounts, currentAccount?.address, currentAccount?.provider])

  return { accountsWithBalances, areBalancesLoading }
}
