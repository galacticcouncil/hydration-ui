import { WalletProviderType } from "@/config/providers"
import { isSolflare } from "@/utils/solana"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"

import logo from "./logo.svg"

export class Solflare extends BaseSolanaWallet {
  provider = WalletProviderType.Solflare
  title = "Solflare"
  installUrl = "https://solflare.com/download"
  logo = logo

  get installed() {
    return isSolflare(window?.solflare)
  }

  get rawExtension() {
    return window?.solflare
  }
}
