import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useTranslation } from "react-i18next"

import { MIN_DCA_ORDERS } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useTradeSettings } from "@/states/tradeSettings"

const PRICE_IMPACT_WARNING_THRESHOLD = 0.1

export const useDcaPriceImpactValidation = (
  order: TradeDcaOrder | undefined,
) => {
  const { t } = useTranslation(["common", "trade"])

  const {
    dca: { slippage },
  } = useTradeSettings()

  const priceImpact = order?.tradeImpactPct ?? 0
  const priceImpactDisplay = t("percent", { value: priceImpact })

  let priceImpactLossMessage: string | undefined = undefined
  const errors: Array<string> = []

  if (Math.abs(priceImpact) > slippage) {
    errors.push(
      t("trade:dca.errors.priceImpact", { percentage: priceImpactDisplay }),
    )
  } else if (Math.abs(priceImpact) > PRICE_IMPACT_WARNING_THRESHOLD) {
    priceImpactLossMessage = t("trade:dca.warnings.priceImpact", {
      percentage: priceImpactDisplay,
    })
  }

  if (
    order &&
    order.tradeCount > Math.max(order.maxTradeCount, MIN_DCA_ORDERS)
  ) {
    errors.push(t("trade:dca.errors.maxOrders"))
  }

  return { priceImpactLossMessage, errors }
}
