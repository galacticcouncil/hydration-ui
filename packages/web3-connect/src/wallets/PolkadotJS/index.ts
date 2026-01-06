import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class PolkadotJS extends BaseSubstrateWallet {
  provider = WalletProviderType.PolkadotJS
  accessor = "polkadot-js"
  title = "Polkadot.js"
  installUrl = "https://polkadot.js.org/extension"
  logo = logo

  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.accessor]
    const isNovaWallet = window?.walletExtension?.isNovaWallet

    // Nova Wallet uses polkadot-js extension, so we hide this option inside Nova Wallet
    return !!injectedExtension && !isNovaWallet
  }
}
