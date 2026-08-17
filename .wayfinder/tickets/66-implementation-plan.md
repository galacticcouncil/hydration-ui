---
id: 66
title: "Assemble the neckwork order-tabs implementation plan"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: [61, 63, 64, 65]
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/66
---

## Question

Assemble the handoff: the commit-by-commit implementation plan for the three neckwork order tabs, drawing every decision off this map's closed tickets.

Must carry: the full file list (new and touched), commit order with `packages/indexer` built before `apps/main` typechecks, what must not change on the Squid path, the verification bar (`yarn build` then `yarn lint`, plus the manual browser checks — flag on and off, connected and disconnected wallet, `allPairs` both ways, pagination past page 1, an empty account), and where the handoff boundary sits.

## Resolution

**The handoff artifact. Four commits, `packages/indexer` first, and the risky one is commit 3 — the only one that touches code the Squid path runs.**

### Naming and layout

Follow the established neckwork convention: a sibling **folder** named `<Thing>Neckwork/`, as with `swap/components/TradeChartNeckwork/` and `stats/fees/FeeAndRevenueChartNeckwork/`. Everything net-new lands in `modules/trade/orders/TradeOrdersNeckwork/`, so deleting the effort later is one `rm -r` and the Squid path is what remains.

### Commit 1 — `packages/indexer`: the query layer

- **new** `packages/indexer/src/neckwork/trades.ts` — `RoutedTrade`, `routedTradesQuery`
- **new** `packages/indexer/src/neckwork/dca.ts` — `DcaStatus`, `DCA_STATUSES`, `DCA_OPEN_STATUSES`, `DCA_HISTORY_STATUSES`, `DcaSchedule`, `DcaExecution`, `dcaSchedulesQuery`, `dcaSchedulesCountQuery`, `dcaExecutionsInfiniteQuery`
- **edit** `packages/indexer/src/neckwork/index.ts` — two `export *` lines

Shapes, keys, `staleTime` and pagination are fully specified on [the query-layer ticket](62-query-layer.md). No codegen run: every route is already in the vendored `openapi.json`. `Array.from(...)` before every `.map`.

**Then build the package before anything in `apps/main` is type-checked** — `yarn workspace @galacticcouncil/indexer build`. It is a composite TS project and the app reads its `build/src/**/*.d.ts`, not its sources; skipping this produces a scatter of unrelated `TS7006 … implicitly has an 'any' type` errors at app call sites (`packages/indexer/CLAUDE.md`).

### Commit 2 — the app's data hooks

