import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class NovaWallet extends BaseSubstrateWallet {
  provider = WalletProviderType.NovaWallet
  accessor = "polkadot-js" // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  logo = logo
  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.accessor]
    const isNovaWallet = window?.walletExtension?.isNovaWallet

    return !!(injectedExtension && isNovaWallet)
  }
}
