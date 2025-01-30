import { WalletProviderType } from "@/config/providers"
import { WalletError } from "@/utils/errors"

export type SubscriptionFn = (
  accounts: WalletAccount[] | undefined,
) => void | Promise<void>

export interface WalletAccount {
  address: string
  source: string
  name?: string
  wallet?: Wallet
  signer?: unknown
}

interface WalletData {
  provider: WalletProviderType
  accessor: string
  title: string
  installUrl: string
  logo: string
}

interface WalletExtension {
  installed: boolean
  extension: unknown
  signer: unknown
}

interface Signer {
  sign?: (address: string, payload: string) => unknown
}

interface Connector {
  enable: (dappName: string) => unknown
  getAccounts: (anyType?: boolean) => Promise<WalletAccount[]>
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
