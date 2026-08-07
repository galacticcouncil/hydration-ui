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
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

export const PORTFOLIO_CHAINS = [
  "ethereum",
  "base",
  "solana",
  "sui",
  "assethub",
  "bifrost",
] as const

/**
 * Chains shown for a tracked (watch-only) wallet.
 *
 * Unlike the connected account, a tracked wallet has no richer Hydration data
 * path here — so `hydration` is included and its plain token balances come from
 * the same chain-agnostic balance service as every other chain.
 */
export const TRACKED_CHAINS = [
  HYDRATION_CHAIN_KEY,
  ...PORTFOLIO_CHAINS,
] as const
