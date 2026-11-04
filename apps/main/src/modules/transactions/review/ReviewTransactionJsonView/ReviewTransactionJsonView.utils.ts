import {
  formatTypeValueJson,
  JsonValue,
  propPath,
  safeParse,
  safeStringify,
} from "@galacticcouncil/utils"
import { isArray, isBigInt, isPlainObject, mapValues, prop, zip } from "remeda"
import { Abi, decodeFunctionData, erc20Abi, getAbiItem, Hex, isHex } from "viem"

import {
  HYPERVISOR_ABI,
  HYPERVISOR_WITHDRAW_ABI,
  UNIPROXY_ABI,
} from "@/api/gamma/abi"
import {
  BIL_DEPOSIT_ZAP_ABI,
  BIL_POOL_ABI,
  VAULT_ABI,
} from "@/modules/strategies/bil/config/abi"
import {
  LOOPER_FACTORY_ABI,
  LOOPER_POSITION_ABI,
} from "@/modules/strategies/multiply/config/abi"
import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import {
  isEvmCall,
  isNearCall,
  isSolanaCall,
  isSuiCall,
  isZecCall,
} from "@/modules/transactions/utils/xcm"

export const decodeEvmCall = (abi: Abi, data: Hex) => {
  try {
    const decodedData = decodeFunctionData({
      data,
      abi,
    })

    const methodName = decodedData.functionName

    const params = getAbiItem({
      abi,
      name: data.slice(0, 10) as Hex,
    })

    // @ts-expect-error inputs exists on Abi item
    const inputs = params?.inputs || []
    const args = decodedData?.args || []

    const format = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(format)
      if (isPlainObject(value)) return mapValues(value, format)
      if (value === null || value === undefined || isBigInt(value)) {
        return String(value)
      }
      return value
    }
    const formattedArgs = args.map(format)

    const argNames = inputs.map(prop("name"))
    return {
      [methodName]: Object.fromEntries(zip(argNames, formattedArgs)),
    }
  } catch {
    return {}
  }
}

const KNOWN_ABIS: Abi = [
  ...erc20Abi,
  ...UNIPROXY_ABI,
  ...HYPERVISOR_ABI,
  ...HYPERVISOR_WITHDRAW_ABI,
  ...VAULT_ABI,
  ...BIL_POOL_ABI,
  ...BIL_DEPOSIT_ZAP_ABI,
  ...LOOPER_FACTORY_ABI,
  ...LOOPER_POSITION_ABI,
]

const decodeEvmCallInput = (call: unknown): unknown => {
  if (!isPlainObject(call) || !isHex(call.input)) return call
  const decoded = decodeEvmCall(KNOWN_ABIS, call.input)
  return Object.keys(decoded).length ? { ...call, input: decoded } : call
}

// Replaces the hex input of every EVM.call in the tree with its decoded call,
// when the selector belongs to a known ABI.
export const decodeEvmInputs = (json: unknown): unknown => {
  if (isArray(json)) return json.map(decodeEvmInputs)
  if (!isPlainObject(json)) return json

  return mapValues(json, (value, key) =>
    key === "EVM.call" ? decodeEvmCallInput(value) : decodeEvmInputs(value),
  )
}

// Every EVM.call in the tree, in order.
const extractEvmCalls = (json: unknown): Record<string, unknown>[] => {
  if (isArray(json)) return json.flatMap(extractEvmCalls)
  if (!isPlainObject(json)) return []

  return Object.entries(json).flatMap(([key, value]) =>
    key === "EVM.call" && isPlainObject(value)
      ? [value]
      : extractEvmCalls(value),
  )
}

// Review view only: decodeTx feeds the dry run too, which needs the raw input.
// "evm" mode on an extrinsic shows just its EVM calls, like a native EVM tx.
export const decodeReviewTx = (
  tx: AnyTransaction,
  path?: string,
  mode?: "default" | "evm" | "substrate",
): object | JsonValue => {
  const json = decodeTx(tx, path)
  if (!isPapiTransaction(tx)) return json

  const decoded = decodeEvmInputs(json)
  if (mode !== "evm") return decoded as JsonValue

  const inputs = extractEvmCalls(decoded).map(prop("input"))
  return (inputs.length === 1 ? inputs[0] : inputs) as JsonValue
}

export const decodeTx = (
  tx: AnyTransaction,
  path?: string,
): object | JsonValue => {
  if (isPapiTransaction(tx)) {
    const decodedCall = path ? propPath(tx.decodedCall, path) : tx.decodedCall
    const txJson = safeStringify(decodedCall)
    try {
      return formatTypeValueJson(safeParse(txJson))
    } catch {
      return safeParse(txJson)
    }
  }

  if (isEvmCall(tx)) {
    let abi = KNOWN_ABIS
    try {
      if (tx.abi) abi = safeParse<Abi>(tx.abi)
    } catch {
      // malformed abi string, fall back to the known ABIs
    }
    return decodeEvmCall(abi, tx.data as Hex)
  }

  if (isSolanaCall(tx)) {
    return tx.ix
  }

  if (isSuiCall(tx)) {
    return tx.commands
  }

  // The sdk serializes these as json: NEAR's receiver and actions, a Zcash
  // payment's address and amount, bigints as strings
  if (isNearCall(tx) || isZecCall(tx)) {
    try {
      return safeParse<object>(tx.data)
    } catch {
      return {}
    }
  }

  return {}
}

export const hasTxCallData = (tx: AnyTransaction): boolean =>
  isPapiTransaction(tx) ||
  isEvmCall(tx) ||
  isSolanaCall(tx) ||
  isSuiCall(tx) ||
  isNearCall(tx) ||
  isZecCall(tx)
