---
id: 61
title: "Explorer links from neckwork trade and execution rows"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: []
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/61
---

## Question

`getSwapExplorerLink` builds explorer URLs from a Squid event shape: `{ paraBlockHeight, indexInBlock, extrinsicIndex }` for market swaps, a separate DCA execution event ref, and a `scheduleId` fallback. Neckwork rows carry `blockHeight`, `eventIndex` and a nullable `extrinsicIndex` — the same three facts under different names.

Confirm the mapping holds for every row kind in scope (routed trade with and without an extrinsic index, DCA schedule, DCA execution), and that the resulting URLs actually resolve. Decide whether `getSwapExplorerLink` is reused with an adapter, generalised, or forked for the neckwork path.

Note the name collision: `neckwork` imported from `@galacticcouncil/utils` is the *explorer* URL builder, unrelated to the neckwork API. Say something about it if it's a trap worth avoiding.

## Resolution

**Don't reuse `getSwapExplorerLink`. Inline two lines in the neckwork trades mapper. Leave the Squid helper untouched.**

The field mapping does hold — `blockHeight` → `paraBlockHeight`, `eventIndex` → `indexInBlock`, `extrinsicIndex` → `extrinsicIndex` — but after [the recent-activity decision](58-recent-activity-dca-gap.md) removed DCA rows from the neckwork feed, only `getSwapExplorerLink`'s *market* branch is ever reachable. That branch is:

```ts
const link = isNumber(row.extrinsicIndex)
  ? neckwork.activityExtrinsic("swap", row.blockHeight, row.extrinsicIndex)
  : neckwork.event(row.blockHeight, row.eventIndex)
```

Two lines inside the row mapper. Reusing the 40-line helper would mean building a fake `OrderStatus` just to make it take the branch we want, and adapting a shape in order to reach one sixth of a function is not reuse. `getSwapExplorerLink` stays exactly as it is, serving the Squid tabs; when they go, it goes with them.

**The other two link sites need no helper either, and already don't use one.** `OpenOrders.columns` calls `neckwork.activityDca(row.original.scheduleId)` inline and `scheduleId` is unchanged, so it works untouched. `PastExecutions` calls `neckwork.activityEvent("dca", blockHeight, eventIndex)`, which neckwork's executions route feeds directly — see [PastExecutions](64-past-executions.md).

**The `extrinsicIndex` fallback is effectively dead on this feed.** Across **800** participant-scoped rows from 4 accounts, `extrinsicIndex` was null **0** times. It stays in as a guard — the schema declares it nullable and the API's own prose describes hook-dispatched routes that have no extrinsic — but the generic `/event/…` page is not a path users will normally land on. Every neckwork recent-activity row gets the proper `/swap/{block}-{extrinsicIndex}` activity page.

**Not the same measurement for `operationType`:** null on **512 of 800** rows (64%). Nothing renders it today, so this costs nothing — but it rules out ever adding an exactIn/exactOut cell to this tab without a "—" state for the majority of rows.

**On the name collision:** it is not a collision. `hydration-explorer.neckwork.net` (the `neckwork` helper in `@galacticcouncil/utils`) and `hydration-api.neckwork.net` (the `neckworkClient` in `@/api/provider`) are the explorer and the API from the same vendor. Two imports named after one product, both correct. Worth a sentence in a code comment at the one place both appear in scope — the trades mapper — and nothing more.

**Unverifiable by probe:** the explorer is a client-rendered SPA that answers 200 to `/swap/1-999` as readily as to a real route, so HTTP status can't confirm a link resolves. The URL *shapes* are byte-identical to what the Squid path already emits for the same on-chain coordinates, which is the real assurance; visual confirmation belongs in the manual verification bar on [the plan](66-implementation-plan.md).
