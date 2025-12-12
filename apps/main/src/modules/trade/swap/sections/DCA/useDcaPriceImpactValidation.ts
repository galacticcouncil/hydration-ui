import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"

import { MIN_DCA_ORDERS } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useTradeSettings } from "@/states/tradeSettings"

const PRICE_IMPACT_WARNING_THRESHOLD = 0.1

export enum DcaValidationError {
  PriceImpact = "PriceImpact",
  MaxOrders = "MaxOrders",
}

export enum DcaValidationWarning {
  PriceImpact = "PriceImpact",
}

export const useDcaPriceImpactValidation = (
  order: TradeDcaOrder | undefined,
): {
  readonly warnings: ReadonlyArray<DcaValidationWarning>
  readonly errors: ReadonlyArray<DcaValidationError>
} => {
  const {
    dca: { slippage },
  } = useTradeSettings()

  const priceImpact = order?.tradeImpactPct ?? 0

  const warnings: Array<DcaValidationWarning> = []
  const errors: Array<DcaValidationError> = []

  if (Math.abs(priceImpact) > slippage) {
    errors.push(DcaValidationError.PriceImpact)
  } else if (Math.abs(priceImpact) > PRICE_IMPACT_WARNING_THRESHOLD) {
    warnings.push(DcaValidationWarning.PriceImpact)
  }

  if (
    order &&
    order.tradeCount > Math.max(order.maxTradeCount, MIN_DCA_ORDERS)
  ) {
    errors.push(DcaValidationError.MaxOrders)
  }

  return { warnings, errors }
}
