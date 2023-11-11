import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import ExternalWalletIcon from "assets/icons/ExternalWalletIcon.svg"

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

  accounts: WalletAccount[] = []

  static accountName: string = "External Account"
  static proxyAccountName: string = "Proxy Account"

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
    return Promise.resolve(dappName)
  }

  setAddress = async (address: string) => {
    this.accounts = address
      ? [
          {
            address,
            source: this.extensionName,
            name: ExternalWallet.accountName,
            wallet: this,
            signer: this.signer,
          },
        ]
      : []
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return Promise.resolve(this.accounts)
  }

  subscribeAccounts = async () => {}
}
