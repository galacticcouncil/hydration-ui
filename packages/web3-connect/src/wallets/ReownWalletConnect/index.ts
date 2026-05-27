import { type AppKit } from "@reown/appkit"
import type UniversalProvider from "@walletconnect/universal-provider"
import { type PolkadotSigner } from "polkadot-api/pjs-signer"
import { isTruthy, uniqueBy } from "remeda"
import { type EIP1193Provider } from "viem"

import { WalletProviderType } from "@/config/providers"
import { EthereumSigner } from "@/signers/EthereumSigner"
import { SubscriptionFn, Wallet, WalletAccount } from "@/types/wallet"
import {
  AuthError,
  NotInstalledError,
  UserRejectedError,
  WalletError,
} from "@/utils/errors"
import {
  Caip10Account,
  getAppKitPolkadotSigner,
  hasSessionNamespace,
  parseCaip10Account,
  SESSION_NAMESPACES,
} from "@/wallets/ReownWalletConnect/utils"

import { AppKitSingleton } from "./AppKit"
import logo from "./logo.svg"

export class ReownWalletConnect implements Wallet {
  provider = WalletProviderType.WalletConnect
  accessor = "walletconnect"
  title = "WalletConnect"
  installUrl = ""
  logo = logo

  _appKit: AppKit
  _extension: UniversalProvider | undefined
  _signer: PolkadotSigner | EthereumSigner | undefined
  _enabled: boolean = false

  constructor() {
    this._appKit = AppKitSingleton.getInstance()
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return true
  }

  get appKit() {
    return this._appKit
  }

  get enabled() {
    return this._enabled
  }

  transformError = (err: WalletError | Error): Error => {
    return new Error(
      err.message || "WalletConnect connection was rejected or failed",
    )
  }

  enable = async () => {
    await this.appKit.ready()

    const provider = await this.appKit.getUniversalProvider()

    if (provider && hasSessionNamespace(provider)) {
      this._enabled = true
      this._extension = provider
      this._signer = this.getSignerFromProvider(provider)
      return
    }

    await this.appKit.open()

    if (!provider) throw new NotInstalledError(this)

    await new Promise<void>((resolve, reject) => {
      let unsubscribeState: (() => void) | undefined = undefined
      let unsubscribeAccount: (() => void) | undefined = undefined

      const cleanup = () => {
        unsubscribeState?.()
        unsubscribeAccount?.()
      }

      const checkSession = () => {
        if (hasSessionNamespace(provider)) {
          cleanup()
          resolve()
        }
      }

      const onClose = () => {
        if (!hasSessionNamespace(provider)) {
          cleanup()
          reject(new UserRejectedError(this))
        }
      }

      unsubscribeState = this.appKit.subscribeState((state) => {
        if (!state.open) {
          onClose()
        }
      })

      unsubscribeAccount = this.appKit.subscribeAccount(() => {
        checkSession()
      })
    })

    this._enabled = true
    this._extension = provider
    this._signer = this.getSignerFromProvider(provider)
  }

  private getSignerFromProvider(provider: UniversalProvider) {
    const accounts = this.getAccountsFromProvider(provider)
    if (!accounts) throw new AuthError(this)

    const polkadotAccount = accounts.polkadot?.[0]
    const eip155Account = accounts.eip155?.[0]

    if (polkadotAccount) {
      return getAppKitPolkadotSigner(this.appKit, polkadotAccount.address)
    }

    if (eip155Account) {
      return new EthereumSigner(
        eip155Account.address,
        provider as EIP1193Provider,
      )
    }

    throw new AuthError(this)
  }

  private getAccountsFromProvider(
    provider: UniversalProvider,
  ): Record<string, Caip10Account[]> {
    const namespaces = provider.session?.namespaces

    if (!namespaces) return {}

    return Object.fromEntries(
      Object.entries(namespaces).map(([key, ns]) => [
        key,
        uniqueBy(
          ns.accounts.map(parseCaip10Account),
          (a) => a?.address ?? "",
        ).filter(isTruthy),
      ]),
    )
  }

  private toWalletAccount = (account: Caip10Account): WalletAccount => {
    return {
      address: account.address,
      name: this.title,
      provider: this.provider,
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    const provider = await this.appKit.getUniversalProvider()
    if (!provider) return []
    const accounts = this.getAccountsFromProvider(provider)

    if (accounts?.polkadot?.length) {
      return accounts.polkadot.map(this.toWalletAccount)
    }

    if (accounts?.eip155?.length) {
      return accounts.eip155.map(this.toWalletAccount)
    }

    return []
  }

  subscribeAccounts = (callback: SubscriptionFn) => {
    this.getAccounts().then((accounts) => callback(accounts))

    const handler = () => {
      callback([])
    }

    const setupListener = async () => {
      const provider = await this.appKit.getUniversalProvider()
      provider?.on("session_delete", handler)
    }

    setupListener()

    return () => {
      const cleanup = async () => {
        const provider = await this.appKit.getUniversalProvider()
        provider?.removeListener("session_delete", handler)
      }
      cleanup()
    }
  }

  disconnect = () => {
    this._enabled = false
    this._signer = undefined
    this._extension = undefined

    const cleanup = async () => {
      try {
        const provider = await this.appKit.getUniversalProvider()
        if (provider?.session) {
          const namespaces = provider.session.namespaces
          const toReset = SESSION_NAMESPACES.filter((ns) => namespaces?.[ns])

          await provider.disconnect()
          for (const ns of toReset) {
            this.appKit.resetAccount(ns)
          }
        } else if (this.appKit.getIsConnectedState()) {
          await this.appKit.disconnect()
        }
      } catch (err) {
        // Ignore disconnect errors
      }
    }
    cleanup()
  }
}
