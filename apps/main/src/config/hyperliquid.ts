import { ENV } from "@/config/env"

/**
 * Builder code configuration. The fee we charge is deliberately lower than the
 * ceiling the user approves, so the rate can be tuned later without asking
 * every user to sign a new approval.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes
 */
export const HYPERLIQUID = {
  isTestnet: ENV.VITE_HL_TESTNET,
  /** Address that collects the builder fee on fills we route. */
  builder: ENV.VITE_HL_BUILDER_ADDR,
  /** Charged per order action, in tenths of a basis point (30 = 0.03%). */
  fee: ENV.VITE_HL_BUILDER_FEE,
  /** Ceiling approved once by the user, in tenths of a basis point. */
  maxFee: ENV.VITE_HL_BUILDER_MAX_FEE,
} as const
