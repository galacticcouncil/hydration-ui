import { SubscriptionFn, Wallet, WalletAccount } from "@talismn/connect-wallets"
import SolflareLogo from "assets/icons/SolflareLogo.svg"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import { shortenAccountAddress } from "utils/formatting"
import { isSolflare, SolanaWalletProvider } from "utils/solana"

export class Solflare implements Wallet {
  extensionName = WalletProviderType.Solflare
  title = "Solflare"
  installUrl = "https://solflare.com"
  logo = {
    src: SolflareLogo,
    alt: "Solflare Logo",
  }

  _extension: SolanaWalletProvider | undefined
  // @TODO: implement signer and update to proper type
  _signer: any

  _accounts: WalletAccount[] = []

  get installed() {
    return isSolflare(window?.solflare)
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

      this.setAccounts([
        {
          address,
          source: this.extensionName,
          name: shortenAccountAddress(address),
          wallet: this,
          signer: this.signer,
        },
      ])

      this._extension = wallet
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

  subscribeAccounts = async (callback?: SubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    // @TODO: implement account change if possible
  }

  unsubscribe = () => {}
}
