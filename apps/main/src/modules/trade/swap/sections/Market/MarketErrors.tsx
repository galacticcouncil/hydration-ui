import { Alert } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SelectedTradeOption } from "@/modules/trade/swap/sections/Market/Market"

type Props = {
  readonly selectedTradeOption: SelectedTradeOption | null
}

export const MarketErrors: FC<Props> = ({ selectedTradeOption }) => {
  const { t } = useTranslation("trade")

  if (selectedTradeOption?.type !== "swap") {
    return null
  }

  const errors = selectedTradeOption?.swap?.swaps.flatMap((swap) => swap.errors)
  const error = errors?.[0]

  if (!error) {
    return null
  }

  const message = ((): string => {
    switch (error) {
      case "InsufficientTradingAmount":
        return t("market.error.insufficientTradingAmount")
      case "MaxOutRatioExceeded":
        return t("market.error.maxOutRatioExceeded")
      case "MaxInRatioExceeded":
        return t("market.error.maxInRatioExceeded")
      case "TradeNotAllowed":
        return t("market.error.tradeNotAllowed")
      default:
        return error
    }
  })()

  return <Alert variant="error" description={message} />
}
