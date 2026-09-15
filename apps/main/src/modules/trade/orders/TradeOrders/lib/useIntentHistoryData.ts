import { INTENT_KINDS, intentsQuery } from "@galacticcouncil/indexer/neckwork"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { neckworkClient } from "@/api/neckwork"
import { toApiIntentStatuses } from "@/modules/trade/orders/lib/apiVocabulary"
import { toOrderStatusFromIntent } from "@/modules/trade/orders/lib/apiVocabulary"
import { neckworkIntentToOrder } from "@/modules/trade/orders/lib/buildOrderRows"
import {
  DCA_HISTORY_ORDER_STATUSES,
  OrderData,
} from "@/modules/trade/orders/lib/orderData"
import { useNeckworkTradeQueriesEnabled } from "@/modules/trade/swap/tradeDataSource"
import { useAssets } from "@/providers/assetsProvider"

/**
 * The Intents half of Order History. Sibling of `useHistoryData`, deliberately
 * not merged with it: each endpoint pages over its own whole set, and the
 * toggle shows one at a time. See wayfinder ticket 03.
 */
export const useIntentHistoryData = (
  assetIds: Array<string>,
  page: number,
  pageSize: number,
  enabled = true,
) => {
  const { account } = useAccount()
  const owner = safeConvertSS58toPublicKey(account?.address ?? "")
  const neckworkEnabled = useNeckworkTradeQueriesEnabled()

  const { data, isLoading } = useQuery({
    ...intentsQuery(neckworkClient, {
      owner,
      statuses: toApiIntentStatuses(DCA_HISTORY_ORDER_STATUSES),
      kinds: INTENT_KINDS,
      assetIds,
      page,
      pageSize,
    }),
    enabled: enabled && neckworkEnabled && !!owner,
    placeholderData: keepPreviousData,
  })

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.totalCount ?? 0
  const orders = useMemo<Array<OrderData>>(
    () =>
      data?.items
        .map((intent) =>
          neckworkIntentToOrder(
            intent,
            toOrderStatusFromIntent(intent.status),
            getAssetWithFallback,
          ),
        )
        .filter(isNonNullish) ?? [],
    [data, getAssetWithFallback],
  )

  return { orders, totalCount, isLoading }
}
