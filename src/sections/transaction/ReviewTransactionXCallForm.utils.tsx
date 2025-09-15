import { CallType } from "@galacticcouncil/xcm-core"
import { Call, EvmCall, SolanaCall, SuiCall } from "@galacticcouncil/xcm-sdk"

export function isEvmCall(x: Call | undefined): x is EvmCall {
  return typeof x === "object" && x.type === CallType.Evm
}

export function isSolanaCall(x: Call | undefined): x is SolanaCall {
  return typeof x === "object" && x.type === CallType.Solana
}

export function isSuiCall(x: Call | undefined): x is SuiCall {
  return typeof x === "object" && x.type === CallType.Sui
}
