import PhantomLogo from "assets/icons/PhantomLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isPhantom } from "utils/solana"
import { Solflare } from "./Solflare"
import { isAndroidDevice } from "utils/helpers"

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL
const APP_LINK_TARGET = `${DOMAIN_URL}/cross-chain?srcChain=solana?ref=${DOMAIN_URL}`

const deepLink =
  "phantom://browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"
const appLink =
  "https://phantom.app/ul/browse/https%3A%2F%2Fapp.hydration.net%2Fcross-chain%3FsrcChain%3Dsolana?ref=https%3A%2F%2Fapp.hydration.net"

console.log("DEEPLINK", {
  oldLink: deepLink,
  newLink: `phantom://v1/browse/${encodeURIComponent(APP_LINK_TARGET)}`,
})

console.log("APPLINKS", {
  oldLink: appLink,
  newLink: `https://phantom.app/ul/v1/browse/${encodeURIComponent(APP_LINK_TARGET)}`,
})

export class Phantom extends Solflare {
  extensionName = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  appLink = isAndroidDevice() ? deepLink : appLink
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
