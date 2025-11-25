import { Skeleton, Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TradeType } from "@/api/trade"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly type: TradeType
}

export const MarketSummarySkeleton: FC<Props> = ({ type }) => {
  const { t } = useTranslation("trade")
  const isSell = type === TradeType.Sell

  return (
    <Summary
      sx={{ my: 4 }}
      separator={<SwapSectionSeparator />}
      withLeadingSeparator
    >
      <SwapSummaryRow
        label={
          isSell ? t("market.summary.minReceived") : t("market.summary.maxSent")
        }
        content={<Skeleton sx={{ width: 150 }} />}
        tooltip={
          isSell
            ? t("market.summary.minReceived.tooltip")
            : t("market.summary.maxSent.tooltip")
        }
      />
      <SwapSummaryRow
        label={t("market.summary.priceImpact")}
        content={<Skeleton sx={{ width: 150 }} />}
        tooltip={t("market.summary.priceImpact.tooltip")}
      />
      <SwapSummaryRow
        label={t("market.summary.estTradeFees")}
        content={<Skeleton sx={{ width: 150 }} />}
        tooltip={t("market.summary.estTradeFees.tooltip")}
      />
      <SwapSummaryRow
        label={t("market.summary.transactionCosts")}
        content={<Skeleton sx={{ width: 150 }} />}
        tooltip={t("market.summary.transactionCosts.tooltip")}
      />
      <SwapSummaryRow
        label={t("market.summary.routes.label")}
        content={<Skeleton sx={{ width: 150, height: 24 }} />}
      />
    </Summary>
  )
}
