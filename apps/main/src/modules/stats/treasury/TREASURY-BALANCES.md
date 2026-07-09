# Treasury Stats

Compact reference for how **Stats -> Treasury** builds the treasury balance view.

## Tracked Accounts

The page tracks these hardcoded treasury accounts in `apps/main/src/api/treasury.ts`:

| Account | Address | Used for |
|---|---|---|
| Hydration treasury | `13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
| HOLLAR collector treasury | `0x8C0f3b9602374198974d2B2679d14a386f5b108e` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
| PRIME looped position | `15qyoAjtLwtu7stVJ5qdsj7QJsfaxQEU3ZrihHExzC6hQyHA` | Wallet balances, omnipool liquidity positions, money-market supply, money-market borrow |
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
| `borrowPositions` | Borrow exposure kept separate and subtracted from totals; debt-netted account borrows are only listed here when they exceed supplied collateral |
| `holdingsValueUsd` | Gross treasury assets: wallet + liquidity positions + supplied collateral, before residual borrow subtraction |
| `borrowValueUsd` | Raw money-market borrow value that still needs to be subtracted from holdings |
| `totalValueUsd` | Net value: holdings minus borrow |

Each `TreasuryAssetBalance` carries a `breakdown`:

| Breakdown key | Meaning |
|---|---|
| `wallet` | Plain treasury wallet balance; shown as `Asset balance` in UI details unless the asset itself is a liquidity/share token |
| `offchain` | Treasury balances held outside Hydration, currently Asset Hub DOT accounts |
| `moneyMarketSupply` | Supplied as collateral |
| `liquidity` | Underlying value expanded from wallet-held LP/share tokens and treasury-owned omnipool positions |
| `moneyMarketBorrow` | Borrowed exposure |

Wallet-held XYK share tokens, farmed XYK share positions, stablepool shares, and treasury-owned omnipool positions are expanded before merging. The original share token row is omitted when expansion succeeds, so assets like PAXG inside a treasury LP position contribute to the PAXG tile/table row as `Supplied as liquidity` instead of being hidden behind the LP token.

Treasury-owned Omnipool positions for Giga assets are normalized from the position asset id into the displayed treasury asset id before merging:

| Omnipool position asset | Display/merge asset |
|---|---|
| `GDOT_ERC20_ID` | `GDOT_ASSET_ID` |
| `GETH_ERC20_ID` | `GETH_ASSET_ID` |
| `GSOL_ERC20_ID` | `GSOL_ASSET_ID` |

This matters because the NFT position can be recorded against the ERC20 leg, while the Treasury UI displays and totals the Giga stableswap/display asset. Without this mapping, assets such as GETH can show their collateral but miss the Omnipool liquidity bucket.

Omnipool position value uses only `calculate_liquidity_out` for the deposited asset leg. The H2O/LRNA hub leg from `calculate_liquidity_lrna_out` is intentionally not added to Treasury holdings.

Receipt tokens with an `underlyingAssetId` are ignored in wallet holdings, so supplied collateral comes from money-market data once instead of being double-counted through receipt balances. If a receipt token has no matching money-market supply row, only the remaining unmatched receipt balance is added as a fallback supplied position.

Borrow accounting rule:

- Raw money-market borrow USD totals are the accounting source of truth.
- Mapped `borrowPositions` are presentation rows only. They can miss debts whose reserve asset is not present in the local asset registry, so they must not be the source of `borrowValueUsd`.
- `totalValueUsd = holdingsValueUsd - borrowValueUsd`.
- The net treasury value KPI tooltip also uses raw residual borrow value, not the sum of displayable borrow rows.

Debt-netted money-market rule:

- Accounts with `netMoneyMarketBorrows: true` pro-rata their raw money-market debt across supplied collateral.
- All tracked Hydration treasury wallets currently use this rule: main treasury, HOLLAR collector treasury, PRIME pure proxy, and money market treasury.
- Their supplied collateral is reduced by the account's raw borrow value before entering `assets`, composition tiles, and the All treasury assets table.
- If supplied collateral is larger than debt, the remaining supplied value is shown as the asset's net contribution. The tooltip/table details still show gross `Supplied as collateral` and the negative `Collateral used by debt`.
- If debt is larger than supplied collateral, supplied assets are removed and only the residual raw debt remains in `borrowValueUsd`; mapped borrow rows are scaled for display when possible.
- This prevents debt-backed collateral, including HOLLAR debt that may not map to a local asset row, from inflating treasury composition.

Hollar and Giga pool assets are displayed with short stable labels in Treasury stats instead of raw registry names. This includes Hollar pool assets such as `HUSDC`, `HUSDT`, `HUSDS`, `HUSDE`, and also `HEURC`, `GDOT`, `GETH`, and `GSOL`.

This differs from the connected wallet balance card. The wallet `Asset balance` card is for the active account only and only sums token + ERC20 wallet balances; liquidity is shown in a separate wallet card and supplied collateral is not included there. Treasury stats aggregate all tracked treasury accounts and include wallet balances, expanded liquidity, and supplied collateral. Borrow is aggregated for those tracked accounts and deducted only in `totalValueUsd`.

## UI Rules

### Top KPI

- The visible header KPI is `Net treasury value`.
- `Net treasury value = holdingsValueUsd - borrowValueUsd`.
- Gross assets are not shown as a separate top KPI. If needed, `holdingsValueUsd` is the gross asset figure and excludes borrow because borrow is a liability.
- The KPI tooltip expands the accounting into:
  - `Asset balance` for plain treasury wallet holdings
  - `Offchain` for treasury balances outside Hydration
  - `Supplied as liquidity`
  - `Supplied as collateral`
  - `Borrowed`
  - `Total holdings`
  - `Net treasury value`
- `Asset balance` in this tooltip means treasury wallet balances only; it does not include liquidity positions, supplied collateral, or borrows.

### Composition Tiles

- Tiles show grouped USD value and treasury composition %.
- Top-level tiles require at least `$15k` USD value; smaller assets are grouped into `Others`.
- Tile size is chosen from balance/share ranges so larger holdings get more width and/or height while the grid keeps the same row cap.
- Assets with the same symbol, such as multiple `USDC` variants, are grouped into one tile.
- The grouped tile/header hides the origin chain badge to avoid implying only one origin.
- The grouped tooltip shows each underlying asset with its origin chain badge, amount, and USD value.
- On mobile/tablet, composition tiles open the same detail content in a drawer instead of relying on hover.
- Supplied/liquidity/offchain details are summarized once in the grouped asset breakdown below the constituent list:
  - `Asset balance`
  - `Supplied as collateral`
  - `Supplied as liquidity`
  - `Offchain`
- Tile USD values use compact currency formatting with at most 2 decimals.
- Tooltip and drawer token amounts compact at 1k+ and use up to 2 decimals for normal values, with extra precision only for values below 1.
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
- Desktop columns: `Asset`, `Total net value`, `Composition`, and a chevron affordance.
- Rows expand on whole-row click and use the same active row state and unfold/fold pattern as wallet asset rows.
- Expanded desktop details are grouped into:
  - an untitled top row with `Total balance` or `Total net value`
  - `Collateral / debt`
  - `Breakdown` or `Other balances`
- `Total balance` is used when the asset has no debt-offset row. `Total net value` is used when money-market debt has reduced the asset contribution.
- `Collateral used by debt` replaces the old `Debt offset` wording. It shows the supplied-collateral value reserved against account borrows and is displayed as USD-only because the borrowed assets can come from the full collateral basket, not necessarily the same asset.
- `Breakdown` is used when visible non-money-market buckets (`Asset balance`, `Supplied as liquidity`, `Offchain`) fully explain the asset total, or when one of those buckets is the whole balance.
- `Other balances` is used when those buckets are extra balance sources beside collateral/debt, for example a row that has both net collateral and Omnipool liquidity.
- `Asset balance` shows only normal Hydration wallet-held tokens.
- `Offchain` shows only balances held outside Hydration, not normal Hydration wallet balances.
- Smartphone layouts show only `Asset` and `Total net value`; tapping a row opens the same asset detail drawer body used by composition tile details.
- `Total net value` uses the same shared `Amount` component as the rest of the app.
- Table token values compact at 1k+ and show at most 2 decimals. Table USD display values use compact currency formatting with at most 2 decimals, matching composition tiles.
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
