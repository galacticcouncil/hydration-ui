---
id: 62
title: "Shape of the trades and DCA queries in packages/indexer"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: [58, 59, 60]
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/62
---

## Question

Design the query layer: which files under `packages/indexer/src/neckwork/`, which `queryOptions` factories, what each returns.

Four routes are in play — `/v1/trades/routed`, `/v1/dca/schedules`, `/v1/dca/schedules/count`, `/v1/dca/schedules/{id}/executions`. Settle file split (one `trades.ts` + `dca.ts`, or per-route), factory signatures (positional args like `accountsBalancesQuery`, or a params object like `feesChartQuery`), query keys, `staleTime` (is `NECKWORK_STALE_TIME` right for a feed that changes every block?), how `limit`/`offset` are derived from the app's `pageIndex`/`pageSize`, and how far the mapping goes inside the package versus in the app hook.

Constraints: `--immutable` codegen means `Array.from(...)` before `.map`; the app consumes the module-level `neckworkClient` from `@/api/provider`; no zod.

## Resolution

**Two files, `trades.ts` and `dca.ts`, matching the API's own tags and this package's one-file-per-domain layout. Params objects, `["neckwork", …]` keys behind `QUERY_KEY_BLOCK_PREFIX` for the three live lists, and the package maps to a clean domain shape.**

### Files and factories

`packages/indexer/src/neckwork/trades.ts`

```ts
export type RoutedTrade = {
  blockHeight: number
  eventIndex: number
  extrinsicIndex: number | null
  timestamp: number          // ms epoch
  assetIn: string
  amountIn: string           // raw on-chain integer, as a string
  assetOut: string
  amountOut: string
}

routedTradesQuery(client, { account, assetIds, page, pageSize })
  -> { items: RoutedTrade[]; totalCount: number }
```

`packages/indexer/src/neckwork/dca.ts`

```ts
export const DCA_STATUSES = ["created", "completed", "terminated", "cancelled"] as const
export type DcaStatus = (typeof DCA_STATUSES)[number]
export const DCA_OPEN_STATUSES    = ["created"] as const
export const DCA_HISTORY_STATUSES = ["completed", "terminated", "cancelled"] as const

export type DcaSchedule = { scheduleId: number; assetIn: string; assetOut: string
  singleTradeAmount: string; budget: string; isRollingBudget: boolean
  executedAmountIn: string; executedAmountOut: string; periodBlocks: number
  status: DcaStatus; createdAt: number; lastEventAt: number | null }

export type DcaExecution = { status: "executed" | "failed" | "planned"
  amountIn: string | null; amountOut: string | null
  blockHeight: number; eventIndex: number; timestamp: number
  errorState: { kind: string; error: string; index: number } | null }

dcaSchedulesQuery(client, { owner, statuses, assetIds, page, pageSize })
  -> { items: DcaSchedule[]; totalCount: number }
dcaSchedulesCountQuery(client, { owner, statuses, assetIds })
  -> number
dcaExecutionsInfiniteQuery(client, { scheduleId })
  -> pages of { items: DcaExecution[]; totalCount: number; assetIn: string; assetOut: string }
```

Both files re-export from `index.ts` alongside `accounts`/`fees`/`pools`/`prices`/`stats`. The status literal unions and `DCA_*_STATUSES` live in the package rather than the app, because they *are* the API's vocabulary — the app's own `DcaScheduleStatus` mapping sits on top ([Open Orders](59-open-orders-status.md)).

### Signatures and keys

**Params objects, not positional args.** `accountsBalancesQuery(client, publicKeys)` gets away with positional because it has one argument; these have four, two of them optional-ish, and `feesChartQuery` / `pairCandlesInfiniteQuery` already set the newer convention.

**Keys** are the package's `["neckwork", …]` shape prefixed with `QUERY_KEY_BLOCK_PREFIX` for the three live lists:

```
[QUERY_KEY_BLOCK_PREFIX, "neckwork", "routedTrades",      account, assetIds, page, pageSize]
[QUERY_KEY_BLOCK_PREFIX, "neckwork", "dcaSchedules",      owner, statuses, assetIds, page, pageSize]
[QUERY_KEY_BLOCK_PREFIX, "neckwork", "dcaSchedulesCount", owner, statuses, assetIds]
[                        "neckwork", "dcaExecutions",     scheduleId]
```

This is the first use of the block prefix in the neckwork package — deliberate, and the reason is in [Open Orders](59-open-orders-status.md): `useInvalidateOnBlock()` is mounted app-wide at `routes/__root.tsx:97` and invalidates everything under that prefix on each new block, which is how a cancelled order disappears without a bespoke invalidation path. All four routes answer `cache-control: public, max-age=3` — about one parachain block — so the server expects exactly this cadence.

**`staleTime`:** omitted (0) on the three lists, letting block invalidation drive the refetch. `NECKWORK_STALE_TIME` (60 s) is **not** used for them — it is right for pools and fees, wrong for a feed where a 60 s stale window shows a cancelled order as live.

**Executions are the exception: no block prefix, `staleTime: NECKWORK_STALE_TIME`.** It is an infinite query inside a modal — block invalidation would refetch every loaded page every 6 s, and a schedule executing once per `periodBlocks` (600 blocks, about an hour on the sampled owner) has nothing to say at that cadence.

### Mapping, and how much of it the package owns

The package converts and renames; it does not scale. Following `prices.ts` (`volumeUsd` -> `volume`, ISO timestamp -> epoch), the mapper turns `timestamp` / `createdAt` / `lastEventAt` into ms epoch numbers and hands amounts back as **raw strings** — scaling needs `decimals` from the app's asset registry, so `scaleHuman` stays in the app hook ([Open Orders](59-open-orders-status.md)).

Every response array goes through `Array.from(...)` before `.map` — `--immutable` codegen types them `readonly T[]`, which breaks openapi-fetch's `Readable<T>` helper (see `packages/indexer/CLAUDE.md`). Each `queryFn` keeps the `if (!data) throw` guard; HTTP failures are already `NeckworkApiError` via the client's middleware.

**Three fields are dropped from `RoutedTrade` rather than carried:** `swapper` (always the account we filtered on), `operationType` (null on **512 of 800** sampled rows, and nothing renders it), and `dca` (provably always null on this feed — [the recent-activity ticket](58-recent-activity-dca-gap.md) measured 0 across 2,117 rows). Carrying a field no consumer reads invites someone to build on it.

### Pagination

`page` is the 0-based `pageIndex` from `useDataTableUrlPagination`, so `offset = page * pageSize`, `limit = pageSize`. `assetIds` empty -> the `assets` param is omitted entirely rather than sent blank. All three list factories take `enabled: !!account`, matching Squid's `enabled: !!address` — `safeConvertSS58toPublicKey` returns `""` when there is no wallet or the conversion fails.

**No offset cap, no clamp.** The schema declares `offset` `maximum: 10000` on `/v1/trades/routed` and the server **does not enforce it** — offsets of 10,001 / 50,000 / 211,510 all return 200 with real rows, and 300,000 returns an empty `items` with a truthful `totalCount`. So deep pages work. One sampled account has 211,519 trades, meaning `DataTable` will advertise about 21,000 pages of 10 — which is exactly what the Squid path advertises today from Squid's own `totalCount`. Inventing a cap here would be a new product decision dressed up as plumbing, for a wart nobody has reported.

`useInfiniteQuery` for executions pages at **200** (the route's max) with `initialPageParam: 0`, and `getNextPageParam` comparing rows loaded so far against `totalCount` — offset-based, not cursor-based, since the route has no cursor.
