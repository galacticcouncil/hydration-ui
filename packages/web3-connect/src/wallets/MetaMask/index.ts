import { WalletProviderType } from "@/config/providers"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"

import logo from "./logo.svg"

export class MetaMask extends BaseEIP1193Wallet {
  provider = WalletProviderType.MetaMask
  accessor = "io.metamask"
  title = "MetaMask"
  installUrl = "https://metamask.io/download"
  logo = logo
}
