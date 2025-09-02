import { WalletProviderType } from "@/config/providers"
import { isPhantom } from "@/utils/solana"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"

import logo from "./logo.svg"

export class Phantom extends BaseSolanaWallet {
  provider = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  logo = logo

  get installed() {
    return isPhantom(window?.phantom?.solana)
  }

  get rawExtension() {
    return window?.phantom?.solana
  }

  transformError = () => {
    return new Error("Could not connect to Solana with current account.")
  }
}
