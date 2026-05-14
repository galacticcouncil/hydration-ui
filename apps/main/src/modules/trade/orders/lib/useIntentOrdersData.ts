import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { AccountIntentEntry, intentsByAccountQuery } from "@/api/intents"
import {
  LimitOrderData,
  OrderData,
  OrderKind,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import { numericallyDesc } from "@/utils/sort"

const intentEntryToOrder = (
  entry: AccountIntentEntry,
  getAssetWithFallback: ReturnType<typeof useAssets>["getAssetWithFallback"],
): OrderData | null => {
  const { data } = entry.intent

  if (data.type === "Swap") {
    const swap = data.value
    const from = getAssetWithFallback(String(swap.asset_in))
    const to = getAssetWithFallback(String(swap.asset_out))
    const isPartiallyFillable = swap.partial.type === "Yes"
    const partialFilledAmount =
      swap.partial.type === "Yes"
        ? scaleHuman(swap.partial.value, from.decimals)
        : null
    return {
      kind: OrderKind.Limit,
      intentId: entry.id,
      from,
      fromAmountBudget: scaleHuman(swap.amount_in, from.decimals),
      fromAmountExecuted: null,
      fromAmountRemaining: scaleHuman(swap.amount_in, from.decimals),
      to,
      toAmountExecuted: scaleHuman(swap.amount_out, to.decimals),
      status: DcaScheduleStatus.Created,
      deadline: entry.intent.deadline ? Number(entry.intent.deadline) : null,
      timestamp: Number(entry.id >> 64n),
      isPartiallyFillable,
      partialFilledAmount,
    } satisfies LimitOrderData
  }

  // @TODO: Handle ICE DCA orders
  return null
}

export const useIntentOrdersData = (assetIds: string[]) => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const { data: intents, isLoading } = useQuery(
    intentsByAccountQuery(rpc, account?.address ?? ""),
  )

  const orders = useMemo<OrderData[]>(() => {
    if (!intents) return []

    const filterByAsset = (entry: AccountIntentEntry) => {
      if (assetIds.length === 0) return true
      const { data } = entry.intent
      const assetIn = data.value.asset_in
      const assetOut = data.value.asset_out

      return (
        assetIds.includes(String(assetIn)) ||
        assetIds.includes(String(assetOut))
      )
    }

    return intents
      .filter(filterByAsset)
      .map((entry) => intentEntryToOrder(entry, getAssetWithFallback))
      .filter(isNonNullish)
      .sort((a, b) => numericallyDesc(a.timestamp ?? 0, b.timestamp ?? 0))
  }, [intents, assetIds, getAssetWithFallback])

  return { orders, isLoading }
}
