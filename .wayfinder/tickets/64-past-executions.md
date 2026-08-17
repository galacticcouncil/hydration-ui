---
id: 64
title: "PastExecutions on the neckwork executions route"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: []
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/64
---

## Question

`usePastExecutionsData` fetches 100 executions, or all of them on "load all", and sorts client-side. Neckwork's `/v1/dca/schedules/{id}/executions` caps `limit` at **200** and one live schedule already has 914 — so "all" now means paging.

Decide the fetch strategy (fixed page, infinite query, `useInfiniteQuery` with a load-more, or an explicit page count cap), and confirm what carries over: `errorState` is byte-identical to `IndexerErrorState` so `parseIndexerErrorState` still fits; `planned` rows have null amounts; the response's top-level `assetIn`/`assetOut` replaces the schedule lookup the Squid query nests. Does the client-side sort survive, given the route already returns newest first?

## Resolution

**One `useInfiniteQuery` at 200 per page. Keep the load-all button, loop `fetchNextPage` behind it. Reuse `PastExecutionData` and `PastExecutionItem` unchanged. Delete the client-side sort.**

Squid's hook has two modes — 100 rows, or `limit: undefined` meaning *everything* — and the second is no longer available: neckwork caps `limit` at 200 and one live schedule already holds **914** executions. So `showAll` stops being a limit swap and becomes paging.

`useInfiniteQuery` with `pageSize: 200` replaces both modes with one. `hasMore` becomes `hasNextPage`, `isLoadingAll` becomes `isFetchingNextPage`, and `loadAll` loops `fetchNextPage` until `!hasNextPage` — 5 sequential requests for that 914-execution schedule. The UX is untouched: first render shows page one (200 rows into a list that shows 5 at a time and scrolls), and the button still reads `loadAll` with `count: totalCount`. Scroll-driven pagination would be the better interaction, but it is a redesign this effort didn't ask for.

**What carries over free:**
- `errorState` is byte-identical to `IndexerErrorState` — `{ kind, error, index }`, with a `Module` error carrying the pallet index and error bytes. `parseIndexerErrorState`'s zod schema fits without a change, so `decodePjsErrorQuery` in `PastExecutionItem` keeps working. Confirmed against the vendored schema and the live route.
- The response's **top-level `assetIn`/`assetOut`** are the schedule's registered pair, which replaces the nested `dcaSchedule.assetIn.assetRegistryId` lookup — one less level of optional chaining, same two `getAssetWithFallback` calls.
- `planned` and `failed` rows carry **null** amounts by design ("a failed or planned attempt traded nothing, so its amounts are null rather than 0"). Today's `execution.amountIn || "0"` already handles that, and `PastExecutionItem` only divides `amountIn/amountOut` on the `Success` branch, so the null rows never reach the division.
- Status maps one-to-one onto `TransactionStatusVariant`: `executed`→`Success`, `failed`→`Warning`, `planned`→`Pending`. Same three-entry table as today, lowercase keys.

**`PastExecutionData.id` is dead.** `VirtualizedList` keys off its own `virtualItem.key` and nothing else reads `id`. Populate it as `` `${blockHeight}-${eventIndex}` `` — a genuinely unique pair — rather than widen or trim the shared type while the Squid path still uses it.

**The client-side sort goes.** `usePastExecutionsData` sorts by timestamp descending because Squid's nesting doesn't guarantee order. Neckwork returns newest first, and does it *deterministically* — the sample shows block 13659207 emitting `eventIndex: 45` (planned) above `eventIndex: 44` (executed), so ties inside a block break on event index. The existing timestamp-only sort is unstable on exactly that case, since both rows share a timestamp. Trusting the route's order is both less code and more correct.
