import { safeParse, safeStringify } from "@galacticcouncil/utils"
import { Binary, CompatibilityToken } from "polkadot-api"
import { fromEntries, isBigInt, pipe, prop, zip } from "remeda"
import { Abi, decodeFunctionData, getAbiItem, Hex } from "viem"

import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { getPapiTransactionCallData } from "@/modules/transactions/utils/tx"
import {
  isEvmCall,
  isSolanaCall,
  isSuiCall,
} from "@/modules/transactions/utils/xcm"
import { Papi } from "@/providers/rpcProvider"

export const decodeEvmCall = (abi: Abi, data: Hex) => {
  try {
    const decodedData = decodeFunctionData({
      data,
      abi,
    })

    const methodName = decodedData.functionName

    const params = getAbiItem({
      abi,
      name: methodName,
    })

    // @ts-expect-error inputs exists on Abi item
    const inputs = params?.inputs || []
    const args = decodedData?.args || []

    const formattedArgs = args.map((value) => {
      if (value === null || value === undefined || isBigInt(value)) {
        return String(value)
      }
      return value
    })

    const argNames = inputs.map(prop("name"))
    return {
      [methodName]: pipe(zip(argNames, formattedArgs), fromEntries),
    }
  } catch {
    return {}
  }
}

export const decodeTx = (tx: AnyTransaction): object => {
  if (isPapiTransaction(tx)) {
    return safeParse(safeStringify(tx.decodedCall))
  }

  if (isEvmCall(tx)) {
    const abi = tx.abi ? safeParse<Abi>(tx.abi) : null
    if (!abi) return {}

    return decodeEvmCall(abi, tx.data as Hex)
  }

  if (isSolanaCall(tx)) {
    return tx.ix
  }

  if (isSuiCall(tx)) {
    return tx.commands
  }

  return {}
}

export const getTxCallHash = (
  tx: AnyTransaction,
  papiCompatibilityToken: CompatibilityToken,
): string => {
  if (isPapiTransaction(tx)) {
    return getPapiTransactionCallData(tx, papiCompatibilityToken)
  }

  if (isEvmCall(tx) || isSolanaCall(tx) || isSuiCall(tx)) {
    return tx.data
  }

  return ""
}

export const encodeCallHashToTx = (callHash: string, papi?: Papi) => {
  if (papi) {
    try {
      return papi.txFromCallData(Binary.fromHex(callHash))
    } catch (error) {
      throw new Error("Failed to encode call hash to tx")
    }
  }

  throw new Error("Papi is required")
}
