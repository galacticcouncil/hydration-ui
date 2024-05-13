import { isTalisman } from "utils/metamask"
import { MetaMask } from "./MetaMask"

import TalismanLogo from "assets/icons/TalismanLogo.svg"

export class TalismanEvm extends MetaMask {
  extensionName = "talisman-evm"
  title = "Talisman EVM"
  installUrl = "https://www.talisman.xyz/download"
  logo = {
    src: TalismanLogo,
    alt: "Talisman Logo",
  }

  get installed() {
    return isTalisman(window.talismanEth)
  }

  get rawExtension() {
    return window.talismanEth
  }
}
