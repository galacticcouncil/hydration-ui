import { WalletProviderType } from "@/config/providers"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"
import { BaseSuiWallet } from "@/wallets/BaseSuiWallet"

import logo from "./logo.svg"

export class NightlySol extends BaseSolanaWallet {
  provider = WalletProviderType.NightlySol
  accessor = "Nightly"
  title = "Nightly"
  installUrl = "https://nightly.app/download"
  logo = logo
}

export class NightlySui extends BaseSuiWallet {
  provider = WalletProviderType.NightlySui
  accessor = "Nightly"
  title = "Nightly"
  installUrl = "https://nightly.app/download"
  logo = logo
}
