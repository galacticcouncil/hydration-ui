import type { Intent } from "@galacticcouncil/indexer/neckwork"
import Big from "big.js"
import { isNonNullish } from "remeda"

import type { AccountIntentEntry } from "@/api/intents"
import {
  type IntentDcaOrderData,
  type IntentLimitOrderData,
  isIntentOrder,
  type OrderData,
  OrderKind,
  OrderStatus,
} from "@/modules/trade/orders/lib/orderData"
import type { AssetId, TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type GetAsset = (id: AssetId) => TAsset

export const intentEntryToOrder = (
  entry: AccountIntentEntry,
  getAsset: GetAsset,
): OrderData | null => {
  const { data } = entry.intent

  // An Order Match swap only waits for opposite intents until `match_until`,
  // otherwise it is a plain swap and lists like one
  const swap =
    data.type === "Swap"
      ? data.value
      : data.type === "MatchFirstSwap"
        ? data.value.swap
        : null

  if (swap) {
    const from = getAsset(String(swap.asset_in))
    const to = getAsset(String(swap.asset_out))
    const isPartiallyFillable = swap.partial.type === "Yes"
    const fromAmountExecuted =
      swap.partial.type === "Yes"
        ? scaleHuman(swap.partial.value, from.decimals)
        : null
    const fromAmountBudget = scaleHuman(swap.amount_in, from.decimals)
    const fromAmountRemaining =
      fromAmountExecuted !== null
        ? Big(fromAmountBudget).minus(fromAmountExecuted).toString()
        : fromAmountBudget

    return {
      kind: OrderKind.Limit,
      intentId: entry.id,
      from,
      fromAmountBudget,
      fromAmountExecuted,
      fromAmountRemaining,
      to,
      toAmountBudget: scaleHuman(swap.amount_out, to.decimals),
      toAmountExecuted: null,
      status: OrderStatus.Created,
      deadline: entry.intent.deadline ? Number(entry.intent.deadline) : null,
      timestamp: Number(entry.id >> 64n),
      isPartiallyFillable,
      resolvedBlock: null,
    } satisfies IntentLimitOrderData
  }

  if (data.type === "Dca") {
    const dca = data.value
    const from = getAsset(String(dca.asset_in))
    const to = getAsset(String(dca.asset_out))
    const isOpenBudget = dca.budget === undefined || dca.budget === 0n
    const budget = dca.budget ?? 0n
    const fromAmountBudget = isOpenBudget
      ? null
      : scaleHuman(budget, from.decimals)
    const fromAmountRemaining = isOpenBudget
      ? null
      : scaleHuman(dca.remaining_budget, from.decimals)
    const fromAmountExecuted = isOpenBudget
      ? null
      : scaleHuman(budget - dca.remaining_budget, from.decimals)
    const amountIn = scaleHuman(dca.amount_in, from.decimals)
    const amountOut = scaleHuman(dca.amount_out, to.decimals)

    // NOT a loose heuristic, despite how it reads. A market TWAP leaves
    // `amount_out` at the buy asset's existential deposit — the SDK field is
    // literally named `assetOutEd` — and `useSubmitDcaOrder` overrides it with
    // the computed limit amount ONLY when the user sets a limit price. So the
    // comparison is exact: == ED means market, > ED means limit.
    // Verified 2026-09-15 against 43 live dca intents: `amount_out` is a constant
    // per buy asset (HDX's is 1000000000000, i.e. exactly 1 HDX = its ED) except
    // on the rows that really are limit orders. Do not "fix" this to a
    // price-based test without changing the placement path first.
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
      fromAmountExecuted,
      fromAmountRemaining,
      to,
      toAmountExecuted: null,
      status: OrderStatus.Created,
      timestamp: Number(entry.id >> 64n),
      singleTradeSize: amountIn,
      blocksPeriod: String(dca.period),
      isOpenBudget,
      limitPrice,
      resolvedBlock: null,
    } satisfies IntentDcaOrderData
  }

  return null
}

export const buildIntentOrderRows = (
  intents: ReadonlyArray<AccountIntentEntry>,
  getAsset: GetAsset,
): Array<OrderData> =>
  intents
    .map((entry) => intentEntryToOrder(entry, getAsset))
    .filter(isNonNullish)

export type IntentFillTotals = {
  readonly amountIn: bigint
  readonly amountOut: bigint
}

