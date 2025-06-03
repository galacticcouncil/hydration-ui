import { AccountAvatarTheme } from "@galacticcouncil/ui/components"
import {
  isEvmParachainAccount,
  isH160Address,
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toH160,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"

import { WalletProviderType } from "@/config/providers"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  StoredAccount,
} from "@/hooks/useWeb3Connect"
import { WalletAccount } from "@/types/wallet"

export const toStoredAccount = ({
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
    name: name ?? "",
    provider: provider,
  }
}

export const toAccount = (account: StoredAccount): Account => {
  return {
    ...account,
    displayAddress: isEvmParachainAccount(account.address)
      ? safeConvertSS58toH160(account.address)
      : account.address,
    isIncompatible: !COMPATIBLE_WALLET_PROVIDERS.includes(account.provider),
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
