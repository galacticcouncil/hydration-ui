import PhantomLogo from "assets/icons/PhantomLogo.svg"
import { BaseSuiWallet } from "sections/web3-connect/wallets/BaseSuiWallet"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"

export class PhantomSui extends BaseSuiWallet {
  extensionName = WalletProviderType.PhantomSui
  title = "Phantom"
  installUrl = "https://phantom.app"
  logo = {
    src: PhantomLogo,
    alt: "Phantom Logo",
  }

  transformError = () => {
    return new Error("Could not connect to Sui with current account.")
  }
}
