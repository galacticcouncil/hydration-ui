import BraveLogo from "assets/icons/BraveLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isBraveSolana } from "utils/solana"
import { Solflare } from "./Solflare"

export class BraveWalletSol extends Solflare {
  extensionName = WalletProviderType.BraveWalletSol
  title = "Brave Wallet"
  installUrl = "https://brave.com/wallet"
  logo = {
    src: BraveLogo,
    alt: "Brave Wallet Logo",
  }

  get installed() {
    return isBraveSolana(window?.braveSolana)
  }

  get rawExtension() {
    return window?.braveSolana
  }
}
