import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class Enkrypt extends BaseSubstrateWallet {
  provider = WalletProviderType.Enkrypt
  accessor = "enkrypt"
  title = "Enkrypt"
  installUrl = "https://www.enkrypt.com/#overview"
  logo = logo
}
