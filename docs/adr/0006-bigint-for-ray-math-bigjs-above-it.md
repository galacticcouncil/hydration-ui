# Ray/wad math uses bigint; Big.js starts at the normalized layer

The brief for `money-market-v2` said Big.js for all math. That is right for the
normalized layer and wrong for the ray/wad layer, because ray/wad arithmetic is
integer arithmetic — Solidity has no decimals. Aave's libraries use BigNumber.js
only because they predate `bigint` being usable.

The mismatch is concrete. Aave's entire ray layer rests on
`BigNumberZeroDecimal`, a `BigNumber.clone({DECIMAL_PLACES: 0, ROUNDING_MODE:
ROUND_DOWN})` whose instances truncate on every operation. Big.js has no
per-instance configuration and no subclassing API, so the only ports are
mutating global `Big.DP`/`Big.RM` — which races with unrelated Big.js math
elsewhere in this repo — or appending `.round(0, Big.roundDown)` at every
truncation site and never once forgetting. `bigint` is exact by construction,
with no rounding configuration to get wrong and no notation thresholds, and viem
already returns it.

So: **`bigint` through the ray/wad layer, `Big.js` for normalized decimal values,
plain fixed-point strings at the boundary.** Strings are always produced with
`toFixed`, never `toString`, so neither library's scientific-notation threshold
can leak into output. Global `Big.DP` and `Big.RM` are never mutated.

## Consequences

**Upstream's rounding is not replicated exactly.** The blueprint is internally
inconsistent — `rayMul`/`rayDiv` truncate via the cloned constructor, while
`wadToRay` uses bare `.decimalPlaces(0)` and so picks up BigNumber.js's global
ROUND_HALF_UP. v2 truncates everywhere, matching what the contracts do.

This means **some of Aave's own test fixtures will not pass unmodified**, and
the differences are real, not noise: expect last-digit divergence on wad/ray
conversions. Whoever sets the test strategy must decide per fixture whether a
mismatch is this deliberate divergence or a porting bug, rather than adjusting
expected values until things go green.

**The `-1` health-factor sentinel is kept**, matching upstream
`calculateHealthFactorFromBalances`, so health-factor fixtures port cleanly. It
means exactly one thing in v2 — no debt, so the health factor is unbounded. It
must never be reused for "no user"; v1 does exactly that
(`DashboardHeader.tsx:43` passes `"-1"` when no wallet is connected), which is
why v1 needs six defensive `-1` checks. In v2 there is no `Account` without a
user, so that second meaning has nowhere to arise.
