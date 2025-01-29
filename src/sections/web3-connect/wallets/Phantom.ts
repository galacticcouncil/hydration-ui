import PhantomLogo from "assets/icons/PhantomLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { isPhantom } from "utils/solana"
import { Solflare } from "./Solflare"
import { isAndroidDevice } from "utils/helpers"

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL
const APP_LINK_TARGET = `${encodeURIComponent(DOMAIN_URL)}/cross-chain?srcChain=solana?ref=${encodeURIComponent(DOMAIN_URL)}`

export class Phantom extends Solflare {
  extensionName = WalletProviderType.Phantom
  title = "Phantom"
  installUrl = "https://phantom.com/download"
  appLink = isAndroidDevice()
    ? `phantom://v1/browse/${APP_LINK_TARGET}`
    : `https://phantom.app/ul/v1/browse/${APP_LINK_TARGET}`
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
