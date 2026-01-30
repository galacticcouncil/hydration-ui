import { ThemeToken } from "@galacticcouncil/ui/theme"
import { t } from "i18next"

import { TimeRange } from "@/api/stats"

export const getTotalValueLabel = (timeRange: TimeRange) => {
  switch (timeRange) {
    case "1W":
      return t("stats:fees.chart.timeRange.description.1W")
    case "1M":
      return t("stats:fees.chart.timeRange.description.1M")
    case "1Y":
      return t("stats:fees.chart.timeRange.description.1Y")

    default:
      return t("stats:fees.chart.timeRange.description.ALL")
  }
}

export const feesAndRevenueColorConfig = {
  networkFees: "colors.basePalette.lavender",
  tradingFees: "secondaryColors.blues.vibrantBlue",
  liquidityFees: "accents.success.primary",
  supplyBorrowFees: "accents.alertAlt.primary",
  hollarFees: "secondaryColors.blues.blueViolet",

  // Trading breakdown
  omnipoolAssetFee: "secondaryColors.blues.vibrantBlue",
  omnipoolProtocolFee: "text.tint.secondary",
  stablepools: "accents.alertAlt.primary",
  xykTradeFee: "accents.success.primary",

  // Liquidity breakdown
  omnipoolWithdrawFee: "secondaryColors.blues.lightBlue",
  isolatedPoolTradeFee: "secondaryColors.blues.blueViolet",

  // Supply & Borrow breakdown
  liquidationPenalty: "accents.danger.emphasis",
  pepl: "accents.alertAlt.primary",
  assetReserve: "accents.success.primary",

  // Stacked summary
  swap: "secondaryColors.blues.vibrantBlue",
  liquidations: "accents.danger.emphasis",
  tips: "accents.alertAlt.primary",
  txFees: "secondaryColors.blues.blueViolet",
  hollar: "secondaryColors.greens.hollarGreen",

  // Destinations
  treasury: "secondaryColors.pink.coralPink",
  lps: "secondaryColors.greens.brightGreen",
  burned: "accents.danger.emphasis",
  stakers: "secondaryColors.blues.blueViolet",
  users: "text.tint.secondary",
  protocol: "secondaryColors.blues.deepBlue",
  referrersAndStakers: "accents.alertAlt.primary",
} as const

export const feesAndRevenueConfig: Record<
  string,
  { label: string; color: ThemeToken }
> = {
  asset: {
    label: t("stats:fees.config.asset"),
    color: feesAndRevenueColorConfig.omnipoolAssetFee,
  },
  protocol: {
    label: t("stats:fees.config.protocol"),
    color: feesAndRevenueColorConfig.omnipoolProtocolFee,
  },
  liquidationPenalty: {
    label: t("stats:fees.config.liquidationPenalty"),
    color: feesAndRevenueColorConfig.liquidationPenalty,
  },
  peplLiquidationProfit: {
    label: t("stats:fees.config.peplLiquidationProfit"),
    color: feesAndRevenueColorConfig.pepl,
  },
  assetReserve: {
    label: t("stats:fees.config.assetReserve"),
    color: feesAndRevenueColorConfig.assetReserve,
  },
  borrowApr: {
    label: t("stats:fees.config.borrowApr"),
    color: feesAndRevenueColorConfig.hollar,
  },
  hsmRevenue: {
    label: t("stats:fees.config.hsmRevenue"),
    color: feesAndRevenueColorConfig.hollarFees,
  },
}

export const formatXAxisTick = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
