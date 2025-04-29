import { WalletProviderType } from "@/config/providers"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"

import logo from "./logo.svg"

export class RabbyWallet extends BaseEIP1193Wallet {
  provider = WalletProviderType.RabbyWallet
  accessor = "io.rabby"
  title = "Rabby Wallet"
  installUrl = "https://rabby.io"
  logo = logo
}
