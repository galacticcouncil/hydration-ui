import { PublicKey, VersionedTransaction } from "@solana/web3.js"

export type SolanaSignature = { signature: string }

export interface SolanaInjectedWindowProvider {
  isPhantom?: boolean
  isBraveWallet?: boolean
  isSolflare?: boolean
  isConnected?: boolean
  publicKey: PublicKey
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on(event: "accountChanged", handler: (publicKey: PublicKey) => void): void
  on(event: "connect", handler: () => void): void
  on(event: "disconnect", handler: () => void): void
  off(event: "accountChanged", handler: (publicKey: PublicKey) => void): void
  off(event: "connect", handler: () => void): void
  off(event: "disconnect", handler: () => void): void
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
