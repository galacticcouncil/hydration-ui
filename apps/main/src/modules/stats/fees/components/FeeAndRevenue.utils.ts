import { ThemeToken } from "@galacticcouncil/ui/theme"
import { t } from "i18next"

import { TimeRange } from "@/api/stats"

export const getTotalValueLabel = (timeRange: TimeRange) => {
  switch (timeRange) {
    case "1W":
      return "Last 7 days"
    case "1M":
      return "Last 30 days"
    case "1Y":
      return "Last year"

    default:
      return "All time"
  }
}

export const feesAndRevenueConfig: Record<
  string,
  { label: string; color: ThemeToken }
> = {
  asset: {
    label: t("stats:fees.config.asset"),
    color: "accents.alertAlt.primary",
  },
  protocol: {
    label: t("stats:fees.config.protocol"),
    color: "accents.success.primary",
  },
  liquidationPenalty: {
    label: t("stats:fees.config.liquidationPenalty"),
    color: "text.tint.secondary",
  },
  peplLiquidationProfit: {
    label: t("stats:fees.config.peplLiquidationProfit"),
    color: "secondaryColors.greens.hollarGreen",
  },
  assetReserve: {
    label: t("stats:fees.config.assetReserve"),
    color: "accents.info.primary",
  },
  borrowApr: {
    label: t("stats:fees.config.borrowApr"),
    color: "secondaryColors.blues.vibrantBlue",
  },
  hsmRevenue: {
    label: t("stats:fees.config.hsmRevenue"),
    color: "accents.alertAlt.primary",
  },
}

export const formatXAxisTick = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
