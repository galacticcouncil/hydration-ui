import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import {
  AccountId,
  getMultisigAccountId,
} from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"

import { MultisigEntry, MultisigPendingTx } from "@/types/multisig"

export function deriveMultisigAddress(
  signers: string[],
  threshold: number,
): string {
  const pubkey = getMultisigAccountId({
    threshold,
    signatories: signers.map((s) => AccountId().enc(s)),
  })

  return safeConvertPublicKeyToSS58(toHex(pubkey))
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
