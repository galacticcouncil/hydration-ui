import { encodeAddress } from "@polkadot/util-crypto"
import { PublicKey } from "@solana/web3.js"

import { SolanaInjectedWindowProvider } from "@/types/solana"

export const isPhantom = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isPhantom
}

export const isSolflare = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isSolflare
}

export const isBraveSolana = (provider?: SolanaInjectedWindowProvider) => {
  return !!provider?.isBraveWallet
}

export const safeConvertSolanaAddressToSS58 = (address: string, prefix = 0) => {
  try {
    return encodeAddress(new PublicKey(address).toBytes(), prefix)
  } catch {
    return ""
  }
}
