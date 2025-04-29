import { CallType } from "@galacticcouncil/xcm-core"
import { Call, EvmCall } from "@galacticcouncil/xcm-sdk"
import { isObjectType } from "remeda"

import { AnyTransaction } from "@/states/transactions"

export function isCall(x: AnyTransaction): x is Call {
  return isObjectType(x) && "type" in x
}

export function isSubstrateCall(x: AnyTransaction): x is Call {
  return isCall(x) && x.type === CallType.Substrate
}

export function isEvmCall(x: AnyTransaction): x is EvmCall {
  return isCall(x) && x.type === CallType.Evm
}
