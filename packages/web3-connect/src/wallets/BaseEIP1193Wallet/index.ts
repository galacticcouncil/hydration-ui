import { shortenAccountAddress } from "@galacticcouncil/utils"
import { EIP1193Provider } from "viem"

import { WalletProviderType } from "@/config/providers"
import { EthereumSigner } from "@/signers/EthereumSigner"
import { EIP6963AnnounceProviderEvent } from "@/types/evm"
import { SubscriptionFn, Wallet, WalletAccount } from "@/types/wallet"
import { NotInstalledError } from "@/utils/errors"

export class BaseEIP1193Wallet implements Wallet {
  provider = "" as WalletProviderType
  accessor = ""
  title = ""
  installUrl = ""
  logo = ""

  _rawExtension: EIP1193Provider | undefined
  _extension: Required<EIP1193Provider> | undefined
  _signer: EthereumSigner | undefined
  _enabled: boolean = false

  constructor() {
    window.addEventListener("eip6963:announceProvider", (e: unknown) =>
      this.handleAnnounceProvider(e as EIP6963AnnounceProviderEvent),
    )
  }

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

  handleAnnounceProvider = (e: EIP6963AnnounceProviderEvent) => {
    if (e.detail.info.rdns === this.accessor) {
      this._rawExtension = e.detail.provider
    }
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async () => {
    if (!this.installed || !this.rawExtension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }

    try {
      const extension = this.rawExtension

      const addresses = await extension.request({
        method: "eth_requestAccounts",
      })

      const address =
        Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : ""

      this._enabled = true
      this._extension = extension
      this._signer = address
        ? new EthereumSigner(address, extension)
        : undefined
    } catch (err: unknown) {
      //@ts-expect-error unknown error type
      if (err.code === -32002) {
        throw new NotInstalledError(
          `Already processing request from ${this.title}. Check your wallet.`,
          this,
        )
      }
      throw this.transformError(err as Error)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }

    const accounts = (await this._extension.request({
      method: "eth_requestAccounts",
    })) as string[]

    return (accounts || [])
      .filter((address): address is string => !!address)
      .slice(0, 1)
      .map(this.toWalletAccount)
  }

  toWalletAccount = (address: string): WalletAccount => {
    return {
      address: address,
      provider: this.provider,
      name: shortenAccountAddress(address),
    }
  }

  subscribeAccounts = (callback: SubscriptionFn) => {
    if (!this._extension) {
      throw new NotInstalledError(
        `Refresh the browser if ${this.title} is already installed.`,
        this,
      )
    }

    const handler = (payload: unknown) => {
      const addresses = Array.isArray(payload)
        ? payload.map((item: string) => item)
        : []

      const accounts = addresses.slice(0, 1).map(this.toWalletAccount)
      callback?.(accounts)
    }

    this._extension.on("accountsChanged", handler)

    return () => {
      if (!this._extension) return
      this._extension.removeListener("accountsChanged", handler)
    }
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
  }
}
