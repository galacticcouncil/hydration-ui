import { PolkadotSigner } from "polkadot-api"

import { WalletProviderType } from "@/config/providers"
import { EthereumSigner } from "@/signers/EthereumSigner"
import { WalletError } from "@/utils/errors"

export type DummySigner = object

export type AnySigner = PolkadotSigner | EthereumSigner | DummySigner

export type SubscriptionFn = (
  accounts: WalletAccount[] | undefined,
) => void | Promise<void>

export type WalletAccount = {
  address: string
  name: string
  provider: WalletProviderType
}

export type WalletData = {
  provider: WalletProviderType
  accessor: string
  title: string
  installUrl: string
  logo: string
  installed: boolean
  enabled: boolean
}

type WalletExtension = {
  extension?: unknown
  signer: PolkadotSigner | EthereumSigner | DummySigner | undefined
}

interface WalletConnector {
  enable: () => unknown
  disconnect: () => void
  getAccounts: () => Promise<WalletAccount[]>
  subscribeAccounts: (callback: SubscriptionFn) => unknown
}

interface WalletErrors {
  transformError: (err: WalletError) => Error
}

export interface Wallet
  extends WalletData,
    WalletExtension,
    WalletConnector,
    WalletErrors {}
