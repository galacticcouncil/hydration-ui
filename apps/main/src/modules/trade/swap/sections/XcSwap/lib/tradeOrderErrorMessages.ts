import { TFunction } from "i18next"

import { TradeOrder, TradeOrderError } from "@/api/trade"

export const getTradeOrderErrorMessage = (
  error: TradeOrder["errors"][number],
  t: TFunction<"trade">,
): string => {
  switch (error) {
    case TradeOrderError.OrderTooSmall:
      return t("market.form.type.split.error.orderTooSmall")
    case TradeOrderError.OrderTooBig:
      return t("market.form.type.split.error.orderTooBig")
    case TradeOrderError.OrderImpactTooBig:
      return t("market.form.type.split.error.orderImpactTooBig")
    default:
      return error
  }
}
