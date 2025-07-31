import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class MantaWallet extends BaseSubstrateWallet {
  provider = WalletProviderType.MantaWallet
  accessor = "manta-wallet-js"
  title = "Manta Wallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/manta-wallet/enabgbdfcbaehmbigakijjabdpdnimlg"
  logo = logo
}
