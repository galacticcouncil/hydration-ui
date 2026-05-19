# HDCL UI Handover

Companion to `aave-v3-deploy/HDCL-MAINNET-HANDOVER.md`. That doc is the
authoritative runbook for the on-chain side (vault, Aave pool, governance
proposal). This one captures **where the UI is**, what's wired, what's
stubbed, and the gotchas that bit us during the build — so a fresh context
window can pick up the next stage of UI work without re-deriving everything.

## TL;DR

- Codebase: `galacticcouncil/hydration-ui`, branch **`feat/hdcl-vault`**, base `next`. PR #3606.
- All HDCL UI lives at `apps/main/src/modules/hdcl-vault/`. Routed at `/hdcl-vault`.
- **End-to-end working on 0.lark**: deposit, withdraw (queue), cancel, instant redeem (modal-input, liquid aHDCL → HOLLAR), borrow modal, all the read views.
- **Stubbed**: mainnet env switch + feature flag (Phase 9, blocked on
  mainnet governance). Per-row instant exit on a queued request is **not**
  implemented — blocked by an SDK limitation (lesson 11); workaround is
  Cancel + modal-instant.
- **i18n done** — `apps/main/src/i18n/locales/en/hdcl.json` covers all
  user-visible strings, `hdcl` namespace registered, every component
  uses `useTranslation("hdcl")`.
- **Live LTVs done** — `useHdclReserveConfig` decodes `getConfiguration`
  bitmap (bits 0-15 LTV, 16-31 liqThreshold) from the HDCL pool;
  `STRATEGY` config remains as a first-paint fallback only.
- **previewDeposit / previewRedeem wired** — Total fees row in DepositPanel
  + WithdrawModal computes `input − output × rate` from on-chain preview
  (debounced 250ms via `use-debounce`).
- All edits in this branch are **uncommitted local WIP** — the user's
  policy is no auto-push; commits are made by hand.
- Design source of truth: 5 Figma surfaces in file `bTJRKXVmuqZ0v4KY63TyK1`
  (Money Market). Reference patterns: PR #3579 (`feat/looping`) Multiply
  module — for layout shells, modal primitive usage, form stack. **Don't
  copy visuals from #3579, copy patterns; visuals come from Figma.**

## What works end-to-end (on 0.lark, verified)

| Flow | Path | Status |
|---|---|---|
| Deposit HOLLAR → aHDCL | UI `Deposit` button → `useDeposit` → `HOLLAR.approve(zap) + zap.depositAndSupply` (atomic) | ✅ |
| Withdraw queue | UI Withdraw modal (Queue method) → `useRequestRedeem` batch: `pool.withdraw + vault.requestRedeem` | ✅ |
| Cancel queued redemption | `MyWithdrawals` row Cancel → `useCancelRedeem` batch: `vault.cancelRedeem + pool.supply` | ✅ |
| Instant redeem (liquid aHDCL) | UI Withdraw modal (Instant method) → `useInstantRedeem` → `sdk.tx.trade(550 → 222)` | ✅ |
| Borrow HOLLAR | `AvailableToBorrowCard` → `BorrowHollarModal` → `useBorrowHollar` (single `pool.borrow`) | ✅ |
| Recovery deposit (raw → aHDCL) | Uncollateralised row Deposit button → `useSupplyRawHdcl` (single `pool.supply`) | ✅ |
| My positions / My withdrawals / Strategy overview / About | Pure reads, real on-chain data | ✅ |

## What's stubbed / disabled

| Feature | Why | Where it lives |
|---|---|---|
| Per-row "Instant redeem" on a queued request | Would need an atomic `cancelRedeem + trade(raw HDCL → HOLLAR)`, but the SDK router rejects asset 55 (raw HDCL) — see lesson 11. Workaround: user clicks Cancel (auto-resupplies as aHDCL), then uses the Withdraw modal's instant path on the freed balance. | Button removed from `MyWithdrawals`; no hook |
| Real `Collapsible` primitive | Hand-rolled show/hide toggles in About card and others | `AboutCard.tsx` |
| Bottom-nav entry (mobile) | Top-nav added; `bottomNavOrder` not | `apps/main/src/config/navigation.ts` |
| Mainnet RPC switch | `vaultEvmClient` defaults to `https://0.lark.hydration.cloud`; reads `VITE_PROVIDER_URL` if set | `constants.ts` |
| Feature flag for HDCL nav | Always-on; should gate behind env var until mainnet governance lands | nav config |

