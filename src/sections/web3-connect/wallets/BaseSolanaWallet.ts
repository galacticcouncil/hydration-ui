import { PublicKey } from "@solana/web3.js"
import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import { SolanaSigner } from "sections/web3-connect/signer/SolanaSigner"
import { shortenAccountAddress } from "utils/formatting"
import { SolanaWalletProvider } from "utils/solana"

export class BaseSolanaWallet implements Wallet {
  extensionName = ""
  title = ""
  installUrl = ""
  appLink = ""
  logo = {
    src: "",
    alt: "",
  }

  _rawExtension: SolanaWalletProvider | undefined
  _extension: SolanaWalletProvider | undefined
  _signer: SolanaSigner | undefined
  _accounts: WalletAccount[] = []
  _accountChangedHandler: ((publicKey: PublicKey) => void) | undefined

  get installed() {
    return false
  }

  get rawExtension() {
    return window?.solflare
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

    if (!this.rawExtension) return

    const wallet = this.rawExtension

    try {
      const connection = await wallet.connect()
      const publicKey = connection?.publicKey || wallet.publicKey
      if (!publicKey) return

      const address = publicKey.toBase58()

      this._extension = wallet
      this._signer = address ? new SolanaSigner(address, wallet) : undefined

      this.setAccounts([
        {
          address,
          source: this.extensionName,
          name: shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
        },
      ])

      this.subscribeAccounts()
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
          source: this.extensionName,
          name: shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
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
}
