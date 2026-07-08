import { ThemeProps } from "@galacticcouncil/ui/theme"

export const getFeeColors = (theme: ThemeProps) => ({
  // High-level groups
  networkFees: theme.colors.basePalette.lavender,
  tradingFees: theme.secondaryColors.blues.vibrantBlue,
  liquidityFees: theme.accents.success.primary,
  supplyBorrowFees: theme.accents.alertAlt.primary,
  hollarFees: theme.secondaryColors.blues.blueViolet,

  // Trading breakdown
  omnipoolAssetFee: theme.secondaryColors.blues.vibrantBlue,
  omnipoolProtocolFee: theme.secondaryColors.blues.vibrantBlue,
  stablepools: theme.accents.alertAlt.primary,
  xykTradeFee: theme.accents.success.primary,

  // Liquidity breakdown
  omnipoolWithdrawFee: theme.secondaryColors.blues.lightBlue,
  isolatedPoolTradeFee: theme.secondaryColors.blues.blueViolet,

  // Supply & Borrow breakdown
  liquidationPenalty: theme.accents.danger.emphasis,
  pepl: theme.accents.alertAlt.primary,
  assetReserve: theme.accents.success.primary,

  // Stacked summary
  swap: theme.secondaryColors.blues.vibrantBlue,
  liquidations: theme.accents.danger.emphasis,
  tips: theme.accents.alertAlt.primary,
  txFees: theme.secondaryColors.blues.blueViolet,
  hollar: theme.secondaryColors.greens.hollarGreen,

  // Destinations
  treasury: theme.secondaryColors.pink.coralPink,
  lps: theme.secondaryColors.greens.brightGreen,
  burned: theme.accents.danger.emphasis,
  stakers: theme.secondaryColors.blues.blueViolet,
  users: theme.text.tint.secondary,
  protocol: theme.secondaryColors.blues.deepBlue,
  referrersAndStakers: theme.accents.alertAlt.primary,
})

/**
 * TVL chart colors.
 *
 * NOTE: Kept in this module intentionally so "stats chart colors" stay centralized.
 * (This file historically started as fee colors, but it's now the shared palette source.)
 */
export const getTvlColors = (theme: ThemeProps) => ({
  omnipool: theme.secondaryColors.blues.vibrantBlue,
  stablePools: theme.accents.success.primary,
  xykPools: theme.accents.alertAlt.primary,
  moneyMarket: theme.secondaryColors.blues.blueViolet,
})
