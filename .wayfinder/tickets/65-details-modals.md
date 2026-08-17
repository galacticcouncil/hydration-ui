---
id: 65
title: "Details modals: reuse or fork for the neckwork data shapes"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: [59, 62]
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/65
---

## Question

`SwapDetailsModal` takes `SwapData | RoutedTradeData` and reads `status.kind` to pick between `SwapStatus` and `DcaOrderStatus`. `DcaOrderDetailsModal` takes `OrderData` and embeds `PastExecutions`.

Decide whether each modal is reused against the neckwork data shapes (widening its prop union, or adapting at the call site), or forked. The recent-activity ticket may have removed the DCA branch from the swap modal entirely; the open-orders ticket decides whether `OrderData` survives. Resolve after both.

## Resolution

**`SwapDetailsModal`: no change, no fork — reuse `RoutedTradeData` verbatim on the neckwork path. `DcaOrderDetailsModal`: no fork either, but it gains one `pastExecutions: ReactNode` prop, and `PastExecutions` splits into a view plus two six-line data wrappers.**

### `SwapDetailsModal` — untouched

It reads eight things: `from`, `fromAmount`, `to`, `toAmount`, `fillPrice`, `date`, `link`, `status`. Seven come straight off the neckwork row. The eighth is the only friction, and the cheapest resolution is to **keep `RoutedTradeData` as the neckwork row type** with `status` set to the constant `{ kind: "market", status: "filled" }`. The mapped type is then structurally `RoutedTradeData`, so the existing `SwapData | RoutedTradeData` prop union accepts it and the modal needs **zero edits** — as do `SwapAmount`, `SwapPrice` and `SwapStatus`.

**This corrects [the recent-activity ticket](58-recent-activity-dca-gap.md)**, which said the row type should be flat with no `status` union. That was right about the *table* and wrong about the *modal*. Dropping a column that renders the same chip on every row saves table width and reader attention; dropping a field that shared code reads saves nothing and costs a third union member plus an `"status" in details` guard in a component the Squid path also uses. So: the column goes, the field stays, and the assertion it makes — an indexed, completed swap filled — is true.

The `MyRecentActivity` **columns still fork** (`useMyRecentActivityNeckworkColumns`): same file minus the `type` column and minus the `DcaOrderStatus` branch of the status cell, per #58. Reusing the row *type* does not mean reusing the column set.

### `DcaOrderDetailsModal` — one prop

The modal itself is fine on neckwork data: [Open Orders](59-open-orders-status.md) established that `OrderData` comes across intact, so all 136 lines of labels, amounts, `blocksPeriod` arithmetic and the terminate button work unchanged. The single problem is line 128 — it renders `<PastExecutions scheduleId={…} />`, and that component reaches for Squid internally.

Three ways out, and the middle one wins:

- **Fork the modal.** 136 lines of `t()` calls duplicated so that one child can change. Two places for every future copy fix. No.
- **Branch inside `PastExecutions` on `useNeckworkEnabled()`.** Illegal — picking between two data hooks is a conditional hook call, and calling both means firing both queries and threading `enabled` down to suppress one. No.
- **Lift the child to a prop.** `DcaOrderDetailsModal` takes `pastExecutions: ReactNode`; line 128 becomes `{pastExecutions}`. Its two call sites (`OpenOrders`, `OrderHistory`) pass `<PastExecutionsSquid scheduleId={…} />`, their neckwork twins pass `<PastExecutionsNeckwork scheduleId={…} />`. One prop, one line, one shared modal.

### The `PastExecutions` split

`PastExecutions.tsx` becomes presentational: its props are exactly what `usePastExecutionsData` returns today (`assetIn`, `assetOut`, `executions`, `isLoading`, `hasMore`, `isLoadingAll`, `loadAll`, `totalCount`), so the 107 lines of `VirtualizedList`, skeleton and load-all button move across untouched. Two wrappers sit above it:

```tsx
export const PastExecutionsNeckwork: FC<{ scheduleId: number }> = ({ scheduleId }) => (
  <PastExecutions {...useNeckworkPastExecutionsData(scheduleId)} />
)
```

This is shell extraction, which the fees map explicitly ruled against — and the difference is worth naming. There, the two renderers were *diverging* and the shell would have constrained both. Here the two paths render **identically** and differ only in where rows come from, and the seam being extracted is a boundary that already exists: the hook's return type. The alternative is duplicating a virtualized list and its skeleton to change one import.

`PastExecutionItem`, `PastExecutionsHeader` and `PastExecutionsListHeader` are untouched — [the executions ticket](64-past-executions.md) established that `PastExecutionData` and `IndexerErrorState` both survive as-is.

**Not affected:** `TradeOrderHistoryDetailsModal` also renders `PastExecutionsHeader`/`PastExecutionsListHeader`, but it belongs to the legacy `indexer`-SDK path the map ruled out of scope. It composes those two leaves directly and never touches `PastExecutions`, so the split does not reach it.
