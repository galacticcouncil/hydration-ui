import { WalletProviderType } from "@/config/providers"
import { WalletError } from "@/utils/errors"

export type SubscriptionFn = (
  accounts: WalletAccount[] | undefined,
) => void | Promise<void>

export type WalletAccount = {
  address: string
  name: string
  provider: WalletProviderType
  wallet: Wallet
  signer?: unknown
}

export type WalletData = {
  provider: WalletProviderType
  accessor: string
  title: string
  installUrl: string
  logo: string
  installed: boolean
}

type WalletExtension = {
  extension: unknown
  signer: unknown
}

interface Signer {
  sign?: (address: string, payload: string) => unknown
}

interface Connector {
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
    Connector,
    Signer,
    WalletErrors {}
