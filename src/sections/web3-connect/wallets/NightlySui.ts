import NightlyLogo from "assets/icons/NightlyLogo.svg"
import { BaseSuiWallet } from "sections/web3-connect/wallets/BaseSuiWallet"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class NightlySui extends BaseSuiWallet {
  extensionName = WalletProviderType.NightlySui
  title = "Nightly"
  installUrl = "https://nightly.app/download"
  logo = {
    src: NightlyLogo,
    alt: "Nightly Logo",
  }
}