## Where the code lives

```
apps/main/src/modules/hdcl-vault/
├── HdclVaultPage.tsx           # Top-level page, wires everything
├── HdclVault.styled.ts         # Legacy styled-components (some pre-existing TS errors)
├── constants.ts                # Addresses, ABIs, STRATEGY config (LTV fallbacks + explorer URL), RPC client
├── assets/
│   ├── hdcl-logo.svg           # HDCL token logo (pink rings)
│   └── decentral-logo.svg      # Decentral strategy logo (white rings)
├── components/
│   ├── StrategyHeader.tsx      # Breadcrumb + name + RWA LOOP pill
│   ├── StrategyOverview.tsx    # TVL / Max Net APY / asset rows / contract address / LIVE LTVs
│   ├── AboutCard.tsx           # Collapsible about + risk-management copy
│   ├── MyPositionsTable.tsx    # Inline aHDCL row + conditional uncollateralised row
│   ├── MyWithdrawals.tsx       # Unified active+history withdrawals; Show Redeemed toggle
│   ├── DepositPanel.tsx        # Right-rail HOLLAR-input deposit form (Lock/Hourglass/Zap icons, live preview fees)
│   ├── AvailableToBorrowCard.tsx  # Right-rail borrow CTA
│   ├── BorrowHollarModal.tsx   # Borrow modal (Figma 7526:33883)
│   ├── WithdrawModal.tsx       # Withdraw modal (Figma 7526:34522)
│   ├── WithdrawMethodPicker.tsx # Queue vs Instant cards (Figma 7526:35079/35082)
│   ├── WithdrawTimeline.tsx    # 3-stop horizontal timeline
│   ├── HdclLogo.tsx            # SVG wrapper, size prop
│   └── DecentralLogo.tsx       # SVG wrapper, size prop
├── hooks/
│   ├── useVaultReads.ts        # useVaultStats, useUserBalances, useHollarAllowance,
│   │                           # usePreviewDeposit, usePreviewRedeem
│   ├── useVaultWrites.ts       # useDeposit (zap), useRequestRedeem, useCancelRedeem,
│   │                           # useSupplyRawHdcl (recovery), useRequestRedeemRaw
│   ├── useHdclPoolPosition.ts  # useHdclPoolPosition (user account data) +
│   │                           # useHdclReserveConfig (decodes LTV/liqThreshold bitmap)
│   ├── useHdclPoolWrites.ts    # useBorrowHollar
│   ├── useStableswap.ts        # useInstantQuote + useInstantRedeem (Phase 5)
│   ├── useRedemptionQueue.ts   # On-chain queue read; primary source for active withdrawals
│   └── useRedemptionHistory.ts # Event-log read; merged for timestamps + history rows
└── utils/
    └── format.ts               # formatNumber, formatDate, formatInputDisplay
```

Routes:
- `apps/main/src/routes/hdcl-vault/route.tsx` + `index.tsx` — TanStack Router file-based; mounts `HdclVaultPage` under `SubpageLayout`.
- Top-nav config: `apps/main/src/config/navigation.ts` (added `hdclVault` entry).

i18n:
- `apps/main/src/i18n/locales/en/hdcl.json` — namespace covering every
  user-facing string. Registered in `apps/main/src/i18n/index.ts`.
- All components import `useTranslation("hdcl")` and use `t("key.path")`
  with `{{interpolation}}` for dynamic values.

## Architectural conventions used

