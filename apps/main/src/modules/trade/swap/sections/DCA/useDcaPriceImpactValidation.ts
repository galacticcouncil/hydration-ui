import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"

import { TimeFrame } from "@/components/TimeFrame/TimeFrame.utils"
import {
  getAbsoluteMaxDcaOrders,
  MIN_DCA_ORDERS,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useTradeSettings } from "@/states/tradeSettings"

const PRICE_IMPACT_WARNING_THRESHOLD = -0.1

export enum DcaValidationError {
  PriceImpact = "PriceImpact",
  MinOrderBudget = "MinOrderBudget",
}

export enum DcaValidationWarning {
  PriceImpact = "PriceImpact",
}

export const useDcaPriceImpactValidation = (
  order: TradeDcaOrder | undefined,
  duration: TimeFrame,
): {
  readonly warnings: ReadonlyArray<DcaValidationWarning>
  readonly errors: ReadonlyArray<DcaValidationError>
} => {
  const {
    dca: { slippage },
  } = useTradeSettings()

  if (!order) {
    return { warnings: [], errors: [] }
  }

  const priceImpact = order.tradeImpactPct

  const warnings: Array<DcaValidationWarning> = []
  const errors: Array<DcaValidationError> = []

  if (priceImpact < -slippage) {
    errors.push(DcaValidationError.PriceImpact)
  } else if (priceImpact < PRICE_IMPACT_WARNING_THRESHOLD) {
    warnings.push(DcaValidationWarning.PriceImpact)
  }

  const maxOrders = getAbsoluteMaxDcaOrders(duration)

  if (
    order &&
    order.tradeCount <= maxOrders &&
    order.tradeCount > Math.max(order.maxTradeCount, MIN_DCA_ORDERS)
  ) {
    errors.push(DcaValidationError.MinOrderBudget)
  }

  return { warnings, errors }
}
