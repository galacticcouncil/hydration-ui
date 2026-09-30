import { WalletProviderType } from "@/config/providers"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"

import logo from "./logo.svg"

export class TrustWalletSol extends BaseSolanaWallet {
  provider = WalletProviderType.TrustWalletSol
  accessor = "Trust"
  title = "Trust Wallet"
  installUrl = "https://trustwallet.com/download"
  logo = logo
}
