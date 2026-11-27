import { XcScanTradeStatus } from "@/api/xcIntents"

export type XcTwapStatus =
  | "active"
  | "waitingFirstOrder"
  | "payingOut"
  | "cancelling"
  | "completed"
  | "refunded"
  | "expired"
  | "unavailable"

export type XcTwapScanState = XcScanTradeStatus | "notIndexed" | "failed"

type Input = {
  readonly scanStatus: XcTwapScanState
  /** The ICE intent is still on chain */
  readonly intentLive: boolean
  /** Scan `held`, destination units; null when unreadable (NEAR) */
  readonly held: string | null | undefined
}

/**
 * An xc TWAP's status label. "unavailable" means the row keeps its
 * chain / neckwork status and says the payout details are unavailable.
 */
export const getXcTwapStatus = ({
  scanStatus,
  intentLive,
  held,
}: Input): XcTwapStatus => {
  switch (scanStatus) {
    case "notIndexed":
      return intentLive ? "waitingFirstOrder" : "unavailable"
    case "pending":
      if (intentLive) return "active"
      // Pending with nothing held and no intent is scan lag, so fall back
      return BigInt(held ?? 0) > 0n ? "payingOut" : "unavailable"
    case "closing":
      return "cancelling"
    case "completed":
    case "refunded":
    case "expired":
      return scanStatus
    case "failed":
      return "unavailable"
  }
}
