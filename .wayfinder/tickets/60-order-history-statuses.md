---
id: 60
title: "Order History's status set, and what cancelled means now"
labels: [wayfinder:grilling]
state: closed
parent: 57
blocked_by: []
assignee: agent (autonomous)
github: https://github.com/emildoescode/hydration-ui/issues/60
---

## Question

Squid's Order History asks for `[Completed, Terminated]` and then derives `Cancelled` client-side from whether the last execution event was still `Planned`. Neckwork distinguishes all four server-side, from a better signal: `cancelled` means a `DCA.Terminated` from a *signed* extrinsic (the owner's own `dca.terminate`), `terminated` means the pallet ended it on an error.

Which statuses does the neckwork Order History tab request? Does the three-way `completed`/`cancelled`/`terminated` distinction reach the UI, or does `DcaOrderStatus` keep rendering the two labels it has today? And does the tab's ordering change — neckwork sorts by most recent event first, with event-less schedules last.

## Resolution

**Request `status=completed,terminated,cancelled`. Pass all three through to the UI. Ordering does not change.**

The comma-separated filter works as documented — for the 101-schedule owner, `status=completed,terminated,cancelled` returns `totalCount: 99`, exactly the 101 minus the 2 `created`. So Order History is one query with three statuses, and Open Orders is the same query with `status=created`; they stay the single-endpoint pair the Squid path had.

**The three-way distinction reaches the UI, and costs nothing to show.** `DcaOrderStatus` *already* has three distinct branches — `terminated` and `cancelled` both in `accents.danger.secondary` with different labels, `completed` in `text.tint.quart` — and three `trade.orders.status.*` i18n keys to match. The Squid path derives `Cancelled` from a heuristic and can only ever be approximately right; neckwork hands over the real distinction (`cancelled` = the owner's own signed `dca.terminate`, `terminated` = the pallet ending it on an error). So the neckwork tab is *more* accurate with **no component change**.

Both populations are real, not theoretical — that one owner's 101 schedules break down as **82 completed, 15 cancelled, 2 terminated, 2 created**. The two `terminated` rows are ones today's UI would very likely mislabel.

**Ordering is already identical.** Squid's `UserOrders` sorts by `DCA_SCHEDULE_EVENTS_BY_SCHEDULE_ID_MAX_PARA_BLOCK_HEIGHT_DESC` — max event block, descending. Neckwork sorts by most recent event first. Same thing, and the returned `lastEventAt` sequence confirms it. No sort to add client-side, and no page-order surprise when switching paths.

**The event-less-last quirk is theoretical.** Neckwork sorts a schedule with no events last, which for Open Orders would bury a just-created order at the bottom. In practice the pallet emits `DCA.ExecutionPlanned` at creation, so `lastEventAt` is populated immediately — **0 of 101** sampled schedules had it null. Not worth designing around; noted in case a future pallet change makes it real.

**Filter-and-then-page is server-side and safe.** The endpoint's prose is explicit that status filtering and ordering are computed over the owner's whole set *before* the page is cut, which is why `owner` is required. So page 2 of Order History is stable — unlike a naive filter-after-limit, and unlike anything the client could assemble itself.
