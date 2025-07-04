import { WalletProviderType } from "sections/web3-connect/constants/providers"
import MimirWalletLogo from "assets/icons/MimirWallet.svg"
import { Wallet } from "@talismn/connect-wallets"
import { web3Enable } from "@polkadot/extension-dapp"
import { connectInjectedExtension } from "@polkadot-api/pjs-signer"
import { inject, isMimirReady, MIMIR_REGEXP } from "@mimirdev/apps-inject"

const MIMIR_APP_NAME = "mimir"

export class MimirWallet implements Partial<Wallet> {
  appLink = `https://app.mimir.global/explorer/${encodeURIComponent(
    window.location.origin,
  )}`

  extensionName = WalletProviderType.MimirWallet
  title = "Mimir"

  logo = {
    src: MimirWalletLogo,
    alt: "Mimir Wallet Logo",
  }

  installed = true
  isDappOnly = true
  signer = true

  async init(): Promise<boolean> {
    // is iframe
    const openInIframe = window !== window.parent

    if (!openInIframe) {
      return false
    }

    const origin = await isMimirReady()
    // Verify if the URL matches Mimir's pattern
    const isMimir = !!origin && MIMIR_REGEXP.test(origin)

    if (!isMimir) {
      return false
    }

    inject()
    await web3Enable(MIMIR_APP_NAME)

    return true
  }

  async getMimirSigner() {
    const account = await this.getMimirAccount()

    return account.polkadotSigner
  }

  async getMimirAccounts() {
    const selectedExtension = await connectInjectedExtension(MIMIR_APP_NAME)

    return selectedExtension.getAccounts()
  }

  async getMimirAccount() {
    const accounts = await this.getMimirAccounts()
    const account = accounts[0]

    if (!account) {
      throw new Error("Mimir account not found")
    }

    return account
  }
}
