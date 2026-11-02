import { WalletProviderType } from "@/config/providers"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.png"

export class HotWalletNear extends BaseNearWallet {
  provider = WalletProviderType.HotWalletNear
  accessor = "hot-wallet"
  title = "HOT Wallet"
  installUrl = "https://hot-labs.org/wallet"
  logo = logo
}
