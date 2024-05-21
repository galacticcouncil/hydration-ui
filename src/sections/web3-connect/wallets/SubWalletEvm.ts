import { isSubWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"

import SubWalletLogo from "assets/icons/SubWalletLogo.svg"

export class SubWalletEvm extends MetaMask {
  extensionName = "subwallet-evm"
  title = "SubWallet EVM"
  installUrl =
    "https://chromewebstore.google.com/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn"
  logo = {
    src: SubWalletLogo,
    alt: "Subwallet Logo",
  }

  get installed() {
    return isSubWallet(window.SubWallet)
  }

  get rawExtension() {
    return window.SubWallet
  }
}
