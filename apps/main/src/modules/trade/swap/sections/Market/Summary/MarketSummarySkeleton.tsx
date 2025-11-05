import { Skeleton, Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TradeType } from "@/api/trade"
import { MarketSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryRow"
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
      <MarketSummaryRow
        label={
          isSell ? t("market.summary.minReceived") : t("market.summary.maxSent")
        }
        content={<Skeleton sx={{ width: 150 }} />}
      />
      <MarketSummaryRow
        label={t("market.summary.priceImpact")}
        content={<Skeleton sx={{ width: 150 }} />}
      />
      <MarketSummaryRow
        label={t("market.summary.estTradeFees")}
        content={<Skeleton sx={{ width: 150 }} />}
      />
      <MarketSummaryRow
        label={t("market.summary.transactionCosts")}
        content={<Skeleton sx={{ width: 150 }} />}
      />
      <MarketSummaryRow
        label={t("market.summary.routes.label")}
        content={<Skeleton sx={{ width: 150, height: 24 }} />}
      />
    </Summary>
  )
}
