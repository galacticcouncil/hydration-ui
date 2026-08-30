import { WalletProviderType } from "@/config/providers"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"

import logo from "./logo.svg"

export class Nightly extends BaseEIP1193Wallet {
  provider = WalletProviderType.Nightly
  accessor = "app.nightly"
  title = "Nightly"
  installUrl = "https://nightly.app"
  logo = logo
}
