import { SubWallet as SubWalletImpl } from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/constants/providers"

import SubWalletLogo from "assets/icons/SubWalletLogo.svg"

export class SubWallet extends SubWalletImpl {
  extensionName = WalletProviderType.SubwalletJS
  logo = {
    src: SubWalletLogo,
    alt: "SubWallet Logo",
  }
}
