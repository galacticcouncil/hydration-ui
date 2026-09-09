import type { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"

/**
 * On-chain quotes carry router/scheduler errors that must block submit, the way
 * Market gates on them. Cross-chain errors surface through useXcSwapAlerts.
 */
export const isXcSwapTradeEnabled = (
  quote: XcSwapQuote,
  isSingleTrade: boolean,
): boolean => {
  if (!quote) {
    return false
  }

  if (quote.kind !== "oc") {
    return true
  }

  return isSingleTrade
    ? !quote.swap.swaps.flatMap((swap) => swap.errors).length
    : !!quote.twap && !quote.twap.errors.length
}
