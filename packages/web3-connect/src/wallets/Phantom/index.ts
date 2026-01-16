import { getWallets } from "@mysten/wallet-standard"

import { WalletProviderType } from "@/config/providers"
import { isPhantom } from "@/utils/solana"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"
import { BaseSuiWallet } from "@/wallets/BaseSuiWallet"

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

export class PhantomSui extends BaseSuiWallet {
  provider = WalletProviderType.PhantomSui
  accessor = "Phantom"
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  logo = logo

  constructor() {
    super()
    const wallets = getWallets()

    const provider = wallets
      .get()
      .find(
        (wallet) =>
          wallet.chains.includes("sui:mainnet") &&
          wallet.name === this.accessor,
      )

    this._provider = provider
  }

  transformError = () => {
    return new Error("Could not connect to Sui with current account.")
  }
}
