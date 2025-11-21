import { SummaryRowValue } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"

type Props = {
  readonly priceImpact: number
}

export const PriceImpactSummaryRow: FC<Props> = ({ priceImpact }) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <SwapSummaryRow
      label={t("trade:market.summary.priceImpact")}
      content={
        <SummaryRowValue
          fw={500}
          fs="p4"
          lh={1.2}
          color={
            priceImpact <= -1 ? getToken("alarmRed.400") : getToken("text.high")
          }
        >
          {t("percent", { value: priceImpact })}
        </SummaryRowValue>
      }
      tooltip={t("trade:market.summary.priceImpact.tooltip")}
    />
  )
}
