import { INTENT_KINDS, intentsQuery } from "@galacticcouncil/indexer/neckwork"
import {
  isH160Address,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { neckworkClient } from "@/api/neckwork"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcTwapOwnerOrdersQuery, xcTwapTradeQuery } from "@/api/xcIntents"
import { XcScanTradeDetail } from "@/api/xcIntents"
import { toApiIntentStatuses } from "@/modules/trade/orders/lib/apiVocabulary"
import { toOrderStatusFromIntent } from "@/modules/trade/orders/lib/apiVocabulary"
import {
  neckworkIntentToOrder,
  withXcTwapTrade,
} from "@/modules/trade/orders/lib/buildOrderRows"
import {
  DCA_HISTORY_ORDER_STATUSES,
  OrderData,
} from "@/modules/trade/orders/lib/orderData"
import { useXcDestinationLookup } from "@/modules/trade/orders/lib/useIntentOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useNeckworkEnabled } from "@/states/neckwork"

const toTradesByAuthPath = (
  results: ReadonlyArray<{ data?: XcScanTradeDetail | null }>,
) =>
  new Map(
    results.flatMap(({ data }) =>
      data ? [[data.trade.auth_path, data.trade] as const] : [],
    ),
  )

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
  const neckworkEnabled = useNeckworkEnabled()

  const { data, isLoading, isLoadingError } = useQuery({
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

  // xc TWAPs are relabelled from scan; only EVM owners can have them
  const xcOwner = isH160Address(account?.rawAddress) ? account.rawAddress : ""
  const { data: xcAuthPaths } = useQuery({
    ...xcTwapOwnerOrdersQuery(xcOwner),
    enabled: enabled && !!xcOwner,
  })

  const xcClient = useXcIntentsClient()
  const xcTrades = useQueries({
    queries: (data?.items ?? []).flatMap((intent) => {
      const authPath = xcAuthPaths?.get(intent.intentId)
      return authPath && intent.kind !== "swap"
        ? [xcTwapTradeQuery(xcClient, authPath)]
        : []
    }),
    combine: toTradesByAuthPath,
  })
  const getXcDestination = useXcDestinationLookup(xcTrades.size > 0)

  const totalCount = data?.totalCount ?? 0
  const orders = useMemo<Array<OrderData>>(
    () =>
      data?.items
        .map((intent) => {
          const order = neckworkIntentToOrder(
            intent,
            toOrderStatusFromIntent(intent.status),
            getAssetWithFallback,
          )
          const authPath = xcAuthPaths?.get(intent.intentId)
          const trade = authPath ? xcTrades.get(authPath) : undefined

          return order && withXcTwapTrade(order, trade, getXcDestination)
        })
        .filter(isNonNullish) ?? [],
    [data, getAssetWithFallback, xcAuthPaths, xcTrades, getXcDestination],
  )

  return {
    orders,
    totalCount,
    isLoading,
    isError: isLoadingError || (!neckworkEnabled && !data),
  }
}
