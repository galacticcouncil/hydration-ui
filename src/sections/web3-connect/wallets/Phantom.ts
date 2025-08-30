import PhantomLogo from "assets/icons/PhantomLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { BaseSolanaWallet } from "sections/web3-connect/wallets/BaseSolanaWallet"
import { isAndroid } from "utils/helpers"
import { isPhantom } from "utils/solana"

const DEEP_LINK =
  "phantom://browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
const UNIVERSAL_LINK =
  "https://phantom.app/ul/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"

export class Phantom extends BaseSolanaWallet {
  extensionName = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  appLink = isAndroid() ? DEEP_LINK : UNIVERSAL_LINK
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

  transformError = () => {
    return new Error("Could not connect to Solana with current account.")
  }
}
