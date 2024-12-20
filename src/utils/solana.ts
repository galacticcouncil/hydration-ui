import { encodeAddress } from "@polkadot/util-crypto"
import { PublicKey } from "@solana/web3.js"

export interface SolanaWalletProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  isConnected?: boolean
  publicKey: PublicKey
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: "connect" | "disconnect", handler: (args?: any) => void) => void
  off: (event: "connect" | "disconnect", handler: (args?: any) => void) => void
  signTransaction?: (transaction: any) => Promise<any>
  signAllTransactions?: (transactions: any[]) => Promise<any[]>
}

export const isPhantom = (provider?: SolanaWalletProvider) => {
  return !!provider?.isPhantom
}

export const isSolflare = (provider?: SolanaWalletProvider) => {
  return !!provider?.isSolflare
}

export const safeConvertSolanaAddressToSS58 = (address: string, prefix = 0) => {
  try {
    return encodeAddress(new PublicKey(address).toBytes(), prefix)
  } catch {
    return ""
  }
}
