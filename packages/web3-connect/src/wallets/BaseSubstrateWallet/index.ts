import { Signer as InjectedSigner } from "@polkadot/api/types"
import {
  InjectedAccount,
  InjectedExtension,
} from "@polkadot/extension-inject/types"

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
  _signer: InjectedSigner | undefined
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

  enable = async () => {
    if (!this.installed || !this.rawExtension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }
    try {
      const rawExtension = await this.rawExtension.enable?.(WALLET_DAPP_NAME)

      if (!rawExtension) {
        throw new NotInstalledError(
          `${this.title} is installed but could not be enabled. Refresh the browser and try again.`,
          this,
        )
      }

      const extension: InjectedExtension = {
        ...rawExtension,
        name: this.accessor,
        version: this.rawExtension.version ?? "?",
      }

      this._enabled = true
      this._extension = extension
      this._signer = extension?.signer
    } catch (err) {
      throw this.transformError(err as WalletError)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }
    const accounts = await this._extension.accounts.get()
    const accountsWithWallet = accounts.map((account) => {
      return {
        address: account.address,
        name: account.name ?? "",
        provider: this.provider,
        wallet: this,
        signer: this._extension?.signer,
      }
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
    const unsubscribe = this._extension.accounts.subscribe(
      (accounts: InjectedAccount[]) => {
        const accountsWithWallet = accounts.map((account) => {
          return {
            address: account.address,
            name: account.name ?? "",
            provider: this.provider,
            wallet: this,
            signer: this._extension?.signer,
          }
        })
        callback(accountsWithWallet)
      },
    )

    return unsubscribe
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
  }
}
