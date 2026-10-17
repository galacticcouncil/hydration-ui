import {
  moneyMarketKeys,
  useMoneyMarket,
} from "@galacticcouncil/money-market-v2/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const POST_TX_REFRESH_DELAYS = [2000, 4000, 6000]

type RefreshMarketOptions = {
  /** Skip the immediate invalidation when the caller's flow already did it. */
  delayedOnly?: boolean
}

/**
 * Refreshes the selected market's reads after a transaction: once now and
 * again after each delay, since the chain state the reads see can lag the
 * transaction. Shared by v2's own actions and the liquidity modals v2 mounts,
 * which invalidate no v2 read themselves (ADR-0012).
 */
export const useRefreshMarket = () => {
  const { market } = useMoneyMarket()
  const queryClient = useQueryClient()
  const marketName = market.market

  return useCallback(
    ({ delayedOnly = false }: RefreshMarketOptions = {}) => {
      const invalidate = () =>
        queryClient.invalidateQueries({
          queryKey: moneyMarketKeys.market(marketName),
        })

      if (!delayedOnly) void invalidate()

      for (const delay of POST_TX_REFRESH_DELAYS) {
        setTimeout(invalidate, delay)
      }
    },
    [queryClient, marketName],
  )
}
