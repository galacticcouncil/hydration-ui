import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { bestSellQuery } from "@/api/trade"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

// Beyond these the AMM quote isn't a genuine alternative (no real pool → dust
// quote), so there's "no good data to compare" → show N/A rather than a
// misleading %.
const MAX_VIABLE_PRICE_IMPACT_PCT = 50
const MAX_PLAUSIBLE_DIFF_PCT = 100

export type FulfillmentResult = {
  /**
   * Signed % of how the OTC fill compares to executing the same (remaining)
   * size on the AMM, incl. price impact + swap fee. Positive = the order is
   * a premium (worse than the AMM); negative = a discount (better).
   * `null` = no good data to compare (no route / unviable quote).
   */
  readonly pct: number | null
  readonly isLoading: boolean
}

/**
 * For each offer, quotes the AMM (router getBestSell) at the order's REMAINING
 * size (`assetAmountIn`/`assetAmountOut` already track what's left to fill) and
 * compares it to the OTC fill net of the OTC fee. This is the real
 * "fill OTC vs swap on the AMM" comparison, accounting for slippage + fees.
 */
export const useOtcFulfillmentPercentages = (
  offers: readonly OtcOffer[],
  feePct: string,
): Map<string, FulfillmentResult> => {
  const rpc = useRpcProvider()

  const results = useQueries({
    queries: offers.map((offer) =>
      bestSellQuery(rpc, {
        assetIn: offer.assetIn.id,
        assetOut: offer.assetOut.id,
        amountIn: offer.assetAmountIn,
      }),
    ),
  })

  return useMemo(() => {
    const map = new Map<string, FulfillmentResult>()
    const feeMultiplier = Big(1).minus(feePct || 0)

    offers.forEach((offer, i) => {
      const result = results[i]
      if (!offer.id || !result) return

      const swap = result.data
      let pct: number | null = null

      if (swap) {
        const omnipoolReceive = Big(
          scaleHuman(swap.amountOut.toString(), offer.assetOut.decimals),
        )
        const otcReceiveNet = Big(offer.assetAmountOut).times(feeMultiplier)

        if (omnipoolReceive.gt(0) && otcReceiveNet.gt(0)) {
          const signed = omnipoolReceive
            .div(otcReceiveNet)
            .minus(1)
            .times(100)
            .toNumber()

          const viable =
            Number.isFinite(swap.priceImpactPct) &&
            Math.abs(swap.priceImpactPct) <= MAX_VIABLE_PRICE_IMPACT_PCT &&
            Math.abs(signed) <= MAX_PLAUSIBLE_DIFF_PCT

          pct = viable ? signed : null
        }
      }

      map.set(offer.id, { pct, isLoading: result.isLoading })
    })

    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, feePct, results.map((r) => r.dataUpdatedAt).join()])
}
