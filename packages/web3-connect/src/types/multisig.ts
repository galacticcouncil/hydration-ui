import { HydrationQueries } from "@galacticcouncil/descriptors"
import { MultisigsByAccountIdsQuery } from "@galacticcouncil/indexer/multix"

export type MultisigAccount = MultisigsByAccountIdsQuery["accounts"][number]

export type MultisigKeyArgs =
  HydrationQueries["Multisig"]["Multisigs"]["KeyArgs"]
export type MultisigValue = HydrationQueries["Multisig"]["Multisigs"]["Value"]

export type MultisigEntry = {
  keyArgs: MultisigKeyArgs
  value: MultisigValue
}

export type MultisigPendingTx = MultisigValue & {
  multisigAddress: string
  callHash: string
}
