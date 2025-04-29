import { arraySearch } from "@galacticcouncil/utils"
import { filter, pipe, sortBy } from "remeda"

import {
  Account,
  PROVIDERS_BY_WALLET_MODE,
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
  return filter(accounts, (account) =>
    PROVIDERS_BY_WALLET_MODE[mode].includes(account.provider),
  )
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
