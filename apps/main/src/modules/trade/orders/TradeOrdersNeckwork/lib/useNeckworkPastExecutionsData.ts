import {
  DcaExecution,
  dcaExecutionsInfiniteQuery,
} from "@galacticcouncil/indexer/neckwork"
import { parseIndexerErrorState } from "@galacticcouncil/indexer/squid/lib/parseIndexerErrorState"
import { neckwork } from "@galacticcouncil/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

// `neckworkClient` is the Hydration Public API (hydration-api.neckwork.net);
// `neckwork` is the explorer url builder (hydration-explorer.neckwork.net).
import { neckworkClient } from "@/api/provider"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { PastExecutionData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const MAX_EMPTY_PAGES = 5

const hasVisibleRows = (
  page: { items: ReadonlyArray<DcaExecution> } | undefined,
) => !!page?.items.some((item) => item.status !== "planned")

const STATUS_MAP: Record<DcaExecution["status"], TransactionStatusVariant> = {
  executed: TransactionStatusVariant.Success,
  failed: TransactionStatusVariant.Error,
  planned: TransactionStatusVariant.Pending,
}

export const useNeckworkPastExecutionsData = (scheduleId: number) => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery(dcaExecutionsInfiniteQuery(neckworkClient, { scheduleId }))

  const { getAssetWithFallback } = useAssets()

  const firstPage = data?.pages.at(0)
  const assetIn = getAssetWithFallback(firstPage?.assetIn ?? "")
  const assetOut = getAssetWithFallback(firstPage?.assetOut ?? "")

  // Neckwork returns one row per pallet event, including ExecutionPlanned.
  // Squid's past-executions query keeps only Executed/Failed — drop planned
  // so the list is fills, not the plan that preceded each fill.
  const executions = useMemo<Array<PastExecutionData>>(
    () =>
      data?.pages.flatMap((page) =>
        page.items
          .filter((item) => item.status !== "planned")
          .map<PastExecutionData>((execution) => ({
            id: `${execution.blockHeight}-${execution.eventIndex}`,
            status: STATUS_MAP[execution.status],
            amountIn: scaleHuman(execution.amountIn || "0", assetIn.decimals),
            amountOut: scaleHuman(
              execution.amountOut || "0",
              assetOut.decimals,
            ),
            timestamp: new Date(execution.timestamp),
            link: neckwork.activityEvent(
              "dca",
              execution.blockHeight,
              execution.eventIndex,
            ),
            errorState: parseIndexerErrorState(execution.errorState),
          })),
      ) ?? [],
    [data, assetIn.decimals, assetOut.decimals],
  )

  const onEndReached = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return

    // `planned` rows are dropped client-side (the API has no status
    // filter), so a page can yield no visible rows at all — the list would stop
    // growing and the scroll trigger, which only re-fires when the rendered
    // range moves, would never fire again. Pull a few more until one yields.
    // Bounded: an empty page would leave the offset (and `hasNextPage`) put.
    let result = await fetchNextPage()
    for (let i = 0; i < MAX_EMPTY_PAGES; i++) {
      if (result.isError || !result.hasNextPage) break
      if (hasVisibleRows(result.data?.pages.at(-1))) break
      result = await fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    assetIn,
    assetOut,
    executions,
    isLoading,
    onEndReached,
  }
}