- **new** `modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkRoutedTradesData.ts` → `RoutedTradeData[]`, with `status` the constant `{ kind: "market", status: "filled" }` and the two-line explorer link inline ([#61](61-explorer-links.md), [#65](65-details-modals.md))
- **new** `…/lib/useNeckworkOrdersData.ts` → `OrderData[]`, `scaleHuman` + `getAssetWithFallback` + the four-entry `DcaStatus → DcaScheduleStatus` map ([#59](59-open-orders-status.md))
- **new** `…/lib/useNeckworkPastExecutionsData.ts` → the `usePastExecutionsData` return shape, over `useInfiniteQuery` ([#64](64-past-executions.md))

Nothing renders yet; the app still builds and behaves exactly as before.

### Commit 3 — the shared seams ⚠️

This is the only commit that changes code the Squid path executes. **Behaviour must be identical when the flag is off, and that is what to verify before moving on.**

- **edit** `TradeOrdersHeader.tsx` — drop `userOpenOrdersCountQuery` / `useSquidClient` / `useAccount`, take `openOrdersCount: number` as a prop ([#63](63-flag-boundary.md))
- **edit** `TradeOrders.tsx` — run that count query here, pass the number down
- **edit** `PastExecutions/PastExecutions.tsx` — becomes presentational; props are exactly today's `usePastExecutionsData` return ([#65](65-details-modals.md))
- **new** `PastExecutions/PastExecutionsSquid.tsx` — six-line wrapper
- **edit** `DcaOrderDetailsModal.tsx` — new `pastExecutions: ReactNode` prop; line 128 becomes `{pastExecutions}`
- **edit** `OpenOrders/OpenOrders.tsx`, `OrderHistory/OrderHistory.tsx` — pass `<PastExecutionsSquid scheduleId={…} />`

### Commit 4 — the neckwork components and the flag

- **new** `TradeOrdersNeckwork/TradeOrdersNeckwork.tsx` — `Paper` shell, `useDataTableUrlPagination`, `dcaSchedulesCountQuery` for the badge, `switch (tab)` across the three new tabs plus the **existing Squid `MarketTransactions`** ([#63](63-flag-boundary.md))
- **new** `TradeOrdersNeckwork/MyRecentActivityNeckwork.tsx` and `MyRecentActivityNeckwork.columns.tsx` — four desktop columns (from/to, fill price, status, actions), no `type` column, no `DcaOrderStatus` branch ([#58](58-recent-activity-dca-gap.md))
- **new** `TradeOrdersNeckwork/OpenOrdersNeckwork.tsx`, `OrderHistoryNeckwork.tsx` — their Squid twins with one import swapped and `DCA_OPEN_STATUSES` / `DCA_HISTORY_STATUSES` in place of the `DcaScheduleStatus[]` argument
- **new** `TradeOrdersNeckwork/PastExecutionsNeckwork.tsx` — six-line wrapper
- **edit** `swap/SwapPageDesktop.tsx`, `swap/SwapPageMobile.tsx` — `isNeckworkEnabled ? <TradeOrdersNeckwork/> : isUsingLegacyData ? <TradeOrdersHistory/> : <TradeOrders/>`, neckwork first, matching the chart branch directly above

### What must not change

- The Squid path's rendered output, with the flag off. Commit 3 is the whole risk surface.
- `TradeOrdersHistory.tsx` and everything on the legacy `indexer`-SDK path — untouched, including `TradeOrderHistoryDetailsModal`, which composes `PastExecutionsHeader`/`PastExecutionsListHeader` directly and so is unaffected by the `PastExecutions` split.
- `routes/trade/_history/route.tsx` — the `searchSchema`, the four `tradeOrderTabs`, `allPairs`, `page`. No route change in this effort.
- `getSwapExplorerLink` — left alone, unreachable from the neckwork path ([#61](61-explorer-links.md)).
- `NECKWORK_STALE_TIME` and every existing neckwork query. The new list queries opt out of it deliberately; the ones that use it are unaffected.

**No new i18n keys.** Every string the neckwork tabs render — `trade.orders.*` headers, the four `status.*` labels, `pastExecutions.loadAll`, `openInExplorer` — already exists. The keys that stop being used on this path (`trade.orders.type.*`) stay for the Squid path.

### The verification bar

Type/build, in this order (CI runs `build` before `lint`, so a wrong local order misleads):

1. `yarn workspace @galacticcouncil/indexer build`
2. `yarn build` from root
3. `yarn lint` from root

Then the browser, since there is no test runner. Toggle the source with the **`NeckworkToggle`** in `DataProviderSelect` (a persisted Zustand override; `VITE_NECKWORK_ENABLED` is already `true` in both `.env.development` and `.env.production`, so the default is on and *Squid is the case you have to select deliberately*).

- **Flag off:** all four tabs, badge count, `allPairs` toggle, pagination, a DCA details modal with load-all. This is the commit-3 regression check.
- **Flag on, wallet connected:** My Recent Activity, Open Orders, Order History. Row contents, fill price, status labels.
- **Flag on, wallet disconnected:** three empty tables with `OrdersEmptyState`, no failed requests.
- **`allPairs` both ways** on each tab — off should narrow to the two assets in the search params, either side of the pair.
- **Page 2 and beyond**, then back to 1. The `page` search param round-trips.
- **An account with real history:** `7K5vL7eGtVqYFV5xHirFmQUPUCoKMiEjWjSr4aEyYBCiY17o` — 101 schedules (82 completed, 15 cancelled, **2 terminated**, 2 live rolling), 321 trades, and a schedule with **914 executions**. It exercises the three-way status distinction, load-all paging, and the rolling-budget rendering in one account.
- **Cancel a live order** and confirm it leaves Open Orders within a block or two without a manual refresh — this is the block-invalidation decision ([#59](59-open-orders-status.md)) actually working.
- **Explorer links** from a recent-activity row (a `/swap/{block}-{extrinsicIndex}` page), an open order (`/dca/{scheduleId}`), and a past execution (`/dca/{block}-e{eventIndex}`). The explorer is an SPA that answers 200 to nonsense, so these must be eyeballed, not curl'd.
- **Mobile widths** on all three tabs — the single-column expand layouts.

### Handoff boundary

The plan ends when the three tabs render neckwork data behind the flag and the Squid path is unchanged with it off. Explicitly not in it: the Market Transactions tab, deleting anything Squid, the legacy-indexer path, and any reconciliation of neckwork's numbers against Squid's.
