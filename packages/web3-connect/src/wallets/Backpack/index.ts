import { WalletProviderType } from "@/config/providers"
import { BaseSolanaWallet } from "@/wallets/BaseSolanaWallet"
import { BaseSuiWallet } from "@/wallets/BaseSuiWallet"

import logo from "./logo.svg"

export class BackpackSol extends BaseSolanaWallet {
  provider = WalletProviderType.BackpackSol
  accessor = "Backpack"
  title = "Backpack"
  installUrl = "https://backpack.app/download"
  logo = logo
}

export class BackpackSui extends BaseSuiWallet {
  provider = WalletProviderType.BackpackSui
  accessor = "Backpack"
  title = "Backpack"
  installUrl = "https://backpack.app/download"
  logo = logo
}
