import {
  INTENT_KINDS,
  INTENT_OPEN_STATUSES,
  intentsQuery,
} from "@galacticcouncil/indexer/neckwork"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { neckworkClient } from "@/api/neckwork"
import {
  enrichIntentOrders,
  IntentFillTotals,
} from "@/modules/trade/orders/lib/buildOrderRows"
import { OrderData } from "@/modules/trade/orders/lib/orderData"

const PAGE_SIZE = 100

/**
 * The neckwork counterpart of `lib/useIntentFillEnrichment` (which stays as the
 * fork path's version, reading lark). Chain state remains the source of the
 * open-intent list; this only tops up the cumulative figures chain cannot keep.
 *
 * All the folding lives in `enrichIntentOrders` — the hook only fetches, so the
 * two sources cannot drift apart in how they apply a fill.
 */
export const useIntentEnrichment = (orders: Array<OrderData>) => {
  const { account } = useAccount()
  const owner = safeConvertSS58toPublicKey(account?.address ?? "")

  // no polling here - useNeckworkSync invalidates the account subtree once the
  // indexer catches up with the user's latest tx
  const { data, refetch } = useQuery(
    intentsQuery(neckworkClient, {
      owner,
      statuses: INTENT_OPEN_STATUSES,
      kinds: INTENT_KINDS,
      assetIds: [],
      page: 0,
      pageSize: PAGE_SIZE,
    }),
  )

  const totals = useMemo(
    () =>
      new Map<string, IntentFillTotals>(
        (data?.items ?? []).map((intent) => [
          intent.intentId,
          {
            amountIn: BigInt(intent.filledAmountIn),
            amountOut: BigInt(intent.filledAmountOut),
          },
        ]),
      ),
    [data],
  )

  const enriched = useMemo(
    () => enrichIntentOrders(orders, totals),
    [orders, totals],
  )

  return { orders: enriched, refetch }
}
