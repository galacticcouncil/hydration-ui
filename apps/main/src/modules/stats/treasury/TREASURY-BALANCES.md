# Treasury Stats — Balance Display & Data Flow

Overview of how balances are fetched, calculated, and shown on the **Stats → Treasury** page.

---

## Is the data realtime?

**Live on-chain / protocol data, but not a live stream.**

Balances are loaded through **TanStack React Query** when you open the page (and again on window focus, remount, or reconnect). There is **no background polling interval** on the treasury query itself — numbers update when a fresh fetch runs, not continuously every block.

| Source | What it reads | Refresh behavior |
|--------|----------------|------------------|
| Wallet balances | Substrate RPC (`papi`) — `System.Account`, `Tokens.Accounts` | Fetched per query run |
| USD values | SDK router spot price vs display asset | Fetched per query run |
| Aave supply / borrow | `useUserBorrowSummary` (money-market contracts) | Fetched per query run |
| Tile colors | Saved palette JSON first; logo dominant colors only for missing/future assets | Cosmetic only |

**Treasury address (hardcoded):** `13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB`

---

## Data model

Each row is a `TreasuryAssetBalance`:

| Field | Meaning |
|-------|---------|
| `balance` | Human-readable token amount |
| `valueUsd` | USD value (spot price × balance, or Aave-reported USD) |
| `share` | % of total **holdings** (before subtracting borrows) |
| `source` | `wallet` · `moneyMarketSupply` · `moneyMarketBorrow` · `mixed` |

### Aggregation (`useTreasuryStats`)

1. **Wallet** — all non-receipt tokens with on-chain balance > 0, priced via spot.
2. **Supply** — Aave supplied positions merged into the same asset row when applicable (`mixed` if wallet + supply).
3. **Borrow** — separate `borrowPositions` list; subtracted from totals.
4. **Receipt tokens** (e.g. aTokens) — excluded from the main asset list; underlying comes from Aave supply data.

### Totals

- **Holdings** = wallet + supply (merged per asset)
- **Borrow** = sum of borrow positions
- **Treasury value (net)** = holdings − borrow

---

## Where balances appear in the UI

### 1. Top KPIs (`ValueStats`)

All USD, via `formatCurrency`:

| KPI | Calculation |
|-----|-------------|
| Treasury value | Net total (`totalValueUsd`) |
| Liquidity positions | Sum of XYK share + stablepool token USD values |
| Borrow/supply | Aave supply USD − borrow USD |
| Priced assets | Count of assets with a USD price |

### 2. Composition grid (tiles)

**USD + composition % only** (no token amounts on the tile):

- **Top:** compact USD — `formatCompositionUsd` (e.g. `$1.43M`)
- **Bottom:** share % — `formatSharePercent` (tiered decimal precision)

**Hover tooltip** (per asset): symbol, name, token balance, USD, composition %.

**Others tile:** aggregates holdings below **$600** USD (and some forced symbols). Wide multi-column tooltip lists each asset with USD + %.

**Tile layout:** share-based grid (`compositionGridLayout.ts`) — larger holdings get wider desktop tiles (e.g. tBTC, sUSDS, 2-Pool-GETH; USDT only if ≥ $1M).

### 3. Tables

Both **All treasury assets** and **Treasury positions** use the shared **`Amount`** component (same pattern as My Assets / Positions):

```
1,913,839,917 HDX      ← token amount (top, primary)
$12,546,935.77         ← USD (bottom, muted)
```

| Table | Desktop columns | Mobile |
|-------|-----------------|--------|
| All assets | Asset · Balance · Composition % | Asset · Balance (right-aligned stack) |
| Positions | Position · Balance | Position · Balance |

Borrow rows show USD with a **`-`** prefix.

### 4. Formatting helpers

| Helper | Used for | Rules |
|--------|----------|-------|
| `formatTokenAmount` | Tables, tooltips | Compact notation if ≥ 1M; up to 4 / 8 decimals |
| `formatCurrency` | KPIs, tables, tooltips | `$` + compact if ≥ 1M |
| `formatCompositionUsd` | Grid tiles | Always compact USD |
| `formatSharePercent` | Grid + composition column | 1–4 decimal places by magnitude |

---

## Key files

| File | Role |
|------|------|
| `apps/main/src/api/treasury.ts` | RPC balance fetch, spot pricing, Aave merge, totals |
| `apps/main/src/modules/stats/treasury/StatsTreasury.tsx` | UI, formatters, tables, tooltips, KPIs |
| `apps/main/src/modules/stats/treasury/compositionGridLayout.ts` | Tile sizes & desktop stretch rules |
| `apps/main/src/modules/stats/treasury/useCompositionAssetColors.ts` | Tile background colors (saved palette + fallback extraction) |
| `apps/main/src/modules/stats/treasury/compositionAssetColors.json` | Saved tile colors for known treasury assets |
| `apps/main/scripts/generate-treasury-composition-colors.mjs` | Regenerates saved colors when tracked assets change |
| `apps/main/src/modules/stats/treasury/StatsTreasury.styled.ts` | Grid, tooltips, tile typography |

---

## Summary

- **Yes** — numbers reflect current chain state and live spot / Aave data at fetch time.
- **No** — not a websocket or per-block auto-refresh; updates when React Query refetches (load, focus, reconnect, invalidation).
- **Grid** = USD overview + %; **tables & tooltips** = token amount + USD stack via `Amount`.
