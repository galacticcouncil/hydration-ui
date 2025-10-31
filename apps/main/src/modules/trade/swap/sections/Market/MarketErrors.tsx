import { Alert } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Trade } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"

type Props = {
  readonly swap: Trade
}

export const MarketErrors: FC<Props> = ({ swap }) => {
  const { t } = useTranslation("trade")

  const { watch } = useFormContext<MarketFormValues>()
  const isSingleTrade = watch("isSingleTrade")

  if (!isSingleTrade) {
    return null
  }

  const errors = swap?.swaps.flatMap((swap) => swap.errors)
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

  return <Alert sx={{ mt: 8 }} variant="error" description={message} />
}
