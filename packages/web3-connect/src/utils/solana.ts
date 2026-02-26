import { Keypair, MessageV0, VersionedTransaction } from "@solana/web3.js"

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

export const dataToVersionedTx = (
  data: string,
  signers: Keypair[],
): VersionedTransaction => {
  const mssgBuffer = Buffer.from(data, "hex")
  const mssgArray = Uint8Array.from(mssgBuffer)
  const mssgV0 = MessageV0.deserialize(mssgArray)

  const versioned = new VersionedTransaction(mssgV0)
  if (signers) {
    versioned.sign(signers)
  }
  return versioned
}
