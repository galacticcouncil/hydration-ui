import { isTrustWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"

import TalismanLogo from "assets/icons/TrustWalletLogo.svg"

export class TrustWallet extends MetaMask {
  extensionName = "trustwallet"
  title = "Trust Wallet"
  installUrl = "https://trustwallet.com"
  logo = {
    src: TalismanLogo,
    alt: "Trust Wallet Logo",
  }

  get installed() {
    const provider = this._provider || window.ethereum
    return isTrustWallet(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }
}
