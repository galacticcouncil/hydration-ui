import { WalletProviderType } from "@/config/providers"
import { BaseEIP1193Wallet } from "@/wallets/BaseEIP1193Wallet"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class Talisman extends BaseSubstrateWallet {
  provider = WalletProviderType.Talisman
  title = "Talisman"
  accessor = "talisman"
  installUrl = "https://talisman.xyz/download"
  logo = logo
}

export class TalismanEvm extends BaseEIP1193Wallet {
  provider = WalletProviderType.TalismanEvm
  title = "Talisman"
  accessor = "xyz.talisman"
  installUrl = "https://talisman.xyz/download"
  logo = logo
}
