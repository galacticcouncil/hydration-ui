import { Wallet } from "@talismn/connect-wallets"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import WalletConnectLogo from "assets/icons/WalletConnect.svg"

export class WalletConnectEvm implements Wallet {
  extensionName = WalletProviderType.WalletConnectEvm
  title = "WalletConnect"
  installUrl = ""
  logo = {
    src: WalletConnectLogo,
    alt: "WalletConnect Logo",
  }

  installed = true
  extension = true
  signer = true

  transformError = (err: Error) => err

  enable = () => {}
  getAccounts = () => Promise.resolve([])
  subscribeAccounts = () => {}
}
