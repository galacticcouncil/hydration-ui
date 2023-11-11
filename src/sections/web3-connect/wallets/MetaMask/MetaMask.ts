import { ExternalProvider, Web3Provider } from "@ethersproject/providers"
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk"
import { Wallet, WalletAccount } from "@talismn/connect-wallets"
import MetaMaskLogo from "assets/icons/MetaMask.svg"
import { H160 } from "utils/evm"
import { isMetaMaskInstalled, requestNetworkSwitch } from "utils/metamask"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { noop } from "utils/helpers"

type AccountSubscriptionFn = (
  accounts: WalletAccount[] | undefined,
  addresses: string[],
) => void | Promise<void>

type ChainSubscriptionFn = (payload: number | null) => void | Promise<void>

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL as string

type MetamaskInit = {
  onAccountsChanged?: AccountSubscriptionFn
  onChainChanged?: ChainSubscriptionFn
}

export class MetaMask implements Wallet {
  extensionName = "metamask"
  title = "MetaMask"
  installUrl = "https://metamask.io/download"
  logo = {
    src: MetaMaskLogo,
    alt: "MetaMask Logo",
  }

  _extension: SDKProvider | undefined
  _signer: MetaMaskSigner | undefined

  evmAddress?: string

  onAccountsChanged: AccountSubscriptionFn | undefined
  onChainChanged: ChainSubscriptionFn | undefined

  constructor(
    { onAccountsChanged, onChainChanged }: MetamaskInit = {
      onAccountsChanged: noop,
      onChainChanged: noop,
    },
  ) {
    this.onAccountsChanged = onAccountsChanged
    this.onChainChanged = onChainChanged
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return isMetaMaskInstalled
  }

  get rawExtension() {
    return window.ethereum
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    try {
      const MMSDK = new MetaMaskSDK({
        extensionOnly: true,
        dappMetadata: {
          name: dappName,
          url: DOMAIN_URL,
        },
      })

      await MMSDK.init()

      const metamask = MMSDK.getProvider()

      await requestNetworkSwitch(metamask)
      const addresses = await metamask.request<string[]>({
        method: "eth_requestAccounts",
        params: [],
      })

      const address =
        Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : ""

      const provider = new Web3Provider(metamask as unknown as ExternalProvider)

      this.evmAddress = address
      this._extension = metamask
      this._signer = address ? new MetaMaskSigner(address, provider) : undefined

      if (this.onAccountsChanged)
        await this.subscribeAccounts(this.onAccountsChanged)
      if (this.onChainChanged)
        await this.subscribeChainChanged(this.onChainChanged)
    } catch (err: any) {
      throw this.transformError(err as Error)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    const accounts = await this._extension.request<string[]>({
      method: "eth_requestAccounts",
      params: [],
    })

    return (
      (accounts || [])
        // allow only one account - first in array is always active account
        .slice(0, 1)
        .filter((address): address is string => !!address)
        .map(this.toWalletAccount)
    )
  }

  toWalletAccount = (address: string): WalletAccount => {
    return {
      address: new H160(address).toAccount(),
      source: this.extensionName,
      name: this.title,
      wallet: this,
      signer: this.signer,
    }
  }

  subscribeAccounts = async (callback: AccountSubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("accountsChanged", (payload) => {
      const addresses = Array.isArray(payload)
        ? payload.map((item: string) => item)
        : []

      const addressArr = addresses.slice(0, 1)
      const accounts = addressArr.slice(0, 1).map(this.toWalletAccount)

      const [address] = addressArr
      this.evmAddress = address
      this._signer?.setAddress(address)

      callback(accounts, addressArr)
    })
  }

  subscribeChainChanged = async (callback: ChainSubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("chainChanged", (payload) => {
      const chainId = typeof payload === "string" ? parseInt(payload) : null
      callback(chainId)
    })
  }
}
