import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"

import type { RowAction } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { isPoolShareReserve } from "@/modules/money-market-v2/reserves"

export type ActionRoute =
  | "addStablepool"
  | "supplyIsolated"
  | "removeMoneyMarket"
  | "form"

/**
 * What an action on a reserve opens: one of the liquidity modals v2 mounts for
 * swap-in supply and pool-share withdraw (ADR-0012), or v2's own form. The
 * modals act through the reserve's aToken, so a reserve whose aToken the
 * registry lacks always takes the form. Isolated reserves withdraw through
 * the form on every market.
 */
export const actionRoute = (
  action: RowAction,
  reserve: Pick<ReserveSummary, "underlyingAsset" | "isIsolated">,
  market: MarketDescriptor,
  hasRelatedAToken: boolean,
): ActionRoute => {
  if (!hasRelatedAToken) return "form"

  const isPoolShare = isPoolShareReserve(reserve.underlyingAsset, market)

  if (action === "supply") {
    if (isPoolShare) return "addStablepool"
    if (reserve.isIsolated && market.market === "hydration_v3")
      return "supplyIsolated"
  }

  if (action === "withdraw" && isPoolShare) return "removeMoneyMarket"

  return "form"
}
