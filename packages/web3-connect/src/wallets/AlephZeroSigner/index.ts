import { WalletProviderType } from "@/config/providers"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

import logo from "./logo.svg"

export class AlephZero extends BaseSubstrateWallet {
  provider = WalletProviderType.AlephZero
  accessor = "aleph-zero"
  title = "Aleph Zero Signer"
  installUrl = "https://alephzero.org/signer"
  logo = logo
}
