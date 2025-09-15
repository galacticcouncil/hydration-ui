import { Wallet, WalletAccount } from "@talismn/connect-wallets"

import {
  isWalletWithRequiredFeatureSet,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard"
import { shortenAccountAddress } from "utils/formatting"
import { Wallet as StandardWallet } from "@mysten/wallet-standard"
import { SuiSigner } from "sections/web3-connect/signer/SuiSigner"

type SuiWalletInit = {
  provider?: StandardWallet
}

export class BaseSuiWallet implements Wallet {
  extensionName = ""
  title = ""
  installUrl = ""
  appLink = ""
  logo = {
    src: "",
    alt: "",
  }

  _provider: StandardWallet | undefined
  _rawExtension: StandardWallet | undefined
  _extension: WalletWithRequiredFeatures | undefined
  _signer: SuiSigner | undefined
  _accounts: WalletAccount[] = []

  constructor({ provider }: SuiWalletInit = {}) {
    this._provider = provider
  }

  get installed() {
    return !!this._provider && isWalletWithRequiredFeatureSet(this._provider)
  }

  get rawExtension() {
    return this._provider
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    if (
      !this.rawExtension ||
      !isWalletWithRequiredFeatureSet(this.rawExtension)
    )
      return

    const wallet = this.rawExtension

    try {
      await wallet.features["standard:connect"].connect()
      this._extension = wallet

      const { accounts } = wallet

      if (!accounts.length) {
        throw new Error("No accounts returned from wallet")
      }

      const account = accounts[0]
      const address = account.address

      this._signer = address ? new SuiSigner(account, wallet) : undefined

      this.setAccounts([
        {
          address,
          source: this.extensionName,
          name: account?.label || shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
        },
      ])
    } catch (err: any) {
      throw this.transformError(err as Error)
    }
  }

  setAccounts = (accounts: WalletAccount[]) => {
    this._accounts = accounts
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return this._accounts
  }

  subscribeAccounts = async () => {}
}
