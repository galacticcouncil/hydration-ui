import SlushLogo from "assets/icons/Slush.svg"
import { BaseSuiWallet } from "sections/web3-connect/wallets/BaseSuiWallet"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class Slush extends BaseSuiWallet {
  extensionName = WalletProviderType.Slush
  title = "Slush"
  installUrl = "https://slush.app"
  logo = {
    src: SlushLogo,
    alt: "Slush Logo",
  }
}
