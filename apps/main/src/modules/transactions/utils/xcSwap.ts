import { propPath, stringEquals } from "@galacticcouncil/utils"
import { ORDER_PLACED_ABI } from "@galacticcouncil/xc-swap"
import { isObjectType } from "remeda"
import { decodeEventLog, Hex, toEventSelector, toHex } from "viem"

import { XC_SWAP_CONFIG } from "@/config/xcSwap"

const orderPlacedSelector = toEventSelector(ORDER_PLACED_ABI[0])

type EvmLog = {
  address: Hex
  topics: [Hex, ...Hex[]]
  data: Uint8Array
}

export const getXcSwapSequenceFromEvents = (
  events: ReadonlyArray<{ type: string; value: unknown }>,
): bigint | null => {
  for (const event of events) {
    if (event.type !== "EVM" || !isObjectType(event.value)) continue

    const log = propPath(event.value, "value.log") as EvmLog | undefined
    if (!log || !stringEquals(log.address, XC_SWAP_CONFIG.emitter)) continue
    if (!stringEquals(log.topics[0], orderPlacedSelector)) continue

    return decodeEventLog({
      abi: ORDER_PLACED_ABI,
      topics: log.topics,
      data: toHex(log.data),
    }).args.transferSequence
  }

  return null
}
