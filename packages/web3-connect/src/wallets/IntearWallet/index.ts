import { WalletProviderType } from "@/config/providers"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.svg"

export class IntearWallet extends BaseNearWallet {
  provider = WalletProviderType.IntearWallet
  accessor = "intear-wallet"
  title = "Intear Wallet"
  installUrl = "https://wallet.intear.tech"
  logo = logo
}
