import { isPhantom } from "utils/metamask"
import { MetaMask } from "./MetaMask"
import { WalletProviderType } from "sections/web3-connect/constants/providers"

export class Phantom extends MetaMask {
  extensionName = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = ""
  logo = {
    src: "",
    alt: "Subwallet Logo",
  }

  get installed() {
    return isPhantom(window?.phantom?.ethereum)
  }

  get rawExtension() {
    return window?.phantom?.ethereum
  }
}
