import SubWalletLogo from "assets/icons/SubWalletLogo.svg"
import { SubWallet as SubWalletImpl } from "@talismn/connect-wallets"

export class SubWallet extends SubWalletImpl {
  logo = {
    src: SubWalletLogo,
    alt: "SubWallet Logo",
  }
}
