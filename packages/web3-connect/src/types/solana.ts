import { PublicKey, VersionedTransaction } from "@solana/web3.js"

export type SolanaSignature = { signature: string }

type SolanaProviderEventType = "connect" | "disconnect" | "accountChanged"

export interface SolanaInjectedWindowProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  isConnected?: boolean
  publicKey: PublicKey
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (
    event: SolanaProviderEventType,
    handler: (args?: unknown) => void,
  ) => void
  off: (
    event: SolanaProviderEventType,
    handler: (args?: unknown) => void,
  ) => void
  signTransaction: (
    transaction: VersionedTransaction,
  ) => Promise<SolanaSignature>
  signAllTransactions: (
    transactions: VersionedTransaction[],
  ) => Promise<SolanaSignature[]>
  signAndSendTransaction: (
    transaction: VersionedTransaction,
  ) => Promise<SolanaSignature>
  signAndSendAllTransactions: (
    transactions: VersionedTransaction[],
  ) => Promise<SolanaSignature[]>
}
