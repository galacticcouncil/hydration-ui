import { propPath, stringEquals } from "@galacticcouncil/utils"
import { ORDER_PLACED_ABI } from "@galacticcouncil/xc-swap"
import { isObjectType } from "remeda"
import { decodeEventLog, Hex, toEventSelector, toHex } from "viem"

import { XC_SWAP_CONFIG } from "@/config/xcSwap"
import { isSubstrateTxResult, TSuccessResult } from "@/states/transactions"

const orderPlacedSelector = toEventSelector(ORDER_PLACED_ABI[0])

type OrderPlacedLog = {
  address: string
  topics: readonly Hex[]
  data: Hex
}

const decodeOrderPlaced = (log: OrderPlacedLog): string | null => {
  const [signatureTopic] = log.topics
  if (!signatureTopic || !stringEquals(signatureTopic, orderPlacedSelector)) {
    return null
  }
  if (!stringEquals(log.address, XC_SWAP_CONFIG.emitter)) return null

  return decodeEventLog({
    abi: ORDER_PLACED_ABI,
    topics: log.topics as [Hex, ...Hex[]],
    data: log.data,
  }).args.transferSequence.toString()
}

type SubstrateEvmLog = {
  address: Hex
  topics: [Hex, ...Hex[]]
  data: Uint8Array
}

export const getXcSwapSequence = (result: TSuccessResult): string | null => {
  if (isSubstrateTxResult(result)) {
    for (const event of result.events) {
      if (event.type !== "EVM" || !isObjectType(event.value)) continue

      const log = propPath(event.value, "value.log") as
        | SubstrateEvmLog
        | undefined
      if (!log) continue

      const sequence = decodeOrderPlaced({
        address: log.address,
        topics: log.topics,
        data: toHex(log.data),
      })
      if (sequence !== null) return sequence
    }

    return null
  }

  if (!("logs" in result) || !Array.isArray(result.logs)) return null

  for (const log of result.logs) {
    const sequence = decodeOrderPlaced(log)
    if (sequence !== null) return sequence
  }

  return null
}
