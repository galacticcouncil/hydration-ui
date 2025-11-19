import { isBinary, safeParse } from "@galacticcouncil/utils"
import { CompatibilityToken } from "polkadot-api"
import { fromEntries, isBigInt, pipe, prop, zip } from "remeda"
import { Abi, decodeFunctionData, getAbiItem, Hex } from "viem"

import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"

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
    return tx.decodedCall
  }

  if (isEvmCall(tx)) {
    const abi = tx.abi ? safeParse<Abi>(tx.abi) : null
    if (!abi) return {}

    return decodeEvmCall(abi, tx.data as Hex)
  }

  return {}
}

export const getTxCallHash = (
  tx: AnyTransaction,
  papiCompatibilityToken: CompatibilityToken,
): string => {
  if (isPapiTransaction(tx)) {
    const binary = tx.getEncodedData(papiCompatibilityToken)
    return isBinary(binary) ? binary.asHex() : ""
  }

  if (isEvmCall(tx)) {
    return tx.data
  }

  return ""
}
