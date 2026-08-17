---
id: 67
title: "Replace the trade order tabs with the neckwork API behind useNeckworkEnabled"
labels: [ready-for-agent]
state: open
parent: 57
blocked_by: []
assignee: ralph
github:
---

## Task

**PRD:** [`scripts/ralph/PRD-neckwork-order-tabs.md`](../../scripts/ralph/PRD-neckwork-order-tabs.md)
— problem statement, 44 user stories, implementation decisions, the testing seam, and
what is out of scope.

**Execution:** `scripts/ralph/prd.json`, 11 stories on branch `feat/neckwork-api`, run by
Ralph (`scripts/ralph/ralph.sh`). Story checklist mirrors to `IMPLEMENTATION_PLAN.md`.

Every decision the PRD draws on is closed on the map,
[Map: trade order history from Squid to the neckwork API](../map-57.md), across its nine
tickets. The commit-shaped plan those tickets produced is
[ticket 66](66-implementation-plan.md); `prd.json` is that plan split to one-iteration
stories.

## Scope

My Recent Activity, Open Orders, Order History — new components behind
`useNeckworkEnabled()`. Market Transactions stays on Squid. Nothing on the Squid path is
deleted.

## The regression gate

US-003 and US-004 are the only stories that touch code the Squid path executes (lifting
the badge count to a prop; making the past-executions list presentational). US-011's
final criteria re-check the Squid path with the flag off. Note the flag defaults **on** in
both env files, so Squid is the case that must be selected deliberately.

## No automated tests

This repo has no test runner. The gate is `yarn build` then `yarn lint` from the root, in
that order. The seam that carries the verification weight is the three existing row types
(`RoutedTradeData`, `OrderData`, `PastExecutionData`) — the neckwork hooks return those
same shapes, so the type-checker proves the existing columns and modals can render them.
Value-level and freshness checks are the manual list in the PRD's Testing Decisions.
