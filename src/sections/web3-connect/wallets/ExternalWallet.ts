import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import ExternalWalletIcon from "assets/icons/ExternalWalletIcon.svg"
import {
  WalletProviderType,
  getWalletProviderByType,
} from "sections/web3-connect/Web3Connect.utils"

/**
 * Mock Wallet for "View as Wallet" functionality
 */
export class ExternalWallet implements Wallet {
  extensionName = "external"
  title = "View as Wallet"
  installUrl = ""
  logo = {
    src: ExternalWalletIcon,
    alt: "External Account Logo",
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
    return Promise.resolve(dappName)
  }

  enableProxy = async (dappName: string) => {
    const { wallet } = getWalletProviderByType(this.proxyWalletProvider)

    if (wallet?.installed && !wallet?.extension) {
      await wallet?.enable(dappName)
      this._extension = wallet.extension
      this._signer = wallet.signer
    }
  }

  setAddress = async (address?: string) => {
    if (address) {
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
