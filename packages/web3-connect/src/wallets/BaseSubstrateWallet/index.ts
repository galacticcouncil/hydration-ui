import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import {
  connectInjectedExtension,
  InjectedExtension,
  PolkadotSigner,
} from "polkadot-api/pjs-signer"

import { WalletProviderType } from "@/config/providers"
import { WALLET_DAPP_NAME } from "@/config/wallet"
import { SubscriptionFn, Wallet, WalletAccount } from "@/types/wallet"
import { AuthError, NotInstalledError, WalletError } from "@/utils/errors"

export class BaseSubstrateWallet implements Wallet {
  provider = "" as WalletProviderType
  accessor = ""
  title = ""
  installUrl = ""
  logo = ""

  _extension: InjectedExtension | undefined
  _signer: PolkadotSigner | undefined
  _enabled: boolean = false

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    const injectedExtension = window?.injectedWeb3?.[this.accessor]

    return !!injectedExtension
  }

  get enabled() {
    return this._enabled
  }

  get rawExtension() {
    return window?.injectedWeb3?.[this.accessor]
  }

  transformError = (err: Error): WalletError | Error => {
    if (err.message.includes("pending authorization request")) {
      return new AuthError(err.message, this)
    }
    return err
  }

  setSigner = (address: string) => {
    const accounts = this.getInjectedAccounts()
    const account = accounts.find(
      (acc) =>
        safeConvertAddressSS58(acc.address) === safeConvertAddressSS58(address),
    )
    if (account) {
      this._signer = account.polkadotSigner
    }
  }

  enable = async () => {
    if (!this.installed || !this.rawExtension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }
    try {
      const rawExtension = await connectInjectedExtension(
        this.accessor,
        WALLET_DAPP_NAME,
      )

      if (!rawExtension) {
        throw new NotInstalledError(
          `${this.title} is installed but could not be enabled. Refresh the browser and try again.`,
          this,
        )
      }

      const accounts = rawExtension.getAccounts()

      if (!accounts.length) {
        throw new AuthError(
          `${this.title} is installed but no accounts are available. Please check your wallet.`,
          this,
        )
      }

      const defaultSigner = accounts[0].polkadotSigner

      this._enabled = true
      this._extension = rawExtension
      this._signer = defaultSigner
    } catch (err) {
      throw this.transformError(err as WalletError)
    }
  }

  getInjectedAccounts = () => {
    if (!this._extension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }
    const accounts = this._extension.getAccounts()
    // @ts-expect-error Papi types dont expect ethereum accounts from substrate wallets,
    // but it can happen in Talisman or SubWallet
    return accounts.filter(({ type }) => type !== "ethereum")
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    const accounts = this.getInjectedAccounts()
    const accountsWithWallet = accounts.map((account) => {
      return {
        address: account.address,
        name: account.name ?? "",
        provider: this.provider,
      } satisfies WalletAccount
    })

    return accountsWithWallet
  }

  subscribeAccounts = async (callback: SubscriptionFn) => {
    if (!this._extension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }
    const unsubscribe = this._extension.subscribe((accounts) => {
      const accountsWithWallet = accounts.map((account) => {
        return {
          address: account.address,
          name: account.name ?? "",
          provider: this.provider,
        }
      })
      callback(accountsWithWallet)
    })

    return unsubscribe
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
  }
}
