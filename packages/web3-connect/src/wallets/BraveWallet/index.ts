import { WalletProviderType } from "@/config/providers"
import { isBraveSolana } from "@/utils/solana"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"

import logo from "./logo.svg"

export class BraveWallet extends BaseEIP1193Wallet {
  provider = WalletProviderType.BraveWallet
  accessor = "com.brave.wallet"
  title = "Brave Wallet"
  installUrl = "https://brave.com/wallet/"
  logo = logo
}

export class BraveWalletSol extends BaseSolanaWallet {
  provider = WalletProviderType.BraveWalletSol
  title = "Brave Wallet"
  installUrl = "https://brave.com/wallet/"
  logo = logo

  get installed() {
    return isBraveSolana(window?.braveSolana)
  }

  get rawExtension() {
    return window?.braveSolana
  }

  transformError = () => {
    return new Error("Could not connect to Solana with current account.")
  }
}
