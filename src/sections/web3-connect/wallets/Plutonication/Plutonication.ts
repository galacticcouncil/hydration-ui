import PlutonicationIcon from "assets/icons/plutonication-icon.png"
import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import {
  WalletProviderType,
  getWalletProviderByType,
} from "sections/web3-connect/Web3Connect.utils"

import {
  AccessCredentials,
  initializePlutonicationDAppClientWithModal,
} from "@plutonication/plutonication"

export class Plutonication implements Wallet {
  extensionName = "plutonication"
  title = "Plutonication"
  installUrl = ""
  logo = {
    src: PlutonicationIcon,
    alt: "Plutonication Logo",
  }
  _extension: any
  _signer: any

  account: WalletAccount | undefined

  proxyWalletProvider = WalletProviderType.PolkadotJS

  accountName = "External Account"
  proxyAccountName = "Proxy Account"

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return true
  }

  transformError = (err: Error): Error => {
    return err
  }

  enable = async (dappName: string) => {
    this._extension = {}

    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    try {
      const accessCredentials = new AccessCredentials(
        "wss://plutonication-acnha.ondigitalocean.app/",
        dappName,
        "https://rostislavlitovkin.pythonanywhere.com/plutowalleticonwhite",
      )

      const injected = await initializePlutonicationDAppClientWithModal(
        accessCredentials,
        (_: string) => {},
      )
      this._signer = injected.signer
    } finally {
    }
  }

  enableProxy = async (dappName: string) => {
    const { wallet } = getWalletProviderByType(this.proxyWalletProvider)

    if (wallet?.installed) {
      await wallet?.enable(dappName)
      this._extension = wallet.extension
      this._signer = wallet.signer
    }
  }

  setAddress = async (address?: string) => {
    if (address) {
      // dummy extension
      if (!this._extension) this._extension = {}
      this.account = {
        address,
        source: this.extensionName,
        name: this.accountName,
        wallet: this,
        signer: this.signer,
      }
    } else {
      this.account = undefined
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return Promise.resolve(this.account ? [this.account] : [])
  }

  subscribeAccounts = async () => Promise.resolve()
}
