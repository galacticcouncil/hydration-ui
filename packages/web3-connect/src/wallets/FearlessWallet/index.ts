import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class FearlessWallet extends BaseSubstrateWallet {
  provider = WalletProviderType.FearlessWallet
  accessor = "fearless-wallet"
  title = "Fearless Wallet"
  installUrl =
    "https://chrome.google.com/webstore/detail/fearless-wallet/nhlnehondigmgckngjomcpcefcdplmgc"
  logo = logo
}
