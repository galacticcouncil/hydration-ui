import { AccountAvatarTheme } from "@galacticcouncil/ui/components"
import {
  EvmAddr,
  isEvmParachainAccount,
  isH160Address,
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toH160,
  safeConvertSS58toPublicKey,
  SolanaAddr,
  Ss58Addr,
} from "@galacticcouncil/utils"

import {
  AccountFilterOption,
  allAccountFilterOptions,
} from "@/components/account/AccountFilter"
import { SOLANA_PROVIDERS, WalletProviderType } from "@/config/providers"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  StoredAccount,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { WalletAccount } from "@/types/wallet"
import { safeConvertSolanaAddressToSS58 } from "@/utils/solana"

const toStoredSolanaAccount = ({
  address,
  name,
  provider,
}: WalletAccount): StoredAccount => {
  const ss58Format = safeConvertSolanaAddressToSS58(address)
  return {
    publicKey: safeConvertSS58toPublicKey(ss58Format),
    address: ss58Format,
    rawAddress: address,
    name: name ?? "",
    provider: provider,
  }
}

const toStoredDefaultAccount = ({
  address,
  name,
  provider,
}: WalletAccount): StoredAccount => {
  const isEvm = isH160Address(address)

  const ss58Format = isEvm
    ? safeConvertH160toSS58(address)
    : safeConvertAddressSS58(address)

  const publicKey = safeConvertSS58toPublicKey(ss58Format)

  return {
    publicKey,
    address: ss58Format,
    rawAddress: address,
    name: name ?? "",
    provider: provider,
  }
}

export const toStoredAccount = ({
  address,
  name,
  provider,
}: WalletAccount): StoredAccount => {
  switch (true) {
    case SOLANA_PROVIDERS.includes(provider):
      return toStoredSolanaAccount({ address, name, provider })
    default:
      return toStoredDefaultAccount({ address, name, provider })
  }
}

export const toAccount = (account: StoredAccount): Account => {
  return {
    ...account,
    displayAddress: isEvmParachainAccount(account.address)
      ? safeConvertSS58toH160(account.address)
      : account.address,
    isIncompatible:
      account.provider === WalletProviderType.ExternalWallet ||
      !COMPATIBLE_WALLET_PROVIDERS.includes(account.provider),
  }
}

export const getAccountAvatarTheme = (account: Account): AccountAvatarTheme => {
  if (
    account.provider === WalletProviderType.Talisman ||
    account.provider === WalletProviderType.TalismanEvm
  ) {
    return "talisman"
  }

  return "auto"
}

export const getWalletModeByAddress = (address: string) => {
  switch (true) {
    case EvmAddr.isValid(address):
      return WalletMode.EVM
    case Ss58Addr.isValid(address):
      return WalletMode.Substrate
    case SolanaAddr.isValid(address):
      return WalletMode.Solana
    default:
      return null
  }
}

export const getDefaultAccountFilterByMode = (
  mode: WalletMode,
): AccountFilterOption => {
  if (mode !== WalletMode.Default)
    return (
      allAccountFilterOptions.find((option) => option === mode) ||
      WalletMode.Default
    )
  return WalletMode.Default
}
