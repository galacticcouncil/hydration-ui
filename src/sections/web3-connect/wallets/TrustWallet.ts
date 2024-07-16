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
    console.log({
      isMetaMask: window?.ethereum?.isMetaMask,
      isTrustWallet: window?.ethereum?.isTrustWallet,
      // @ts-ignore
      isTrust: window?.ethereum?.isTrust,
      givenProvider: this._provider,
      windowProvider: window?.ethereum,
    })
    const provider = this._provider || window.ethereum
    return isTrustWallet(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }
}
