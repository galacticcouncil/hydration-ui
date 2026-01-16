import { shortenAccountAddress } from "@galacticcouncil/utils"
import { PublicKey } from "@solana/web3.js"

import { WalletProviderType } from "@/config/providers"
import { SolanaSigner } from "@/signers/SolanaSigner"
import { SolanaInjectedWindowProvider } from "@/types/solana"
import { Wallet, WalletAccount } from "@/types/wallet"
import { NotInstalledError } from "@/utils/errors"

export class BaseSolanaWallet implements Wallet {
  provider = "" as WalletProviderType
  accessor = ""
  title = ""
  installUrl = ""
  logo = ""

  _rawExtension: SolanaInjectedWindowProvider | undefined
  _extension: SolanaInjectedWindowProvider | undefined
  _signer: SolanaSigner | undefined
  _enabled: boolean = false

  _accounts: WalletAccount[] = []

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return !!this._rawExtension
  }

  get enabled() {
    return this._enabled
  }

  get rawExtension() {
    return this._rawExtension
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return this._accounts
  }

  setAccounts = (accounts: WalletAccount[]) => {
    this._accounts = accounts
  }

  enable = async () => {
    if (!this.installed || !this.rawExtension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }

    const wallet = this.rawExtension

    try {
      const connection = await wallet.connect()
      const publicKey = connection?.publicKey || wallet.publicKey

      if (!publicKey) return

      const address = publicKey.toBase58()

      this._enabled = true
      this._signer = address ? new SolanaSigner(address, wallet) : undefined
      this._extension = wallet

      this.setAccounts([
        {
          address,
          name: shortenAccountAddress(address),
          provider: this.provider,
        },
      ])

      //this.subscribeAccounts()
    } catch (err: unknown) {
      console.log({ err })
      throw this.transformError(err as Error)
    }
  }

  subscribeAccounts = () => {
    const extension = this._extension
    if (!extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    const handler = (publicKey: PublicKey) => {
      if (!extension) return
      const address = publicKey.toBase58()

      this._signer = address ? new SolanaSigner(address, extension) : undefined

      this.setAccounts([
        {
          address,
          name: shortenAccountAddress(address),
          provider: this.provider,
        },
      ])
    }

    extension.on("accountChanged", handler)
    return () => {
      extension.off("accountChanged", handler)
    }
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
    this._accounts = []
  }
}
