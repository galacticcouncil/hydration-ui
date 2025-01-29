import { BaseDotsamaWallet } from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import NovaWalletLogo from "assets/icons/NovaWallet.svg"

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL

export class NovaWallet extends BaseDotsamaWallet {
  extensionName = WalletProviderType.PolkadotJS // Nova Wallet acts as polkadot-js wallet
  title = "Nova Wallet"
  installUrl = "https://novawallet.io"
  appLink = `https://app.novawallet.io/open/dapp?url=${encodeURIComponent(DOMAIN_URL)}`
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
