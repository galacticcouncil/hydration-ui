import SuietLogo from "assets/icons/Suiet.svg"
import { BaseSuiWallet } from "sections/web3-connect/wallets/BaseSuiWallet"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class Suiet extends BaseSuiWallet {
  extensionName = WalletProviderType.Suiet
  title = "Suiet"
  installUrl = "https://suiet.app"
  logo = {
    src: SuietLogo,
    alt: "Suiet Logo",
  }
}
