import { shortenAccountAddress } from "@galacticcouncil/utils"
import { EIP1193Provider } from "viem"

import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { EthereumSigner } from "@/signers/EthereumSigner"
import { SubscriptionFn, Wallet, WalletAccount } from "@/types/wallet"
import { AuthError } from "@/utils/errors"
import { toStoredAccount } from "@/utils/wallet"

import logo from "./logo.svg"

type TurnkeyConfig = {
  eip1193Provider: EIP1193Provider
  address: string
}

let turnkeyConfig: TurnkeyConfig | null = null
let loginHandler: (() => Promise<void>) | null = null
let configResolver: ((config: TurnkeyConfig) => void) | null = null

export function setTurnkeyConfig(config: TurnkeyConfig | null) {
  turnkeyConfig = config
  if (config && configResolver) {
    configResolver(config)
    configResolver = null
  }
}

export function getTurnkeyConfig(): TurnkeyConfig | null {
  return turnkeyConfig
}

export function setTurnkeyLoginHandler(handler: () => Promise<void>) {
  loginHandler = handler
}

export class TurnkeyWallet implements Wallet {
  provider = WalletProviderType.Turnkey
  accessor = "turnkey"
  title = "Turnkey"
  installUrl = ""
  logo = logo

  _extension: EIP1193Provider | undefined
  _signer: EthereumSigner | undefined
  _enabled: boolean = false
  _address: string | undefined

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return true
  }

  get enabled() {
    return this._enabled
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async () => {
    // If already configured (user already authed via Turnkey), use it directly
    let config = getTurnkeyConfig()

    if (!config) {
      // Trigger Turnkey's auth modal and wait for the bridge to provide config
      if (!loginHandler) {
        throw new AuthError(this)
      }

      // Close the web3-connect modal so Turnkey's auth modal is interactive
      useWeb3Connect.getState().toggle()

      let timeoutId: ReturnType<typeof setTimeout>
      const configPromise = new Promise<TurnkeyConfig>((resolve, reject) => {
        configResolver = (cfg) => {
          clearTimeout(timeoutId)
          resolve(cfg)
        }
        timeoutId = setTimeout(() => {
          configResolver = null
          reject(new Error("Turnkey authentication timed out"))
        }, 300_000)
      })

      await loginHandler()
      config = await configPromise
    }

    try {
      this._extension = config.eip1193Provider
      this._address = config.address
      this._signer = new EthereumSigner(config.address, config.eip1193Provider)
      this._enabled = true

      // Turnkey always has exactly one account and the modal is closed,
      // so auto-select immediately — useWeb3Enable.onSuccess won't do this
      const account = this.toWalletAccount(config.address)
      useWeb3Connect.getState().setAccount(toStoredAccount(account))
    } catch (err: unknown) {
      throw this.transformError(err as Error)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._address) {
      return []
    }

    return [this.toWalletAccount(this._address)]
  }

  toWalletAccount = (address: string): WalletAccount => {
    return {
      address,
      provider: this.provider,
      name: shortenAccountAddress(address),
    }
  }

  subscribeAccounts = (_callback: SubscriptionFn) => {
    return () => {}
  }

  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._signer = undefined
    this._address = undefined
    setTurnkeyConfig(null)
  }
}
