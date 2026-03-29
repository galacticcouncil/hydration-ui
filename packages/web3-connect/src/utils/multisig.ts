import { AccountId } from "@polkadot-api/substrate-bindings"
import { getMultisigAccountId } from "@polkadot-api/substrate-bindings"

export const HYDRATION_SS58_PREFIX = 63

/**
 * Returns true if the address is a valid SS58 address (can be encoded/decoded).
 */
export function isValidAddress(address: string): boolean {
  try {
    AccountId().enc(address)
    return true
  } catch {
    return false
  }
}

/**
 * Derives the multisig account address from a list of signer SS58 addresses and threshold.
 * Uses the same algorithm as the Polkadot multisig pallet.
 * Signatories are sorted lexicographically by their raw public key bytes.
 */
const POLKADOT_SS58_PREFIX = 0

function deriveMultisigPubkey(
  signers: string[],
  threshold: number,
): Uint8Array | null {
  if (signers.length < 2 || threshold < 1) return null

  try {
    const signatories = signers
      .map((s) => AccountId().enc(s))
      .sort((a, b) => {
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return a[i] - b[i]
        }
        return 0
      })

    return getMultisigAccountId({ threshold, signatories })
  } catch {
    return null
  }
}

function pubkeyToHex(pubkey: Uint8Array): string {
  return (
    "0x" +
    Array.from(pubkey)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
}

export function deriveMultisigAddress(
  signers: string[],
  threshold: number,
): string {
  const pubkey = deriveMultisigPubkey(signers, threshold)
  if (!pubkey) return ""
  try {
    return AccountId(HYDRATION_SS58_PREFIX).dec(pubkeyToHex(pubkey))
  } catch {
    return ""
  }
}

/**
 * Converts any valid SS58 address to Polkadot format (prefix 0, starts with 1).
 */
export function toPolkadotAddress(address: string): string {
  try {
    const pubkey = AccountId().enc(address)
    return AccountId(POLKADOT_SS58_PREFIX).dec(pubkeyToHex(pubkey))
  } catch {
    return address
  }
}

export function deriveMultisigAddressPolkadot(
  signers: string[],
  threshold: number,
): string {
  const pubkey = deriveMultisigPubkey(signers, threshold)
  if (!pubkey) return ""
  try {
    return AccountId(POLKADOT_SS58_PREFIX).dec(pubkeyToHex(pubkey))
  } catch {
    return ""
  }
}
