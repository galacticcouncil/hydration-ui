import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SolanaChain } from "@galacticcouncil/xcm-core"
import { encodeAddress } from "@polkadot/util-crypto"
import { PublicKey, VersionedTransaction } from "@solana/web3.js"

export type SolanaSignature = { signature: string }

type SolanaProviderEventType = "connect" | "disconnect" | "accountChanged"

export interface SolanaWalletProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  isBraveWallet?: boolean
  isConnected?: boolean
  publicKey: PublicKey
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: SolanaProviderEventType, handler: (args?: any) => void) => void
  off: (event: SolanaProviderEventType, handler: (args?: any) => void) => void
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

export const isPhantom = (provider?: SolanaWalletProvider) => {
  return !!provider?.isPhantom
}

export const isSolflare = (provider?: SolanaWalletProvider) => {
  return !!provider?.isSolflare
}

export const isBraveSolana = (provider?: SolanaWalletProvider) => {
  return !!provider?.isBraveWallet
}

export const safeConvertSolanaAddressToSS58 = (address: string, prefix = 0) => {
  try {
    return encodeAddress(new PublicKey(address).toBytes(), prefix)
  } catch {
    return ""
  }
}

export function getSolanaTxLink(hash: string) {
  const chain = chainsMap.get("solana") as SolanaChain
  return `${chain.explorer}/tx/${hash}`
}

export function isSolanaAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    return PublicKey.isOnCurve(pubkey.toBuffer())
  } catch (error) {
    return false
  }
}
