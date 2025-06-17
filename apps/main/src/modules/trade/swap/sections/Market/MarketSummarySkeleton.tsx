import { Skeleton, Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TradeRoutesSkeleton } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutesSkeleton"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const MarketSummarySkeleton: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <div>
      <Summary
        separator={<SwapSectionSeparator />}
        withTrailingSeparator
        rows={[
          {
            label: t("market.summary.priceImpact"),
            content: <Skeleton sx={{ width: 150, marginLeft: "auto" }} />,
          },
          {
            label: t("market.summary.estTradeFees"),
            content: <Skeleton sx={{ width: 150, marginLeft: "auto" }} />,
          },
          {
            label: t("market.summary.minReceived"),
            content: <Skeleton sx={{ width: 150, marginLeft: "auto" }} />,
          },
        ]}
      />
      <TradeRoutesSkeleton />
    </div>
  )
}