- **UI primitives**: `@galacticcouncil/ui/components` — `Box`, `Flex`, `Text`, `Paper`, `Button`, `Modal*`, `Toggle`, `Checkbox`, `Chip`, `Separator`. Don't roll custom backdrops or modal containers.
- **Styling**: Theme UI + Emotion. `sx` prop with theme-token strings (`bg="surfaces.containers.high.primary"`, `color="text.high"`). For raw CSS use `css` prop with theme callback. Spacing scale `xs/s/base/m/l/xl/xxl/xxxl`. Radii: `xl` (16px) for cards, `xxl` (32px) for pills.
- **Reads**: viem for EVM (`vaultEvmClient` HTTP transport, separate from the app's WebSocket papi transport — see comment in `constants.ts` for why). Papi for substrate.
- **Writes**: All on-chain writes go through `useTransactionsStore.createTransaction` (from `@/states/transactions`) wrapped via `transformEvmCallToPapiTx` for EVM calls. The internal `useVaultEvmCall` helper in `useVaultWrites.ts` exposes `submitTx` (single EVM call) and `submitBatch` (N calls in a substrate `Utility.batch_all`); both auto-prepend an `EVMAccounts.bind_evm_address` call when the user isn't yet bound.
- **Data fetching**: TanStack Query via `useQuery`. Query keys: `["hdcl-vault-<scope>", ...keys]`. `refetchInterval` 15-30s.
- **Forms**: not currently used — deposit/withdraw modals are plain `useState`. If adding more complex forms, use `react-hook-form + @hookform/resolvers/standard-schema + zod` per project convention (see `modules/trade/otc/place-order/`).

## On-chain addresses (0.lark)

All in `apps/main/src/modules/hdcl-vault/constants.ts`. **Mainnet TODO** comments mark each one for Phase 9 swap.

| Constant | Lark address | Notes |
|---|---|---|
| `VAULT_ADDRESS` | `0xB82cF8…548D8` | HDCL Vault proxy |
| `HOLLAR_ADDRESS` | `0x531a65…0f99a` | Mainnet constant on lark too |
| `HDCL_POOL_ADDRESS` | `0x7d78C0…92e8` | Pool-Proxy-HDCL (separate Aave V3 instance) |
| `HDCL_ATOKEN_ADDRESS` | `0x9cd441…ada2` | AToken-HDCL proxy (asset 55 = aHDCL = "HDCL") |
| `HDCL_PRECOMPILE_ADDRESS` | `0x000…01000000037` | Substrate-asset precompile for asset id 55 |
| `HDCL_DEPOSIT_ZAP_ADDRESS` | `0x75d09A…a375` | Atomic deposit+supply helper (deployed 2026-04-30) |
| `VAULT_DEPLOY_BLOCK` | `75299n` | `fromBlock` for getLogs queries |

The `STRATEGY` static config in `constants.ts` carries display-only metadata (max LTV 80%, liq LTV 90%, About copy, breadcrumb path, asset labels). Some of these should eventually be read from on-chain reserve config (LTVs) but it's static for now.

## Phase progress vs original plan

| Phase | Description | Status |
|---|---|---|
| Phase 0 | PR reconciliation | ✅ resolved — keep as standalone module at `/hdcl-vault`, don't merge into PR #3579's Multiply module |
| Phase 1 | Right-panel restructure (DepositPanel + AvailableToBorrowCard, retire OverviewPanel) | ✅ |
| Phase 2 | Left-column rebuild (StrategyHeader, StrategyOverview, AboutCard, MyPositionsTable, refactored MyWithdrawals) | ✅ |
| Phase 3 | WithdrawModal + WithdrawMethodPicker + WithdrawTimeline | ✅ |
| Phase 4 | HDCL Aave pool integration (path C — direct viem reads against pool, no nested MoneyMarketProvider) | ✅ |
| Phase 5 | Instant-redeem stableswap path | ✅ done on lark — pool live, `useStableswap.ts` hooks (`useInstantQuote` + `useInstantRedeem`) wired into `WithdrawModal` + `HdclVaultPage`. Both the modal's Instant card and the per-row Instant button now route through the new pool. See "Phase 5 implementation" below for the file-by-file summary and the unit-conversion gotcha that bit me. |
| Phase 6 | i18n migration (`hdcl.json` namespace + `t('hdcl.…')` everywhere) | ✅ done — namespace registered, all components migrated, `STRATEGY` constant trimmed to non-display values only |
| Phase 7 | Polish: `previewDeposit`/`previewRedeem` fees, reserve-config-decoded LTVs, real `Collapsible` primitive, drop diagnostic console.logs | 🟡 partial — preview fees ✅, live LTVs ✅. `Collapsible` primitive + console.log strip still pending |
| Phase 8 | Routing reconciliation | ✅ decided not to do; HDCL stays standalone |
| Phase 9 | Mainnet env switch + feature flag | ❌ blocked on mainnet governance |
| Phase 10 | E2E mainnet verification | ❌ blocked on Phase 9 |

## Phase 5 implementation (instant redeem)

Done on lark for the modal-input path (swap liquid aHDCL → HOLLAR). The
per-row "instant exit on a queued request" path is **not** implemented —
see lesson 11 below. Mainnet will need the asset-id constant updated;
otherwise the implementation is the same.

### Files

- [constants.ts](apps/main/src/modules/hdcl-vault/constants.ts) — added:
  ```ts
  export const STABLESWAP_POOL_ID = 10055n
  // Lark uses 550 for the aToken (named "aHDCL"); mainnet target is 55
  // (renamed "HDCL" in the launch proposal). TODO Phase 9: switch.
  export const STABLESWAP_HDCL_ASSET_ID = 550n
  export const HOLLAR_ASSET_ID = 222n
  ```
- [hooks/useStableswap.ts](apps/main/src/modules/hdcl-vault/hooks/useStableswap.ts) (new):
  - `useInstantQuote(hdclAmount, queueHollarOut)` — debounced 250ms,
    wraps `bestSellQuery` (the existing app helper using
    `sdk.api.router.getBestSell`), returns the `InstantQuote` shape:
    `{ expectedHollar, discountPct vs queue, slippagePct }`. Uses
    asset 550 (aHDCL) on lark.
  - `useInstantRedeem(hdclAmount)` — modal-input flow. Swaps the
    user's LIQUID aHDCL balance via `sdk.tx.trade(swap).withSlippage(swapSlippage).withBeneficiary(address).build()`,
    submits the resulting extrinsic via
    `useTransactionsStore.createTransaction({ tx: tx.get() })`. Pure
    substrate (no EVM batching needed). Slippage tolerance read from
    the global `useTradeSettings()` store (same setting used by the
    Swap UI).
  - There is NO `useInstantRedeemFromQueue` — see lesson 11. The file
    has a top-level comment recording this decision so the next person
    who tries to "add the missing hook" sees the trail.
- [WithdrawMethodPicker.tsx](apps/main/src/modules/hdcl-vault/components/WithdrawMethodPicker.tsx) — exported `projectRate` so the modal can compute the queue-projected payout. The Instant card detail rows show a concrete payout comparison ("You receive now: X HOLLAR" / "Via queue (~N days): Y HOLLAR" / "Difference: ±Z HOLLAR (P%)") rather than a bare percentage discount — easier to reason about real numbers.
- [WithdrawModal.tsx](apps/main/src/modules/hdcl-vault/components/WithdrawModal.tsx) — dropped the `instantQuote` prop; modal now owns the quote internally via `useInstantQuote(inputNum, queueHollarOut)`.
- [HdclVaultPage.tsx](apps/main/src/modules/hdcl-vault/HdclVaultPage.tsx):
  - Only `useInstantRedeem` mutation included in `isPending`.
  - **WithdrawModal** `onInstantRedeem={(amount) => instantRedeemMutation.mutate(amount)}` — modal-input flow, swaps liquid balance.
  - **MyWithdrawals** has no `onInstantRedeem` prop — the per-row Instant button was removed.

### Lark vs mainnet — the asset-id divergence

| Asset | Lark naming (current) | Mainnet naming (target after launch) |
|---|---|---|
| User-held aToken | **asset 550** ("aHDCL") | **asset 55** ("HDCL" after rename) |
| Vault underlying | asset 55 ("HDCL") | asset 550 ("DCL") |

Lark pool pairs `[222 HOLLAR, 550 aHDCL]`; mainnet will pair `[55 HDCL, 222 HOLLAR]`.
Mainnet bring-up: change `STABLESWAP_HDCL_ASSET_ID = 550n` → `55n` in
constants.ts. Could also flip on `import.meta.env.VITE_NETWORK` if you
want lark + mainnet builds to share one bundle.

### Lesson — `getBestSell` takes a HUMAN amountIn, not wei

I initially passed `parseUnits(hdclAmount, 18).toString()` (wei) to
`bestSellQuery({ amountIn })`. The SDK then interpreted my 1e20
"100 wei" string as 1e20 of the underlying asset (i.e. with decimals
applied AGAIN), tried to swap that against the pool, hit liquidity-cap,
and returned the entire HOLLAR side of the pool (~300K) as `amountOut`.
That's where the "Estimated received: ~299,700 HOLLAR" / `+290,409.2%`
discount / `100% slippage` symptoms came from.

The fix mirrors `apps/main/src/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount.ts`:
**pass `amountIn` as the user-typed human string** (e.g. `"100"`) and
apply `scaleHuman(swap.amountOut, decimals)` to convert the returned
wei back to a human number. The SDK's `getBestSell(assetIn, assetOut, amountIn)`
treats `amountIn` as human-readable; it scales internally using the
asset registry's decimals. The returned `swap.amountIn` and `swap.amountOut`
are both raw wei. Same applies to the trade builder
(`sdk.tx.trade(swap).build()`) — already gets correct values from the
swap object, no per-side conversion needed.

### What still needs a wallet-connected test

- **Modal-input instant redeem**: submit and confirm the trade lands within a block.
- **Slippage / minAmountOut**: reads `useTradeSettings().swap.single.swapSlippage`. If a user has slippage set to 0% they'll get an unforgiving minOut and the trade will revert. Worth surfacing the active slippage in the Withdraw modal so users notice.

## Lessons learned during the build

These are durable — anything similar to HDCL on Hydration will run into the same things.

### 1. `Utility.batch_all([evm, evm, …])` is NOT atomic across EVM-revert
This is the same trap as `dispatcher.dispatchAsAaveManager` returning Ok despite EVM revert (lesson 1 in the on-chain handover). At the substrate level, `pallet_evm.call` returns `Ok` regardless of internal EVM revert; it just emits an `evm.ExecutedFailed` event. So `Utility.batch_all` happily proceeds past a reverted call, leaving partial state. **Fix for deposit**: `HDCLDepositZap` (lesson 9 in the on-chain handover). Anywhere else you have to chain EVM calls that *must* be atomic, deploy a multicall helper instead of relying on substrate batching.

### 2. The substrate-asset precompile ledger is separate from the EVM contract ledger when the asset is registered as `Token`
HDCL was originally registered as `assetType: Token` in `pallet-asset-registry`, which means substrate balances live in `orml_tokens`. The vault contract minted HDCL only into its own ERC20 storage. Aave's pool reaches HDCL via `precompile.transferFrom` which routes through `pallet_currencies::transfer` — when the asset type is `Token`, this hits `orml_tokens` (zero balance, BalanceTooLow revert).

**Fix**: re-register as `assetType: Erc20` with `location: AccountKey20(<vault contract>)`. Now `BoundErc20::contract_address(asset_id)` returns the vault address and balances/transfers route through the vault's ERC20 interface. Done by governance call in Phase D of the proposal.

### 3. `pallet_evm_accounts::ApprovedContract` is required for any contract that needs to do `precompile.transferFrom` on a substrate-mapped asset
Without being on this list, the precompile enforces ERC20 allowance — and the standard money-market UI hardcodes `requiresApproval = false` because the main money-market pool *is* on the list. The HDCL pool needed to be added too. `EVMAccounts.approve_contract(Pool-Proxy-HDCL)` is now part of the governance proposal (lesson 8 in the on-chain handover).

### 4. `eth_call --from <bound-address>` errors with `pallet_evm_accounts::Error::BoundAddressCannotBeUsed`
If you're trying to simulate from the user's address but they're substrate-bound, the runtime API rejects it. Simulate from `0x0` or another non-bound address; the EVM execution path is the same for read-only calls.

### 5. SCALE-encoded `DispatchError` shows up as raw EVM revert data when precompile-routed substrate dispatches fail
Hydration's multicurrency precompile, when its inner `pallet_currencies::transfer` returns Err, encodes the substrate `DispatchError` as the EVM revert payload (`output: e.encode()`). So a revert like `0x034d00000000` decodes as `Module(pallet=77, error=[0,0,0,0])` = `orml_tokens.BalanceTooLow`. Useful debugging trick — substrate-pallet errors leak through even though the call originated in EVM.

### 6. Lark's RPC sometimes returns empty event logs for `getLogs` queries
We saw `useRedemptionHistory` return `0` events for a user who clearly had on-chain queue entries (verified via direct queue reads). The exact cause wasn't pinned down; could be RPC-level indexer hole or a block-range issue. **Workaround in the UI**: `useRedemptionQueue` (which iterates the queue via view functions) is the *primary* source for active redemption rows; `useRedemptionHistory` is only used to enrich with timestamps and as the sole source for completed/cancelled rows. If history is empty the active rows still render with `requestedDate = epoch` placeholder.

### 7. `Number(formatUnits(bigint, 18))` loses precision past ~16 sig figs
Round-tripping a balance through `Number → toString → parseUnits` can produce a wei value slightly larger than the actual on-chain balance, which causes `transferFrom` to revert with insufficient balance. **Always read bigints fresh inside mutation functions** when accuracy matters. See `useSupplyRawHdcl` for the pattern.

### 8. Mainnet money-market UI's `requiresApproval = false` was misleading
We initially assumed Hydration's pool always supports approve-less supply. It does, but only because the main MM pool is in `EVMAccounts.ApprovedContract`. New pools need to be added to that list explicitly. Don't assume — verify by checking `precompile.allowance(any-user, pool)` returns max-uint256 (the precompile reports MAX for approved-contract spenders).

### 9. Lark exposes only legacy substrate JSON-RPC, no `chainHead*` v2 methods
papi defaults to chainHead/v2; the lark RPC will fail with `WS halt` errors. Use `withPolkadotSdkCompat(getWsProvider(rpc))` to shim the legacy methods. See `scripts/encode-hdcl-asset-update.mjs` for the working pattern (or `scripts/encode-hdcl-asset-update-pjs.mjs` for the @polkadot/api alternative if papi is fussy).

### 10. Lark doesn't allow `gh pr checkout` of remote branches by default
The clone has remote tracking but local branch creation needs `git checkout -b feat/hdcl-vault origin/feat/hdcl-vault` explicitly. `gh pr checkout 3606` failed; manual checkout works.

### 11. `@galacticcouncil/sdk-next` only sees ONE Aave instance — can't trade raw HDCL
The SDK's router auto-discovers Aave reserves by calling the `AaveTradeExecutor.pools()` runtime API. On Hydration that API is backed by a single-pool storage value (`pallet_liquidation::BorrowingContract`) which holds *one* EVM Pool address (the main money-market by default). The HDCL Aave pool is a SECOND, separate Aave deployment — so its reserves never show up in `pools()`, and the SDK rejects asset 55 (raw HDCL on lark) with `"55 is not supported asset"`. Asset 550 (aHDCL) works, because the main MM happens to have an aToken with that id registered through unrelated paths.

**What this blocked**: a per-row "Instant redeem" button on `MyWithdrawals` that would atomically `vault.cancelRedeem + sdk.tx.trade(raw HDCL → HOLLAR)`. The raw-HDCL leg is needed for atomicity (otherwise a silently-failed cancel still lets the trade succeed against the user's *liquid* aHDCL — see lesson 1) — but it can't be quoted, so the whole flow is parked.

**What still works**: the modal-input instant redeem (swap liquid aHDCL → HOLLAR) — that uses asset 550, which the SDK does see. Users wanting an instant exit on a queued request click Cancel first (`useCancelRedeem` already returns and re-supplies the freed HDCL as aHDCL), then use the modal's instant path on the freed balance.

**The fix when you want it**: chain-side, not SDK-side. Promote `pallet_liquidation::BorrowingContract` to a `StorageMap`, add `add_aave_pool(id, address)` under the existing `AuthorityOrigin`, and modify `runtime/hydradx/src/lib.rs:1158-1191`'s `AaveTradeExecutorApi::pools()` to iterate the map and concatenate reserves. SDK auto-picks it up on next `loadPools()` cycle, no SDK change. Don't try to fix this in the UI — there's no clean SDK config override and the path of least surprise is the additive runtime change.

## Known carryover dust

The user's lark wallet has ~0.000436 HDCL in `vault.balanceOf` from pre-zap failed batches. Below `minDisplayBalance` (= `vaultStats.minRedeem`, typically 1 HDCL), so the uncollateralised row stays hidden. The recovery `Deposit` button on that row sweeps it whenever shown.

New zap-based deposits leave **zero** dust per call — confirmed via balance check after multiple deposits.

## Recommended next-stage priorities

In priority order. The two biggest items (i18n and live LTVs) are now
done; the remaining list is shorter and mostly chain-blocked.

1. **Lint + typecheck pass** on the in-flight changes (i18n migration, live
   LTV reads, preview-fee wiring). Quick de-risk before commit.

2. **Manual wallet-connected E2E on lark** — verify the modals (Withdraw,
   Borrow) render translated strings + preview-fee row correctly when an
   amount is entered. The page-level snapshot is verified; modal interiors
   could not be opened without a wallet during automated testing.

3. **Strip / gate diagnostic console.logs** — `useRedemptionQueue` and
   `useRedemptionHistory` have `console.log("[hdcl-vault] queue scan", …)`
   blocks added during the missing-withdrawals debugging. Useful while the
   lark RPC issue is unresolved; gate behind `import.meta.env.DEV` AND a
   debug flag, or just remove.

4. **Mainnet env switch (Phase 9)** — once mainnet governance lands, swap
   addresses in `constants.ts`. Ideally drive from `import.meta.env` so env
   files (development = lark, production = mainnet) handle it automatically.

5. **Feature flag the nav entry** — until mainnet governance executes, the
   HDCL section shouldn't be in production. Gate `navigation.ts` entry behind
   `ENV.VITE_ENV === "testnet" || env.HDCL_ENABLED`.

6. **Real `Collapsible` primitive** — `AboutCard` uses a hand-rolled
   `useState(true)` toggle. Replace with the project's `Collapsible`
   primitive (see PR #3579 Multiply module for usage pattern).

7. **Modal a11y polish** — modals use the project `Modal` primitive but some
   interaction patterns (e.g. close-on-Esc, focus trap) inherit from Radix
   Dialog. Smoke test for keyboard nav.

8. **Subscan/explorer URL convention** — `STRATEGY.explorerUrl` is a
   placeholder pattern for the contract address link in `StrategyOverview`;
   verify the right hostname/path for Hydration's explorer.

## Reference docs to load alongside this one

- **`aave-v3-deploy/HDCL-MAINNET-HANDOVER.md`** — chain-side runbook. Mandatory companion read.
- **`HYDRATION_DESIGN_SYSTEM.md`** (in workspace root) — design tokens, component conventions, color/typography scales.
- **`HDCL-vault-specification.md`** (in workspace root) — vault contract spec.
- **Figma file `bTJRKXVmuqZ0v4KY63TyK1`** — 5 surfaces for the design source of truth: full page (`6402:24464`), Borrow modal (`7526:33883`), Withdraw modal (`7526:34522`, `35079`, `35082`).
- **PR #3579** (`hydration-ui`, `feat/looping`) — Multiply module, used as a *pattern* reference (forms, modals, layout shells). Don't copy visuals — they belong to a different feature.

## Branch state at handover

**hydration-ui** (`/Users/ben/Claude Code/galacticcouncil-hydration-ui`):
- Branch: `feat/hdcl-vault` (PR #3606)
- Uncommitted: substantial modifications + new files across
  `apps/main/src/modules/hdcl-vault/*`, plus
  - `apps/main/src/i18n/index.ts` — registers `hdcl` namespace
  - `apps/main/src/i18n/locales/en/hdcl.json` — new namespace file
  - `apps/main/src/vite-env.d.ts` — added `vite-plugin-svgr/client` reference
  - `apps/main/src/routes/hdcl-vault/*` — TanStack Router mount
  - `apps/main/src/config/navigation.ts` — top-nav entry
  - `scripts/encode-hdcl-asset-update*.mjs` — substrate-call encoders
  - `HDCL-UI-HANDOVER.md` — this document
- Deleted (orphan): `OverviewPanel.tsx`, `PositionsModal.tsx`,
  `QueueModal.tsx`, `History.tsx`, `WithdrawalsSummary.tsx`,
  `hooks/usePositions.ts`. `useApproveHollar` mutation removed from
  `useVaultWrites.ts`.

**aave-v3-deploy** (`/Users/ben/Claude Code/aave-v3-deploy`):
- Branch: whatever you had locally
- Uncommitted: new + modified files
  - `contracts/HDCLDepositZap.sol`
  - `tasks/misc/deploy-HDCLDepositZap.ts`
  - Updates to `HDCL-MAINNET-HANDOVER.md` (zap, lesson 9, addresses,
    verification, AND the new "Mainnet single-batch launch composition"
    section covering the stablepool + Treasury bootstrap)
- **To be written**: `tasks/proposals/hdcl-mainnet-launch.ts` —
  the single-batch mainnet proposal task. Mirrors `heurc-launch.ts`
  structure. Specs are fully captured in HDCL-MAINNET-HANDOVER.md.

All the work in this session is in the working tree. **No commits pushed.**
The user's policy is no auto-push — commits and PR updates are made by hand.
