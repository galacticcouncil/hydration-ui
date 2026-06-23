# Treasury Stats

Compact reference for how **Stats -> Treasury** builds the treasury balance view.

## Tracked Accounts

The page tracks these hardcoded treasury accounts in `apps/main/src/api/treasury.ts`:

| Account | Address | Used for |
|---|---|---|
| Hydration treasury | `13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
| HOLLAR collector treasury | `0x8C0f3b9602374198974d2B2679d14a386f5b108e` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
| Money market treasury | `0xE52567fF06aCd6CBe7BA94dc777a3126e180B6d9` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
| Polkadot Asset Hub staking address | `13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg` | Asset Hub native DOT balance |
| Polkadot Asset Hub rewards address | `14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8` | Asset Hub native DOT balance |

EVM treasury addresses are converted to Hydration SS58 before reading normal on-chain wallet balances.

## Data Sources

Data is live at fetch time, but not streamed every block. React Query refetches on the usual page lifecycle events such as load, focus, reconnect, remount, or invalidation.

| Source | Data |
|---|---|
| Substrate RPC (`papi`) | `System.Account` for HDX, `Tokens.Accounts` for other wallet balances |
| Substrate RPC (`papi`) | Treasury-owned omnipool position NFTs and omnipool liquidity-mining NFTs |
| Substrate RPC (`papi`) | Treasury-owned XYK liquidity-mining NFTs |
| Asset Hub RPC | Native DOT balances for the tracked Asset Hub staking/rewards addresses |
| SDK router spot price | USD value for wallet balances |
| `useUserBorrowSummary` | Money-market supplied collateral and borrow positions |
| `compositionAssetColors.json` | Saved tile colors for known assets; logo extraction is only a fallback for new assets |

## Aggregation Rules

`useTreasuryStats` returns:

| Field | Meaning |
|---|---|
| `assets` | Treasury holdings: wallet balances + liquidity positions + supplied collateral merged by asset id |
| `borrowPositions` | Borrow exposure, kept separate and subtracted from totals |
| `holdingsValueUsd` | Wallet + liquidity positions + supplied collateral |
| `borrowValueUsd` | Sum of borrow positions |
| `totalValueUsd` | Net value: holdings minus borrow |

Each `TreasuryAssetBalance` carries a `breakdown`:

| Breakdown key | Meaning |
|---|---|
| `wallet` | Not supplied; shown as `Offchain` unless the asset itself is a liquidity/share token |
| `moneyMarketSupply` | Supplied as collateral |
| `liquidity` | Underlying value expanded from wallet-held LP/share tokens and treasury-owned omnipool positions |
| `moneyMarketBorrow` | Borrowed exposure |

Wallet-held XYK share tokens, farmed XYK share positions, stablepool shares, and treasury-owned omnipool positions are expanded before merging. The original share token row is omitted when expansion succeeds, so assets like PAXG inside a treasury LP position contribute to the PAXG tile/table row as `Supplied as liquidity` instead of being hidden behind the LP token.

Omnipool position value uses only `calculate_liquidity_out` for the deposited asset leg. The H2O/LRNA hub leg from `calculate_liquidity_lrna_out` is intentionally not added to Treasury holdings.

Borrow positions are kept separate from holdings and subtracted from `totalValueUsd`. Receipt tokens with an `underlyingAssetId` are ignored in wallet holdings, so supplied collateral comes from money-market data once instead of being double-counted through receipt balances.

Hollar pool assets `110`-`113` are displayed as `HUSDC`, `HUSDT`, `HUSDS`, and `HUSDE` in Treasury stats instead of their raw `2-Pool-*` registry names.

This differs from the connected wallet balance card. The wallet `Asset balance` card is for the active account only and only sums token + ERC20 wallet balances; liquidity is shown in a separate wallet card and supplied collateral is not included there. Treasury stats aggregate all tracked treasury accounts and include wallet balances, expanded liquidity, and supplied collateral. Borrow is aggregated for those tracked accounts and deducted only in `totalValueUsd`.

## UI Rules

### Composition Tiles

- Tiles show grouped USD value and treasury composition %.
- Top-level tiles require at least `$15k` USD value; smaller assets are grouped into `Others`.
- Tile size is chosen from balance/share ranges so larger holdings get more width and/or height while the grid keeps the same row cap.
- Assets with the same symbol, such as multiple `USDC` variants, are grouped into one tile.
- The grouped tile/header hides the origin chain badge to avoid implying only one origin.
- The grouped tooltip shows each underlying asset with its origin chain badge, amount, and USD value.
- On mobile/tablet, composition tiles open the same detail content in a drawer instead of relying on hover.
- Supplied/liquidity/offchain details are summarized once in the grouped asset breakdown below the constituent list:
  - `Supplied as collateral`
  - `Supplied as liquidity`
  - `Offchain`
- Tooltip amounts are intentionally rounded/compacted earlier than table values so very large balances remain scannable.
- The `Others` tile groups tiny/forced assets for layout readability.

### Local Visual Token Rules

- Prefer shared app tokens for spacing, radius, typography, surfaces, separators, and text colors.
- Keep treasury-only composition tile tuning local to `StatsTreasury.styled.ts` unless the shared UI token schema is also updated and regenerated.
- Do not read unpublished theme paths such as `theme.charts.colors.treasury.*`; CI build type-checks the generated theme schema and will fail if the key is not generated.
- Keep color mixing in OKLCH for composition tile fills and borders so light/dark contrast stays predictable.
- Store known asset tile base colors in `compositionAssetColors.json`; logo color extraction is only a fallback for new assets.
- When changing local visual tokens, run `yarn build` in addition to `yarn lint` because build catches generated-theme type mismatches.

### All Treasury Assets Table

- Shows asset-level rows, not symbol-grouped rows.
- Desktop columns: `Asset`, `Balance`, `Of which supplied`, `Composition`.
- Mobile columns: `Asset`, `Balance`.
- Uses the shared pagination control with 20 assets per page.
- Header search filters by asset symbol or name.

## Key Files

| File | Role |
|---|---|
| `apps/main/src/api/treasury.ts` | Account list, RPC reads, spot pricing, money-market merge, totals |
| `apps/main/src/modules/stats/treasury/StatsTreasury.tsx` | Treasury UI, grouping, tooltips, table rows, KPI values |
| `apps/main/src/modules/stats/treasury/StatsTreasury.styled.ts` | Treasury layout, tiles, tables, tooltip styling |
| `apps/main/src/modules/stats/treasury/compositionGridLayout.ts` | Composition tile sizing rules |
| `apps/main/src/modules/stats/treasury/compositionAssetColors.json` | Saved tile colors for known treasury assets |
| `apps/main/src/modules/stats/treasury/useCompositionAssetColors.ts` | Reads saved colors and falls back for unknown assets |
| `apps/main/scripts/generate-treasury-composition-colors.mjs` | Regenerates saved tile colors when tracked assets change |
