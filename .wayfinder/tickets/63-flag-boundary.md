---
id: 63
title: "Flag boundary: what the neckwork order panel owns and what stays shared"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: [62]
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/63
---

## Question

Where does `useNeckworkEnabled()` cut? `SwapPageDesktop`/`SwapPageMobile` already branch for the chart and for the degraded-data path, so a `TradeOrdersNeckwork` sibling to `TradeOrders` is one option; per-tab neckwork components inside a shared `TradeOrders` is another.

Decide what the neckwork panel owns and what stays shared: the `Paper` shell, `TradeOrdersHeader` (whose badge count must move to `/v1/dca/schedules/count`), the `allPairs` toggle, `useDataTableUrlPagination`, the `tab` search param and its `marketTransactions` member — which stays on Squid. Does the tab list change when one tab is Squid-backed and three are not?

The fees map's answer was "duplicate the surround rather than extract a shell, since the two paths exist to diverge and the old one is deleted whole" — say whether that holds here, where the surround is a tab strip with live state rather than a chart frame.

## Resolution

**One new panel component, `TradeOrdersNeckwork`, sibling to `TradeOrders`. Three new tab components that differ from their Squid twins by one import. `TradeOrdersHeader` stays single, with the open-orders count lifted to a prop. The `marketTransactions` tab keeps rendering the Squid component.**

### The cut

`SwapPageDesktop` and `SwapPageMobile` already own the branch; it gains one arm, in the order the chart above it already uses — **neckwork first, legacy second**:

```tsx
isNeckworkEnabled ? <TradeOrdersNeckwork … />
: isUsingLegacyData ? <TradeOrdersHistory … />
: <TradeOrders … />
```

Neckwork wins over `isUsingLegacyData` because `DataProviderStatus` tracks the health of *Squid and the legacy indexer*, not of neckwork — degrading a healthy neckwork panel because Squid is sick would be backwards, and `TradeChartNeckwork` already established this precedence on the same two pages. Consequence, accepted: the `marketTransactions` tab inside the neckwork panel still reads Squid, so it can be degraded while its three neighbours are fine. It is the one tab that isn't account-scoped, so nothing looks inconsistent — it just may be stale or empty.

### What is duplicated and what is shared

**Duplicated** (the fees map's rule — the two paths exist to diverge, and the old one is deleted whole):
- `TradeOrdersNeckwork.tsx` — same `Paper` / `Separator` / `overflowX` shell, same `useDataTableUrlPagination("/trade/_history", "page", 10)`, same `switch (tab)`.
- `MyRecentActivityNeckwork.tsx`, `OpenOrdersNeckwork.tsx`, `OrderHistoryNeckwork.tsx`.

The three tab components are near-copies on purpose. Because [Open Orders](59-open-orders-status.md) established that `OrderData` comes across intact, `OpenOrdersNeckwork` and `OrderHistoryNeckwork` differ from their twins **by one import** — `useNeckworkOrdersData` for `useOrdersData`, and `DCA_OPEN_STATUSES` / `DCA_HISTORY_STATUSES` for the `DcaScheduleStatus[]` argument. Columns, modals and the terminate flow are reused verbatim. `MyRecentActivityNeckwork` differs a little more, since [its column set shrank](58-recent-activity-dca-gap.md).

**Shared, unchanged:** everything in `columns/`, `DcaOrderDetailsModal`, `TerminateDcaScheduleModalContent`, `OrdersEmptyState`, `PastExecutions`' presentation, `useDataTableUrlPagination`, the `tab` search param and its four members, the route's `searchSchema`.

**Shared, with one small change: `TradeOrdersHeader`.** Its only data dependency is `userOpenOrdersCountQuery` for the badge. Duplicating ~120 lines of tab strip, `allPairs` toggle and navigation to swap one query would be the expensive way to be tidy. Instead **lift `openOrdersCount` to a prop**: each panel fetches its own count (`userOpenOrdersCountQuery` on the Squid side, `dcaSchedulesCountQuery` with `DCA_OPEN_STATUSES` on the neckwork side) and passes the number down. That moves ~15 lines up one level and leaves one header.

This is not the shell-extraction the fees map ruled out. That was about *wrapping* two divergent renderers in a shared frame; this is a single query moving out of a component that is otherwise pure navigation. When the Squid path goes, the prop stays and its provider changes.

### The `marketTransactions` tab

**Keep the tab, keep the Squid component.** It is the global market feed, not account-scoped, so `/v1/trades` without a `participant` would serve it — but the map owner deferred it, and hiding the tab under the flag would mean a conditional tab list, a route-schema question about a now-unreachable `tab=marketTransactions` search value, and a user whose bookmarked URL lands nowhere. Rendering the existing `MarketTransactions` inside the neckwork panel costs one import and keeps the tab strip identical on both paths.

### Empty and disconnected states

Unchanged, and free. All three neckwork queries carry `enabled: !!account`, so a disconnected wallet leaves them idle and `DataTable` renders `OrdersEmptyState` — the same thing the Squid path does with `enabled: !!address`. No new copy needed.
