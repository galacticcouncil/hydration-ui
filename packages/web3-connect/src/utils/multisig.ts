import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import { AccountId } from "@polkadot-api/substrate-bindings"
import { getMultisigAccountId } from "@polkadot-api/substrate-bindings"

import { MultisigEntry, MultisigPendingTx } from "@/types/multisig"

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
    return safeConvertPublicKeyToSS58(pubkeyToHex(pubkey))
  } catch {
    return ""
  }
}

export function normalizeMultisigEntry(
  entry: MultisigEntry,
): MultisigPendingTx {
  return {
    multisigAddress: entry.keyArgs[0],
    callHash: entry.keyArgs[1].asHex(),
    when: entry.value.when,
    deposit: entry.value.deposit,
    depositor: entry.value.depositor,
    approvals: entry.value.approvals,
  }
}
