import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SolanaChain } from "@galacticcouncil/xcm-core"
import { SolanaCall, SolanaLilJit } from "@galacticcouncil/xcm-sdk"
import { encodeAddress } from "@polkadot/util-crypto"
import {
  MessageV0,
  PublicKey,
  SignatureStatus,
  VersionedTransaction,
} from "@solana/web3.js"

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
  ) => Promise<VersionedTransaction[]>
  signAndSendTransaction: (
    transaction: VersionedTransaction,
  ) => Promise<SolanaSignature>
  signAndSendAllTransactions: (
    transactions: VersionedTransaction[],
  ) => Promise<VersionedTransaction[]>
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

export const getSolanaJitoBundleLink = (bundleId: string) => {
  return `https://explorer.jito.wtf/bundle/${bundleId}`
}

export function isSolanaAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    return PublicKey.isOnCurve(pubkey.toBuffer())
  } catch (error) {
    return false
  }
}

export async function waitForSolanaTx(
  connection: SolanaChain["connection"],
  hash: string,
): Promise<SignatureStatus> {
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }

    const checkStatus = async () => {
      try {
        const result = await connection.getSignatureStatus(hash, {
          searchTransactionHistory: true,
        })
        const status = result.value
        if (!status || status?.confirmationStatus !== "confirmed") {
          cleanup()
          timeout = setTimeout(checkStatus, 5000)
        } else {
          cleanup()
          resolve(status)
        }
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    checkStatus()
  })
}

export async function waitForSolanaBundle(
  lilJit: SolanaLilJit,
  bundleId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }

    const checkStatus = async () => {
      try {
        const result = await lilJit.getInflightBundleStatuses([bundleId])
        const { status } =
          result.value.find((b) => b.bundle_id === bundleId) || {}
        if (!status || status !== "Landed") {
          cleanup()
          timeout = setTimeout(checkStatus, 5000)
        } else {
          cleanup()
          resolve()
        }
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    checkStatus()
  })
}

export function solanaCallToVersionedTx(
  call: SolanaCall,
): VersionedTransaction {
  const { data, signers } = call

  const mssgBuffer = Buffer.from(data, "hex")
  const mssgArray = Uint8Array.from(mssgBuffer)
  const mssgV0 = MessageV0.deserialize(mssgArray)

  const versioned = new VersionedTransaction(mssgV0)
  if (signers) {
    versioned.sign(signers)
  }
  return versioned
}
