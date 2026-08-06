/**
 * Chains shown in the multichain portfolio, in display order.
 *
 * `hydration` is deliberately absent — the wallet page already renders it from
 * its own richer data path (registry metadata, prices, farms), which the
 * chain-agnostic balance service does not reproduce.
 *
 * Adding a substrate chain here opens a WS connection that stays up for the
 * whole session — weigh that before extending the list.
 */
export const PORTFOLIO_CHAINS = [
  "ethereum",
  "base",
  "solana",
  "sui",
  "assethub",
  "bifrost",
] as const
