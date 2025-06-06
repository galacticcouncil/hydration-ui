import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { CallType } from "@galacticcouncil/xcm-core"
import { Call } from "@galacticcouncil/xcm-sdk"
import { isObjectType } from "remeda"

import { AnyTransaction } from "@/states/transactions"

export function isCall(x: AnyTransaction): x is Call {
  return isObjectType(x) && "type" in x
}

export function isSubstrateCall(x: AnyTransaction): x is Call {
  return isCall(x) && x.type === CallType.Substrate
}

export function isEvmCall(x: AnyTransaction): x is ExtendedEvmCall {
  return isCall(x) && x.type === CallType.Evm
}
