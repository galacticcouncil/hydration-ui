import { isPhantom } from "utils/metamask"
import { MetaMask } from "./MetaMask"

export class Phantom extends MetaMask {
  extensionName = "phantom"
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
