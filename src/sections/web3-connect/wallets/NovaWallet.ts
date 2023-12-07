import { BaseDotsamaWallet } from "@talismn/connect-wallets"

import NovaWalletLogo from "assets/icons/NovaWallet.svg"

export class NovaWallet extends BaseDotsamaWallet {
  extensionName = "polkadot-js" // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  logo = {
    src: NovaWalletLogo,
    alt: "Nova Wallet Logo",
  }
  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.extensionName]
    const isNovaWallet = window?.walletExtension?.isNovaWallet

    return !!(injectedExtension && isNovaWallet)
  }
}
