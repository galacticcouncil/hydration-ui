import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { HexString } from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xc-core"
import { Call, SolanaCall, SuiCall } from "@galacticcouncil/xc-sdk"
import { isObjectType } from "remeda"
import { decodeFunctionData } from "viem"

import { AnyTransaction } from "@/modules/transactions/types"

const APPROVE_LEADING_BYTES = "0x095ea7b3"

export function isEvmApproveCall(call: Call): call is ExtendedEvmCall {
  if (!isEvmCall(call)) return false

  const { abi, data } = call

  if (!abi || !data) return false

  const { functionName } = decodeFunctionData({
    abi: JSON.parse(abi),
    data: data as HexString,
  })
  return functionName === "approve" && data.startsWith(APPROVE_LEADING_BYTES)
}

export function isCall(x: AnyTransaction): x is Call {
  return isObjectType(x) && "type" in x
}

export function isSubstrateCall(x: AnyTransaction): x is Call {
  return isCall(x) && x.type === CallType.Substrate
}

export function isEvmCall(x: AnyTransaction): x is ExtendedEvmCall {
  return isCall(x) && x.type === CallType.Evm
}

export function isSolanaCall(x: AnyTransaction): x is SolanaCall {
  return isCall(x) && x.type === CallType.Solana
}

export function isSuiCall(x: AnyTransaction): x is SuiCall {
  return isCall(x) && x.type === CallType.Sui
}
