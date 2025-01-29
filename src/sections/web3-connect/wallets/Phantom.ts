import PhantomLogo from "assets/icons/PhantomLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isPhantom } from "utils/solana"
import { Solflare } from "./Solflare"

export class Phantom extends Solflare {
  extensionName = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  deepLink =
    "phantom://browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
  appLink =
    "https://phantom.app/ul/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
  logo = {
    src: PhantomLogo,
    alt: "Phantom Logo",
  }

  get installed() {
    return isPhantom(window?.phantom?.solana)
  }

  get rawExtension() {
    return window?.phantom?.solana
  }
}
