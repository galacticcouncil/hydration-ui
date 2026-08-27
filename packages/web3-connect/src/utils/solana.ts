import {
  Connection,
  Keypair,
  MessageV0,
  VersionedTransaction,
} from "@solana/web3.js"

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

/**
 * Deserialize a built message & sign it.
 *
 * The blockhash is refreshed first: it was minted when the call was built,
 * well into the 150 slot expiry by the time it gets signed. A sequence
 * ([wrapNative, transfer]) passes one shared blockhash instead, so every
 * tx in it confirms against the same expiry.
 */
export const dataToVersionedTx = async (
  connection: Connection,
  data: string,
  signers: Keypair[],
  blockhash?: string,
): Promise<VersionedTransaction> => {
  const mssgBuffer = Buffer.from(data, "hex")
  const mssgArray = Uint8Array.from(mssgBuffer)
  const mssgV0 = MessageV0.deserialize(mssgArray)

  mssgV0.recentBlockhash =
    blockhash ?? (await connection.getLatestBlockhash()).blockhash

  const versioned = new VersionedTransaction(mssgV0)
  if (signers) {
    versioned.sign(signers)
  }
  return versioned
}
