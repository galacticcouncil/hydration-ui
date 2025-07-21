import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class PolkaGate extends BaseSubstrateWallet {
  provider = WalletProviderType.Polkagate
  accessor = "polkagate"
  title = "PolkaGate"
  installUrl =
    "https://chrome.google.com/webstore/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp"
  logo = logo
}
