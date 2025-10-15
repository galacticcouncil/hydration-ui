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
  _extension: Required<SolanaInjectedWindowProvider> | undefined
  _signer: SolanaSigner | undefined
  _enabled: boolean = false

  _accounts: WalletAccount[] = []
  _accountChangedHandler: ((publicKey: PublicKey) => void) | undefined

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

      this._signer = address ? new SolanaSigner(address, wallet) : undefined

      this.setAccounts([
        {
          address,
          name: shortenAccountAddress(address),
          provider: this.provider,
        },
      ])

      this.subscribeAccounts()
    } catch (err: unknown) {
      throw this.transformError(err as Error)
    }
  }

  subscribeAccounts = async () => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this.unsubscribe()
    this._accountChangedHandler = (publicKey: PublicKey) => {
      if (!this._extension) return
      const address = publicKey.toBase58()

      this._signer = address
        ? new SolanaSigner(address, this._extension)
        : undefined

      this.setAccounts([
        {
          address,
          name: shortenAccountAddress(address),
          provider: this.provider,
        },
      ])
    }

    this._extension.on("accountChanged", this._accountChangedHandler)
  }

  unsubscribe = () => {
    if (this._extension && this._accountChangedHandler) {
      this._extension.off("accountChanged", this._accountChangedHandler)
      this._accountChangedHandler = undefined
    }
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
    this._accounts = []
    this._accountChangedHandler = undefined
    this.unsubscribe()
  }
}
