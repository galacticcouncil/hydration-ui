---
id: 59
title: "Open Orders on server-computed DCA schedule status"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: []
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/59
---

## Question

`/v1/dca/schedules?status=created` covers Open Orders, and every field `OrderData` needs has a counterpart: `singleTradeAmount`, `budget`, `isRollingBudget`, `executedAmountIn/Out`, `periodBlocks`, plus a server-computed `status`.

Pin the data shape: does the neckwork path reuse the `OrderData` type and the `DcaScheduleStatus` enum (mapping `created`→`Created` etc.), or does it get its own type with lowercase statuses and an adapter at the `DcaOrderStatus` boundary? Where does raw→human scaling live — in `packages/indexer` or in the app hook, as `scaleHuman` does today? What replaces `getDcaScheduleStatus`, now that the server derives the status the explorer uses?

Also settle the cancel flow: `TerminateDcaScheduleModalContent` takes `scheduleId`, `sold`, `total`, `symbol`, `openBudget` — confirm each survives unchanged, and what invalidates after a successful terminate.

## Resolution

**Reuse `OrderData` and `DcaScheduleStatus` verbatim. Map neckwork's lowercase status to the existing enum in the app hook. Nothing shared changes.**

Every one of `OrderData`'s twelve fields has a neckwork counterpart, so the type comes across untouched:

| `OrderData` | from `/v1/dca/schedules` |
|---|---|
| `kind` | `isRollingBudget ? OrderKind.DcaRolling : OrderKind.Dca` |
| `scheduleId` | `scheduleId` (already a number — no `Number()` cast) |
| `from` / `to` | `getAssetWithFallback(assetIn)` / `(assetOut)` |
| `fromAmountBudget` | `scaleHuman(budget, from.decimals)` |
| `fromAmountExecuted` | `scaleHuman(executedAmountIn, from.decimals)` |
| `fromAmountRemaining` | `budget − executed`, as today |
| `singleTradeSize` | `scaleHuman(singleTradeAmount, from.decimals)` |
| `toAmountExecuted` | `scaleHuman(executedAmountOut, to.decimals)` |
| `status` | `DCA_STATUS[item.status]` (see below) |
| `blocksPeriod` | `String(periodBlocks)` |
| `isOpenBudget` | `isRollingBudget` |

Two things get *better*, not just equal. `isOpenBudget` stops being inferred from `budgetAmountIn === "0"` and reads a field the API states outright. And `status` stops being derived: `getDcaScheduleStatus`'s heuristic — "terminated with the last execution still only planned ⇒ cancelled" — is **retired**, replaced by the server's signed-extrinsic signal, which is what the explorer's DCA page uses. Neckwork's own prose says that heuristic "mislabels an error termination that left a pending plan", so this is a bug fix riding along.

**Status mapping lives in the app hook**, as a four-entry `Record<NeckworkDcaStatus, DcaScheduleStatus>`. `DcaScheduleStatus` is imported from `@galacticcouncil/indexer/squid` — a cosmetic wart, deliberately accepted: it is a plain string enum with no Squid dependency, it is the vocabulary `DcaOrderStatus` already speaks in four i18n branches, and re-deriving it on the neckwork side would fork those branches for nothing. When the Squid path is deleted the enum moves four lines into the app. Not worth touching `DcaOrderStatus`'s prop type and putting the live Squid path at risk today.

**Scaling stays in the app hook**, not in `packages/indexer`. `scaleHuman` needs `decimals` from `getAssetWithFallback`, which is an app provider; the package has no access to the asset registry. So the package hands back the API's raw strings and registry ids and the hook does asset lookup + scaling + status mapping — the same division the Squid hooks use.

**The cancel flow survives unchanged.** `TerminateDcaScheduleModalContent` takes `scheduleId`, `sold`, `total`, `symbol`, `openBudget` — all present above — and `useTerminateDcaSchedule` only needs `scheduleId` for `papi.tx.DCA.terminate`. No fork.

**Invalidation: opt into `QUERY_KEY_BLOCK_PREFIX`, and drop `NECKWORK_STALE_TIME` on these routes.** Squid's order queries prefix their keys with it, and `useInvalidateOnBlock` in `api/chain.ts` invalidates everything under that prefix on every new block — which is how a terminate shows up without any explicit invalidation. The neckwork routes want the same treatment, and the server agrees: all four respond **`cache-control: public, max-age=3`**, roughly one parachain block. So `NECKWORK_STALE_TIME` (60 s, right for pools and fees) is **wrong here** — a 60 s stale window on the open-orders list means a cancelled order lingers visibly. Use the block prefix and let invalidation drive the refetch; do not add a bespoke invalidation path through `createTransaction`'s `invalidateQueries`, since the block-driven one also absorbs indexer lag for free.

Cost: two GETs per block (list + count) while the trade page is open, against a server advertising `max-age=3`. That is what the Squid path already does.

**Consequence for [the flag boundary](63-flag-boundary.md):** because `OrderData` is identical, `OpenOrders.columns`, `OrderHistory.columns`, `DcaOrderDetailsModal` and `TerminateDcaScheduleModalContent` all work as-is. The only genuinely new code for these two tabs is the data hook — so the neckwork components differ from their Squid twins by *one import line*.
