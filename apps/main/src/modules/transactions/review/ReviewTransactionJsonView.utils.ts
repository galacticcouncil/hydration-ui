import { safeParse } from "@galacticcouncil/utils"
import { fromEntries, isFunction, pipe, prop, zip } from "remeda"
import { Abi, decodeFunctionData, getAbiItem, Hex } from "viem"

import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { AnyTransaction } from "@/states/transactions"

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
      if (value === null || value === undefined) return String(value)
      if (isFunction(value.toString)) {
        return value.toString()
      }
      return String(value)
    })

    const argNames = inputs.map(prop("name"))
    return {
      [methodName]: pipe(zip(argNames, formattedArgs), fromEntries),
    }
  } catch {
    return {}
  }
}

export const decodeTx = (tx: AnyTransaction) => {
  if (isPapiTransaction(tx)) {
    return tx.decodedCall
  }

  if (isEvmCall(tx)) {
    const abi = tx.abi ? safeParse<Abi>(tx.abi) : null
    if (!abi) return null

    return decodeEvmCall(abi, tx.data as Hex)
  }

  return {}
}
