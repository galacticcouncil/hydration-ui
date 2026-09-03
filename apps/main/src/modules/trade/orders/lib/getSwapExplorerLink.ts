import { neckwork } from "@galacticcouncil/utils"
import { isNumber } from "remeda"

import { OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { SwapRowStatus } from "@/modules/trade/orders/lib/useSwapsData"

type BlockEventRef = {
  readonly paraBlockHeight: number
  readonly indexInBlock: number
}

type SwapEventRef = BlockEventRef & {
  readonly extrinsicIndex?: number | null
}

export const getSwapExplorerLink = (
  status: SwapRowStatus | null,
  swapEvent: SwapEventRef | null | undefined,
  dcaExecutionEvent?: BlockEventRef | null,
  scheduleId?: number,
) => {
  const isDca =
    status?.kind === OrderKind.Dca || status?.kind === OrderKind.DcaRolling

  if (isDca) {
    if (dcaExecutionEvent) {
      return neckwork.activityEvent(
        "dca",
        dcaExecutionEvent.paraBlockHeight,
        dcaExecutionEvent.indexInBlock,
      )
    }

    if (isNumber(scheduleId)) {
      return neckwork.activityDca(scheduleId)
    }

    return null
  }

  if (!swapEvent) return null

  if (isNumber(swapEvent.extrinsicIndex)) {
    return neckwork.activityExtrinsic(
      "swap",
      swapEvent.paraBlockHeight,
      swapEvent.extrinsicIndex,
    )
  }

  return neckwork.event(swapEvent.paraBlockHeight, swapEvent.indexInBlock)
}
