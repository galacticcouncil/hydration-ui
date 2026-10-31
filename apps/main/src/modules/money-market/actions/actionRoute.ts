import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market/types"

import {
  isPoolShareReserve,
  isSwapInReserve,
} from "@/modules/money-market/reserves/reserves"
import type { RowAction } from "@/modules/money-market/table/cells"

export type ActionRoute =
  | "addStablepool"
  | "supplyIsolated"
  | "removeMoneyMarket"
  | "form"

/**
 * What an action on a reserve opens: one of the liquidity modals the module mounts for
 * swap-in supply and pool-share withdraw, or the module's own form. The
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
    if (isSwapInReserve(reserve, market)) return "supplyIsolated"
  }

  if (action === "withdraw" && isPoolShare) return "removeMoneyMarket"

  return "form"
}
