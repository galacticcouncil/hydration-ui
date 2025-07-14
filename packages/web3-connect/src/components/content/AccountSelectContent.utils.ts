import { isEvmAccount } from "@galacticcouncil/sdk"
import { arraySearch, isSS58Address } from "@galacticcouncil/utils"
import { pipe, sortBy } from "remeda"

import { WalletProviderType } from "@/config/providers"
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
