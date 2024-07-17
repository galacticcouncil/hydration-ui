import { isTalisman } from "utils/metamask"
import { MetaMask } from "./MetaMask"
import { WalletProviderType } from "sections/web3-connect/constants/providers"

import TalismanLogo from "assets/icons/TalismanLogo.svg"

export class TalismanEvm extends MetaMask {
  extensionName = WalletProviderType.TalismanEvm
  title = "Talisman"
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
