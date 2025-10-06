import SolflareLogo from "assets/icons/SolflareLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { BaseSolanaWallet } from "sections/web3-connect/wallets/BaseSolanaWallet"
import { isAndroid } from "utils/helpers"
import { isSolflare } from "utils/solana"

const DEEP_LINK =
  "solflare://v1/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
const UNIVERSAL_LINK =
  "https://solflare.com/ul/v1/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"

export class Solflare extends BaseSolanaWallet {
  extensionName = WalletProviderType.Solflare
  title = "Solflare"
  installUrl = "https://solflare.com"
  appLink = isAndroid() ? DEEP_LINK : UNIVERSAL_LINK
  logo = {
    src: SolflareLogo,
    alt: "Solflare Logo",
  }

  get installed() {
    return isSolflare(window?.solflare)
  }

  get rawExtension() {
    return window?.solflare
  }
}
