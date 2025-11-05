import { AccountAvatarTheme } from "@galacticcouncil/ui/components"
import {
  isEvmParachainAccount,
  isH160Address,
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toH160,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { addr } from "@galacticcouncil/xcm-core"

import { WalletProviderType } from "@/config/providers"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  StoredAccount,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { Wallet, WalletAccount } from "@/types/wallet"

const { Ss58Addr, EvmAddr, SolanaAddr } = addr

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

export function getWalletModeFromAddress(address: string) {
  if (EvmAddr.isValid(address)) {
    return WalletMode.EVM
  } else if (Ss58Addr.isValid(address)) {
    return WalletMode.Substrate
  } else if (SolanaAddr.isValid(address)) {
    return WalletMode.Solana
  }

  return null
}

export type AccountsSubscribeOptions = {
  onDisconnect: () => void | Promise<void>
  onAccountsChange: (accounts: WalletAccount[]) => void | Promise<void>
  onMainAccountChange: (mainAccount: WalletAccount) => void | Promise<void>
}

export function subscribeWalletAccounts(
  wallet: Wallet,
  {
    onDisconnect,
    onAccountsChange,
    onMainAccountChange,
  }: AccountsSubscribeOptions,
) {
  const unsubscribe = wallet.subscribeAccounts((accounts) => {
    if (!accounts || accounts.length === 0) {
      return onDisconnect()
    }

    onAccountsChange(accounts)

    const { account: currentAccount } = useWeb3Connect.getState()
    if (!currentAccount || currentAccount.provider !== wallet.provider) return

    const isCurrentAccountConnected = accounts.some(
      (a) => toStoredAccount(a).publicKey === currentAccount.publicKey,
    )

    if (isCurrentAccountConnected) return

    const [mainAccount] = accounts
    return onMainAccountChange(mainAccount)
  })

  return unsubscribe
}
