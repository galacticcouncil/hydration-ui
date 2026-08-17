---
id: 58
title: "What My Recent Activity shows when neckwork can't see DCA executions"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: []
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/58
---

## Question

Participant-scoped `/v1/trades/routed` returns no DCA execution rows — confirmed empirically (see the map's Notes). Today's Squid tab renders both market swaps and DCA executions in one paginated list, with a `type` column (`market` / `dca` / `dcaRolling`) and a DCA-aware `status` cell carrying `sold`/`total`/`symbol` from the parent schedule.

So what does the neckwork My Recent Activity tab show? Market swaps only, and the `type`/`status` columns collapse? Or a client-side merge of `/v1/trades/routed` with the owner's schedules and their executions — and if so, how does one page of a merged, two-source, differently-paginated feed stay coherent?

Decide the shown row set, the column set that survives, and whether the merge is built. Name what a user loses on the neckwork path if it isn't.

## Resolution

**Market swaps only. No client-side merge. The `type` column is dropped; the status column stays.**

The gap is structural, not a sampling artifact. Across 5 owners holding **179 DCA schedules** between them, **2,117 participant-scoped trade rows** were sampled and **not one** carried `dca != null`:

| owner | schedules | trades sampled | totalCount | rows with `dca` |
|---|---|---|---|---|
| `0x45544800a5…` | 18 | 7 | 7 | 0 |
| `0xfc39fcf04a…` | 8 | 600 | 211,519 | 0 |
| `0x41ddf2ded4…` | 101 | 321 | 321 | 0 |
| `0x1493dedf1c…` | 41 | 589 | 589 | 0 |
| `0xb81d772dc8…` | 11 | 600 | 41,814 | 0 |

One of those owners has 2 live rolling schedules with **914 executions** on a single schedule — none reachable through `participant=`. On the global feed those same rows name the *pallet* as `swapper` (`0x6d6f646c70792f747273727900…` = `modlpy/trsry`), so no participant filter can ever reach them. This is the account-first model working as designed, not a bug to route around.

**The merge was considered and rejected.** Reconstructing the Squid feed means: fetch the owner's schedules, then fetch executions per schedule, then interleave by timestamp. For the 101-schedule owner that is 101+ requests to render page 1, and it still doesn't hold together — two sources with independent `limit`/`offset` cannot produce a coherent page 2 without materialising both feeds client-side. `totalCount` would be a fiction. The cost is unbounded fan-out for a tab that is one of four.

**What the user loses:** DCA executions no longer appear in the activity feed. They are not lost from the product — every one is on **Open Orders** (live schedules) and **Order History** (finished ones), and the details modal's `PastExecutions` lists each execution with amounts, timestamp, status and explorer link. What's lost is specifically the *chronological interleaving* of "my swaps and my DCA fills in one list". Accepted: the map's Notes already rule parity a preference, and the tab's honest name under neckwork is "my market swaps".

**Column set.** `dca` is provably always null on this feed, so `SwapType` would render the same `market` chip on every row forever — a constant column earning table width. **Drop it**, and with it the DCA branch of the status cell (`DcaOrderStatus`, `MyActivityDcaOrderStatus`, and the `sold`/`total`/`symbol` fields that only existed to feed it). Keep `SwapStatus` — it is always `filled`, but it is the cell users read to confirm a trade landed, and its absence reads as missing information rather than as simplification.

Surviving desktop columns: **from/to** (`SwapAmount`), **fill price** (`SwapPrice`, computed `amountIn/amountOut` as today), **status** (`SwapStatus`), **actions** (explorer link — see [Explorer links from neckwork trade and execution rows](61-explorer-links.md)). Mobile keeps its single `SwapMobile` expand column unchanged.

**Consequences for other tickets:**
- The row type is flat: no `status: OrderStatus | null` union, just the trade. `OrderStatus`/`MarketSwapStatus`/`MyActivityDcaOrderStatus` do not come along — which removes the DCA branch from `SwapDetailsModal` on the neckwork path ([Details modals](65-details-modals.md)).
- `operationType` is *not* rendered (the Squid tab didn't either), so the fact that it is frequently null costs nothing here.

**Unplanned finding, for [the query layer](62-query-layer.md):** the schema's `offset` `maximum: 10000` on `/v1/trades/routed` **is not enforced by the server**. `offset=10001`, `50000` and `211510` all return 200 with real rows; `300000` returns an empty `items` with the true `totalCount`. Deep pagination therefore works to the end of the set — but one sampled account has 211,519 trades, so `DataTable`'s `rowCount` will advertise ~21,000 pages of 10. Whether to cap that is #62's call.
