import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isBraveWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"

import BraveLogo from "assets/icons/BraveLogo.svg"

export class BraveWallet extends MetaMask {
  extensionName = WalletProviderType.BraveWallet
  title = "Brave Wallet"
  installUrl = "https://brave.com/wallet"
  logo = {
    src: BraveLogo,
    alt: "Brave Wallet Logo",
  }

  get installed() {
    const provider = this._provider || window.ethereum
    return isBraveWallet(provider)
  }

  get rawExtension() {
    return this._provider || window.ethereum
  }
}
