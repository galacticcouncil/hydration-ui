import { type AnyPapiTx } from "@/modules/transactions/types"
import { type Papi } from "@/providers/rpcProvider"

type DecodedCall = AnyPapiTx["decodedCall"]

export const composeVaultBatch = (
  papi: Papi,
  {
    bind,
    leading = [],
    evmCalls,
    trailing = [],
    atomic = false,
  }: {
    bind: boolean
    leading?: DecodedCall[]
    evmCalls: DecodedCall[]
    /** after the EVM calls, e.g. a sell of what they paid out */
    trailing?: DecodedCall[]
    atomic?: boolean
  },
): DecodedCall[] => [
  ...(bind ? [papi.tx.EVMAccounts.bind_evm_address().decodedCall] : []),
  ...leading,
  // a reverted EVM.call still succeeds as an extrinsic; dispatch_evm_call fails the batch
  ...(atomic
    ? evmCalls.map(
        (call) => papi.tx.Dispatcher.dispatch_evm_call({ call }).decodedCall,
      )
    : evmCalls),
  ...trailing,
]
