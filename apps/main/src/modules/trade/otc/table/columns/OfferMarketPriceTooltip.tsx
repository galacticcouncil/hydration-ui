import { Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
}

/**
 * Tooltip body for the "vs. Market" cell (taker view). The headline % already
 * is the AMM-fulfillment comparison (computed at table level), so this just
 * explains it in words and adds the market rate for context.
 */
export const OfferMarketPriceTooltip: FC<Props> = ({ offer }) => {
  const { t } = useTranslation(["trade", "common"])

  const percentage = offer.marketPricePercentage ?? 0
  const isBelow = percentage < 0

  const text = t(
    isBelow
      ? "otc.marketPrice.tooltip.discount"
      : "otc.marketPrice.tooltip.premium",
    {
      percentage: t("common:percent.compact", { value: Math.abs(percentage) }),
      marketNative: t("common:number", { value: offer.nativeMarketPrice }),
      assetIn: offer.assetIn.symbol,
      assetOut: offer.assetOut.symbol,
      marketUsd: t("common:currency", {
        value: offer.marketPrice,
        maximumFractionDigits: null,
      }),
    },
  )

  return (
    <Text fw={500} fs="p5" sx={{ maxWidth: 260 }}>
      {text}
    </Text>
  )
}
