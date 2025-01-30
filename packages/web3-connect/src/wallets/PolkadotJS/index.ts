import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import Logo from "./logo.svg"

export class PolkadotJS extends BaseSubstrateWallet {
  provider = WalletProviderType.PolkadotJS
  accessor = "polkadot-js"
  title = "Polkadot.js"
  installUrl = "https://polkadot.js.org/extension"
  logo = Logo
}
