import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { AccountIntentEntry, useAccountIntents } from "@/api/intents"
import {
  IntentDcaOrderData,
  IntentLimitOrderData,
  OrderData,
  OrderKind,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
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
    } satisfies IntentLimitOrderData
  }

  if (data.type === "Dca") {
    const dca = data.value
    const from = getAssetWithFallback(String(dca.asset_in))
    const to = getAssetWithFallback(String(dca.asset_out))
    const isOpenBudget = dca.budget === undefined || dca.budget === 0n
    const budget = dca.budget ?? 0n
    const fromAmountBudget = isOpenBudget
      ? null
      : scaleHuman(budget, from.decimals)
    const fromAmountRemaining = isOpenBudget
      ? null
      : scaleHuman(dca.remaining_budget, from.decimals)
    const amountIn = scaleHuman(dca.amount_in, from.decimals)
    const amountOut = scaleHuman(dca.amount_out, to.decimals)

    // A market TWAP carries the buy asset's existential deposit as a dust
    // floor; a "limit TWAP" carries a real per-slice min-out. So both amounts
    // being meaningfully specified (amount_out above ED) marks a price
    // condition, and the limit price = per-slice SELL / per-slice BUY.
    const isLimit =
      !!to.existentialDeposit &&
      Big(dca.amount_out.toString()).gt(to.existentialDeposit)
    const limitPrice =
      isLimit && Big(amountOut).gt(0)
        ? Big(amountIn).div(amountOut).toString()
        : null

    return {
      kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
      intentId: entry.id,
      from,
      fromAmountBudget,
      fromAmountExecuted: amountIn,
      fromAmountRemaining,
      to,
      toAmountExecuted: amountOut,
      status: DcaScheduleStatus.Created,
      timestamp: Number(entry.id >> 64n),
      singleTradeSize: amountIn,
      blocksPeriod: String(dca.period),
      isOpenBudget,
      limitPrice,
    } satisfies IntentDcaOrderData
  }

  return null
}

export const useIntentOrdersData = (assetIds: string[]) => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()

  const { data: intents, isLoading } = useAccountIntents(account?.address ?? "")

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