export const enrichIntentOrders = (
  orders: ReadonlyArray<OrderData>,
  totals: ReadonlyMap<string, IntentFillTotals>,
): Array<OrderData> =>
  orders.map((order) => {
    if (!isIntentOrder(order)) return order

    const fills = totals.get(String(order.intentId))
    if (!fills) return order

    const toAmountExecuted =
      fills.amountOut > 0n
        ? scaleHuman(fills.amountOut, order.to.decimals)
        : order.toAmountExecuted

    const takesIndexerSellSide =
      order.kind === OrderKind.DcaRolling && order.fromAmountExecuted === null

    const fromAmountExecuted =
      takesIndexerSellSide && fills.amountIn > 0n
        ? scaleHuman(fills.amountIn, order.from.decimals)
        : order.fromAmountExecuted

    return { ...order, fromAmountExecuted, toAmountExecuted }
  })

/**
 * A neckwork intent row -> an OrderData row. Unlike the chain path, every
 * cumulative figure is asserted by the API, so there is nothing to derive:
 * `filledAmountIn`/`filledAmountOut` are the totals for BOTH kinds, including a
 * rolling-budget TWAP that chain state cannot count down.
 *
 */
export const neckworkIntentToOrder = (
  intent: Intent,
  status: OrderStatus,
  getAsset: GetAsset,
): OrderData | null => {
  const from = getAsset(intent.assetIn)
  const to = getAsset(intent.assetOut)
  // The API asserts these totals, so a "0" here is a real claim of no fill,
  // not the unknown that a null means elsewhere in this module.
  const fromAmountExecuted = scaleHuman(intent.filledAmountIn, from.decimals)
  const toAmountExecuted = scaleHuman(intent.filledAmountOut, to.decimals)
  const timestamp = intent.lastEventAt ?? intent.createdAt
  const intentId = BigInt(intent.intentId)

  if (intent.kind === "swap") {
    return {
      kind: OrderKind.Limit,
      intentId,
      from,
      fromAmountBudget: scaleHuman(intent.amountIn, from.decimals),
      fromAmountExecuted,
      fromAmountRemaining: scaleHuman(intent.remainingAmountIn, from.decimals),
      to,
      toAmountBudget: scaleHuman(intent.amountOut, to.decimals),
      toAmountExecuted,
      status,
      deadline: intent.deadline ? Number(intent.deadline) : null,
      timestamp,
      isPartiallyFillable: intent.partiallyFillable,
      resolvedBlock: null,
    } satisfies IntentLimitOrderData
  }

  // budget, isRollingBudget and periodBlocks are null TOGETHER on a swap
  // intent, so branch on `kind` first — never on isRollingBudget alone.
  const isOpenBudget = intent.isRollingBudget ?? false
  const singleTradeSize = scaleHuman(intent.amountIn, from.decimals)
  const amountOut = scaleHuman(intent.amountOut, to.decimals)

  // NOT a loose heuristic, despite how it reads. A market TWAP leaves
  // `amount_out` at the buy asset's existential deposit — the SDK field is
  // literally named `assetOutEd` — and `useSubmitDcaOrder` overrides it with
  // the computed limit amount ONLY when the user sets a limit price. So the
  // comparison is exact: == ED means market, > ED means limit.
  // Verified 2026-09-15 against 43 live dca intents: `amount_out` is a constant
  // per buy asset (HDX's is 1000000000000, i.e. exactly 1 HDX = its ED) except
  // on the rows that really are limit orders. Do not "fix" this to a
  // price-based test without changing the placement path first.
  const isLimit =
    !!to.existentialDeposit && Big(intent.amountOut).gt(to.existentialDeposit)
  const limitPrice =
    isLimit && Big(amountOut).gt(0)
      ? Big(singleTradeSize).div(amountOut).toString()
      : null

  return {
    kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
    intentId,
    from,
    fromAmountBudget:
      isOpenBudget || intent.budget === null
        ? null
        : scaleHuman(intent.budget, from.decimals),
    fromAmountExecuted,
    fromAmountRemaining: isOpenBudget
      ? null
      : scaleHuman(intent.remainingAmountIn, from.decimals),
    to,
    toAmountExecuted,
    status,
    timestamp,
    singleTradeSize,
    blocksPeriod:
      intent.periodBlocks === null ? null : String(intent.periodBlocks),
    isOpenBudget,
    limitPrice,
    resolvedBlock: null,
  } satisfies IntentDcaOrderData
}
