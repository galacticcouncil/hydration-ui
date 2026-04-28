import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  AccountIntent,
  IntentDcaData,
  intentsByAccountQuery,
  IntentSwapData,
} from "@/api/intents"
import { OrderData, OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

/**
 * Maps an on-chain Intent (either Swap or Dca variant) to the shared
 * OrderData shape consumed by the Open Orders table. This lets DCA
 * intents render alongside legacy (old-pallet) DCA schedules and Swap
 * (limit) intents without the display components needing to know which
 * backend produced the row.
 */
const entryToOrder = (
  entry: AccountIntent,
  getAssetWithFallback: ReturnType<typeof useAssets>["getAssetWithFallback"],
): OrderData | null => {
  const { data } = entry.intent

  if (data.type === "Swap") {
    const swap: IntentSwapData = data.value
    const from = getAssetWithFallback(String(swap.asset_in))
    const to = getAssetWithFallback(String(swap.asset_out))
    const isPartiallyFillable = swap.partial.type === "Yes"
    const partialFilledAmount =
      swap.partial.type === "Yes"
        ? scaleHuman(swap.partial.value, from.decimals)
        : null
    return {
      kind: OrderKind.Limit,
      scheduleId: Number(entry.id),
      from,
      fromAmountBudget: scaleHuman(swap.amount_in, from.decimals),
      fromAmountExecuted: null,
      fromAmountRemaining: scaleHuman(swap.amount_in, from.decimals),
      singleTradeSize: null,
      to,
      toAmountExecuted: scaleHuman(swap.amount_out, to.decimals),
      status: DcaScheduleStatus.Created,
      blocksPeriod: null,
      isOpenBudget: false,
      intentId: entry.id,
      deadline: entry.intent.deadline,
      isPartiallyFillable,
      partialFilledAmount,
    }
  }

  // Dca
  const dca: IntentDcaData = data.value
  const from = getAssetWithFallback(String(dca.asset_in))
  const to = getAssetWithFallback(String(dca.asset_out))
  const isOpenBudget = dca.budget === undefined

  // Per-trade: `amount_in`/`amount_out` are per-execution on the intent.
  const singleTradeSize = scaleHuman(dca.amount_in, from.decimals)
  // Total budget in human units (LimitedBudget only). We don't have
  // aggregated execution data without an indexer, so `fromAmountExecuted`
  // stays null and `fromAmountRemaining` falls back to the full budget.
  const fromAmountBudget = !isOpenBudget
    ? scaleHuman(dca.budget as bigint, from.decimals)
    : null

  return {
    kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
    scheduleId: Number(entry.id),
    from,
    fromAmountBudget,
    fromAmountExecuted: null,
    fromAmountRemaining: fromAmountBudget,
    singleTradeSize,
    to,
    // Per-trade target output — the column currently labels this
    // "amount_out" / "to received". Without indexer aggregates the best
    // we can show is the per-execution target.
    toAmountExecuted: scaleHuman(dca.amount_out, to.decimals),
    status: DcaScheduleStatus.Created,
    blocksPeriod: String(dca.period),
    isOpenBudget,
    intentId: entry.id,
    deadline: entry.intent.deadline,
  }
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

    const filterByAsset = (entry: AccountIntent) => {
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
      .map((entry) => entryToOrder(entry, getAssetWithFallback))
      .filter((o): o is OrderData => o !== null)
  }, [intents, assetIds, getAssetWithFallback])

  return { orders, isLoading }
}
