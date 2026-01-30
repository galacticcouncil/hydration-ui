// Fee flow data based on the documentation

import { ThemeToken } from "@galacticcouncil/ui/theme"
import { t } from "i18next"

import { feesAndRevenueColorConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"

// Nodes: 0-5 are sources, 6-10 are destinations
export const SANKEY_DATA = {
  nodes: [
    // Sources (index 0-5)
    { name: t("stats:fees.sankey.nodes.networkFees") }, // 0
    { name: t("stats:fees.sankey.nodes.omnipoolAssetFee") }, // 1
    { name: t("stats:fees.sankey.nodes.omnipoolProtocolFee") }, // 2
    { name: t("stats:fees.sankey.nodes.withdrawalFee") }, // 3
    { name: t("stats:fees.sankey.nodes.xykTradeFee") }, // 4
    { name: t("stats:fees.sankey.nodes.hsmRevenue") }, // 5
    // Destinations (index 6-10)
    { name: t("stats:fees.sankey.nodes.treasury") }, // 6
    { name: t("stats:fees.sankey.nodes.lps") }, // 7
    { name: t("stats:fees.sankey.nodes.referrersAndStakers") }, // 8
    { name: t("stats:fees.sankey.nodes.burned") }, // 9
    { name: t("stats:fees.sankey.nodes.protocol") }, // 10
  ],
  links: [
    // Network Fees → Treasury
    { source: 0, target: 6, value: 100 },

    // Omnipool Asset Fee → 50% LPs, 50% Referrers
    { source: 1, target: 7, value: 50 },
    { source: 1, target: 8, value: 50 },

    // Omnipool Protocol Fee → 50% Burned, 50% Treasury
    { source: 2, target: 9, value: 50 },
    { source: 2, target: 6, value: 50 },

    // Withdrawal Fee → LPs
    { source: 3, target: 7, value: 100 },

    // XYK Trade Fee → LPs
    { source: 4, target: 7, value: 100 },

    // HSM Revenue → Protocol
    { source: 5, target: 10, value: 100 },
  ],
}

export const getFeeFlowColors: Record<string, ThemeToken> = {
  // Sources (left side)
  "Network Fees": feesAndRevenueColorConfig.networkFees,
  "Omnipool Asset Fee": feesAndRevenueColorConfig.omnipoolAssetFee,
  "Omnipool Protocol Fee": feesAndRevenueColorConfig.omnipoolProtocolFee,
  "Withdrawal Fee": feesAndRevenueColorConfig.omnipoolWithdrawFee,
  "XYK Trade Fee": feesAndRevenueColorConfig.xykTradeFee,
  "HSM Revenue": feesAndRevenueColorConfig.hollarFees,
  // Destinations (right side)
  Treasury: feesAndRevenueColorConfig.treasury,
  LPs: feesAndRevenueColorConfig.lps,
  "Referrers & Stakers": feesAndRevenueColorConfig.referrersAndStakers,
  Burned: feesAndRevenueColorConfig.burned,
  Protocol: feesAndRevenueColorConfig.protocol,
}

// Custom node component
export const splitFeeFlowLabel = (label: string, isMobile: boolean) => {
  if (label.startsWith("Omnipool ")) {
    return ["Omnipool", label.replace("Omnipool ", "")]
  }
  if (!isMobile) return [label]
  if (label.includes(" & ")) {
    const [left, right] = label.split(" & ")
    return [left, `& ${right}`]
  }
  const words = label.split(" ").filter(Boolean)
  if (words.length <= 1) return [label]
  return [words.slice(0, -1).join(" "), words[words.length - 1]]
}
