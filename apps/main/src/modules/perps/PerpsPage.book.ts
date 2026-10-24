import { getSubscriptionClient } from "@galacticcouncil/hyperliquid/subscriptions"
import { useEffect, useState } from "react"

import { HYPERLIQUID } from "@/config/hyperliquid"

export type BookLevel = {
  px: string
  sz: string
  n: number
}

export type OrderBook = {
  bids: BookLevel[]
  asks: BookLevel[]
}

/**
 * Live L2 book over the shared socket, at the default cadence — 20 levels,
 * roughly every 2s. The `fast` option trades depth for rate (5 levels every
 * 0.5s), which is the wrong trade for a book panel.
 */
export const useOrderBook = (coin: string) => {
  const [book, setBook] = useState<OrderBook | null>(null)

  useEffect(() => {
    setBook(null)

    let cancelled = false
    let sub: { unsubscribe: () => Promise<void> } | undefined

    getSubscriptionClient(HYPERLIQUID.isTestnet)
      .l2Book({ coin }, ({ levels }) =>
        setBook({ bids: levels[0] ?? [], asks: levels[1] ?? [] }),
      )
      .then((subscription) => {
        // The effect may have been torn down while subscribing.
        if (cancelled) subscription.unsubscribe()
        else sub = subscription
      })
      .catch(() => setBook(null))

    return () => {
      cancelled = true
      sub?.unsubscribe()
    }
  }, [coin])

  return book
}
