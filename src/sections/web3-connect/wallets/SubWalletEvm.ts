import { isSubWallet } from "utils/metamask"
import { MetaMask } from "./MetaMask"
import { WalletProviderType } from "sections/web3-connect/constants/providers"

import SubWalletLogo from "assets/icons/SubWalletLogo.svg"

export class SubWalletEvm extends MetaMask {
  extensionName = WalletProviderType.SubwalletEvm
  title = "SubWallet"
  installUrl =
    "https://chromewebstore.google.com/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn"
  logo = {
    src: SubWalletLogo,
    alt: "SubWallet Logo",
  }

  get installed() {
    return isSubWallet(window.SubWallet)
  }

  get rawExtension() {
    return window.SubWallet
  }
}
