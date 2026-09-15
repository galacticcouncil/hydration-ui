import {
  IntentEvent,
  intentEventsInfiniteQuery,
} from "@galacticcouncil/indexer/neckwork"
import { neckwork } from "@galacticcouncil/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

// `neckworkClient` is the Hydration Public API (hydration-api.neckwork.net);
// `neckwork` is the explorer url builder (hydration-explorer.neckwork.net).
import { neckworkClient } from "@/api/neckwork"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { toIntentActivitySlug } from "@/modules/trade/orders/lib/apiVocabulary"
import { PastExecutionData } from "@/modules/trade/orders/lib/types"
import { useNeckworkTradeQueriesEnabled } from "@/modules/trade/swap/tradeDataSource"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const MAX_EMPTY_PAGES = 5

/**
 * The three event kinds that moved funds. The other five end or annotate an
 * order without trading: `submitted`, `dca_completed` (its last trade reports
 * its amounts in the solution's transfers, not here), `cancelled`, `expired`
 * and `callback_failed` — all of which report null amounts.
 *
 * ICE emits no per-period failure event, so unlike the schedule list there is
 * no failed row and no synthesised skipped-period row. `callback_failed` is
 * deliberately NOT rendered: it has never occurred on mainnet, so its shape is
 * unverified, and a guessed row is worse than no row.
 */
const FILL_KINDS: ReadonlyArray<IntentEvent["kind"]> = [
  "dca_trade",
  "partially_resolved",
  "resolved",
]

const isFill = (event: IntentEvent) => FILL_KINDS.includes(event.kind)

const hasVisibleRows = (
  page: { items: ReadonlyArray<IntentEvent> } | undefined,
) => !!page?.items.some(isFill)

export const useIntentPastExecutionsData = (intentId: bigint) => {
  const neckworkEnabled = useNeckworkTradeQueriesEnabled()

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...intentEventsInfiniteQuery(neckworkClient, {
        intentId: String(intentId),
      }),
      enabled: neckworkEnabled,
    })

  const { getAssetWithFallback } = useAssets()

  // Only the submission names the pair, so it rides on the envelope and labels
  // every amount in the page.
  const firstPage = data?.pages.at(0)
  const assetIn = getAssetWithFallback(firstPage?.assetIn ?? "")
  const assetOut = getAssetWithFallback(firstPage?.assetOut ?? "")

  const executions = useMemo<Array<PastExecutionData>>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.filter(isFill).map<PastExecutionData>((event) => {
          const slug = toIntentActivitySlug(event.kind)

          return {
            id: `${event.blockHeight}-${event.eventIndex}`,
            status: TransactionStatusVariant.Success,
            amountIn: scaleHuman(event.amountIn || "0", assetIn.decimals),
            amountOut: scaleHuman(event.amountOut || "0", assetOut.decimals),
            timestamp: new Date(event.timestamp),
            link: slug
              ? neckwork.activityEvent(
                  slug,
                  event.blockHeight,
                  event.eventIndex,
                )
              : null,
            errorState: null,
          }
        }),
      ) ?? [],
    [data, assetIn.decimals, assetOut.decimals],
  )

  const onEndReached = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return

    // Non-fill kinds are dropped client-side (the API has no kind filter), so a
    // page can yield no visible rows and the scroll trigger — which only
    // re-fires when the rendered range moves — would never fire again. Same
    // guard as usePastExecutionsData, and bounded the same way.
    let result = await fetchNextPage()
    for (let i = 0; i < MAX_EMPTY_PAGES; i++) {
      if (result.isError || !result.hasNextPage) break
      if (hasVisibleRows(result.data?.pages.at(-1))) break
      result = await fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return { assetIn, assetOut, executions, isLoading, onEndReached }
}
