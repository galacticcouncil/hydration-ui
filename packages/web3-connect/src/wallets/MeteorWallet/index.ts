import { WalletProviderType } from "@/config/providers"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.svg"

export class MeteorWallet extends BaseNearWallet {
  provider = WalletProviderType.MeteorWallet
  accessor = "meteor-wallet"
  title = "Meteor Wallet"
  installUrl = "https://meteorwallet.app"
  logo = logo
}
