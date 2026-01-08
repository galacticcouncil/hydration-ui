import { AccountAvatarTheme } from "@galacticcouncil/ui/components"
import {
  EvmAddr,
  isEvmParachainAccount,
  isH160Address,
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSolanaAddressToSS58,
  safeConvertSS58toH160,
  safeConvertSS58toPublicKey,
  safeConvertSuiAddressToSS58,
  SolanaAddr,
  Ss58Addr,
} from "@galacticcouncil/utils"

import {
  AccountFilterOption,
  allAccountFilterOptions,
} from "@/components/account/AccountFilter"
import {
  SOLANA_PROVIDERS,
  SUI_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  PROVIDERS_BY_WALLET_MODE,
  StoredAccount,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { Wallet, WalletAccount } from "@/types/wallet"

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

const toStoredSuiAccount = ({
  address,
  name,
  provider,
}: WalletAccount): StoredAccount => {
  const ss58Format = safeConvertSuiAddressToSS58(address)
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
    case SUI_PROVIDERS.includes(provider):
      return toStoredSuiAccount({ address, name, provider })
    default:
      return toStoredDefaultAccount({ address, name, provider })
  }
}

export const toAccount = (account: StoredAccount): Account => {
  return {
    ...account,
    displayAddress: isEvmParachainAccount(account.address)
      ? safeConvertSS58toH160(account.address)
      : account.rawAddress,
    isIncompatible:
      !COMPATIBLE_WALLET_PROVIDERS.includes(account.provider) &&
      account.provider !== WalletProviderType.ExternalWallet,
  }
}

export const getAccountAvatarTheme = (account: Account): AccountAvatarTheme => {
  if (
    account.provider === WalletProviderType.Talisman ||
    account.provider === WalletProviderType.TalismanEvm ||
    account.provider === WalletProviderType.TalismanH160
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

export type AccountsSubscribeOptions = {
  onDisconnect: () => void
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

export function getWalletModeIcon(mode: WalletMode) {
  switch (mode) {
    case WalletMode.EVM:
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/ethereum/1/icon.svg"
    case WalletMode.Substrate:
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/5/icon.svg"
    case WalletMode.Solana:
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/solana/101/icon.svg"
    case WalletMode.Sui:
      return "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/1000753/icon.svg"
    default:
      return ""
  }
}

export function getWalletModesByProviderType(
  walletType: WalletProviderType,
): WalletMode[] {
  return Object.entries(PROVIDERS_BY_WALLET_MODE)
    .filter(([_, providers]) => providers.includes(walletType))
    .map(([mode, _]) => mode as WalletMode)
}
