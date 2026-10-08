# Money market v1 → v2 gap analysis

Branch `feat/money-market-v2` at `7b3bdedce`, compared against `master`. Static
read only: nothing here was confirmed in a running app or against the chain.
Paths are relative to the repo root. `v1 pkg` = `packages/money-market/src`,
`v2 pkg` = `packages/money-market-v2/src`, `v2 app` =
`apps/main/src/modules/money-market-v2`, `v1 app` = `apps/main/src/modules/borrow`.

## 1. Summary

v2 covers every v1 action (supply, withdraw, borrow incl. Hollar, repay,
collateral toggle, e-mode, claim, pool-share and isolated supply/withdraw) and
its validation is a superset of v1's. I found no case where v2 builds a
transaction with wrong calldata, and no core v1 action without a v2 path, so
there is no confirmed blocker.

The top risks are:

- v2 never re-reads the chain on a timer, so prices, liquidity and health
  factor on an open tab go stale where v1 refreshed every 60 s (F-01).
- Hollar is offered in "Assets to supply", which v1 filtered out (F-02).
- "Max" on borrow has no safety margin, where v1 took 1 % off (F-03).
- There is no v2 history page (F-04).

Below those sit a group of transaction-plumbing and cache-invalidation
differences that only bite in narrower cases (F-05, F-06, F-07), and UX gaps.

## 2. Where things live

| | v1 | v2 |
|---|---|---|
| Package | `packages/money-market/` (zustand store, Aave formatters, modals) | `packages/money-market-v2/` (`core/{chain,derive,assess,actions}`, `react/`) |
| App UI | `apps/main/src/modules/borrow/` | `apps/main/src/modules/money-market-v2/` (pages at top level, forms in `actions/`) |
| App data | `apps/main/src/api/borrow/`, `apps/main/src/api/aave.ts` | none of its own; effective APY in `v2 app/ReserveApyProvider.tsx`, feeds in `apps/main/src/api/external/` |
| Routes | `apps/main/src/routes/borrow/` (`dashboard`, `markets`, `markets.$address`, `history`) | `apps/main/src/routes/money-market/` (`index`, `markets/`, `markets/$address`, `position`) |
| i18n | `locales/en/borrow.json` | `locales/en/moneyMarket.json` (plus a few `borrow:` keys reused) |

How the app chooses: it does not. Both trees are registered and both appear in
the navigation, with no feature flag (`apps/main/src/config/navigation.ts:146-174`,
`:470-473`, `:484-487`). The v2 entry is titled "Money Market v2"
(`apps/main/src/i18n/locales/en/common.json:206`).

v2 still depends on v1 code: `useFormattedHealthFactor`
(`v2 app/HealthFactorNumber.tsx:1`, `v2 app/MoneyMarketV2Dashboard.tsx:1`),
`HealthFactorRisk` (`MoneyMarketV2Dashboard.tsx:41`), `CapProgressCircle`
(`v2 app/ReserveDetailPage.tsx:43`), `TablePaper`
(`v2 app/MoneyMarketV2Tables.tsx:41`), and the three liquidity modals
(`v2 app/actions/ActionModal.tsx:10-12`, ADR-0012).

Outside the two modules, about 50 files still import
`@galacticcouncil/money-market/*` (strategies/bil, staking/gigaStaking, trade,
liquidity, portfolio, governance, transactions, `providers/assetsProvider.tsx`,
`packages/web3-connect/src/signers/EthereumSigner.ts`). None of them has a v2
equivalent; `@galacticcouncil/money-market-v2` is imported only by the v2 module
and its routes. Removing v1 is out of reach of this branch regardless of the
findings below.

## 3. Findings table

| ID | Area | Type | Severity | Description |
|---|---|---|---|---|
| F-01 | Data loading | divergence | high | v2 has no refetch interval; v1 polled reserves, incentives and user data every 60 s |
| F-02 | Dashboard / supply | divergence | high | Hollar is listed under "Assets to supply" with a Supply button; v1 excluded it |
| F-03 | Borrow max | divergence | high | Max borrow carries no margin; v1 multiplied by 0.99 |
| F-04 | History | missing | high | No v2 history page or route |
| F-05 | Tx construction | divergence | medium | Multi-call plans wrap each call in `dispatch_evm_call`, which the app's bind-on-first-use and nested-fee helpers do not recognise |
| F-06 | Query invalidation | divergence | medium | v2 actions invalidate only v2 keys; v1 caches read by the mounted liquidity modals and other pages are left stale |
| F-07 | Isolated supply | divergence | medium | With no other collateral, v2 sends a plain supply and relies on the pool to enable collateral; v1 always sent an explicit enable |
| F-08 | Dashboard tables | missing | medium | No sorting and no stacked mobile layout on the four dashboard tables |
| F-09 | Reserve detail | missing | medium | No "your info" panel (wallet balance, available to supply/borrow, contextual alerts); buttons live with no wallet |
| F-10 | Account binding | missing | medium | `AccountBindingBanner` is not shown anywhere in v2 |
| F-11 | i18n / shipping state | divergence | medium | Many hard-coded English strings, a "developer-only" layout comment, "Money Market v2" nav title, no page meta |
| F-12 | E-mode labels | divergence | low | v1 appended " Correlated" to category labels; v2 shows the raw chain label |
| F-13 | Markets list | divergence | low | v2 lists frozen, paused and inactive reserves; v1 hid them |
| F-14 | Hollar supply APY | divergence | low | Hollar's supply APY cell shows a number; v1 showed a dash |
| F-15 | Repay notice | divergence | low | "Part of the debt remains" shows whenever wallet < debt, not only when max is selected |
| F-16 | Withdraw max | divergence | low | Withdraw amount is capped at health factor 1.01; v1 allowed down to 1 with consent |
| F-17 | Supply warnings | missing | low | Debt-ceiling warning is not shown on the supply form |
| F-18 | Borrow APY | divergence | low | Borrow APY no longer includes supply incentives and LP fee (deliberate per code comment, not in an ADR) |
| F-19 | Dashboard | missing | low | `GigaHDXBanner` absent |
| F-20 | Routes | divergence | low | `/money-market/position` exists but nothing links to it |

## 4. Finding details

### F-01 — No periodic refresh (high)

**v1.** Pool, incentive and Hollar data are fetched on a 60 s interval:
`POLLING_INTERVAL = 60000` (`v1 pkg/ui-config/queries.ts:81`), wired through
`createSingletonSubscriber` (`v1 pkg/store/root.ts:42-56`,
`v1 pkg/store/utils/createSingletonSubscriber.ts:17-24`). `refreshPoolData`
fetches reserves, reserve incentives and, when an account is set, the user's
reserves (`v1 pkg/store/poolSlice.ts:244-345`).

**v2.** Reads have a `staleTime` only: 5 min for reserves, 30 s for positions,
balances, rewards and the Hollar facilitator (`v2 pkg/react/hooks.ts:36`, `:42`,
`:58-62`, `:71-75`). `grep -rn "refetchInterval\|refetchOnWindowFocus"` over
`packages/money-market-v2/src` and `apps/main/src/modules/money-market-v2`
returns nothing, and the app's `QueryClient` sets no defaults
(`apps/main/src/App.tsx:28-39`). The tick only re-derives cached state against a
new timestamp and is documented as never a refetch
(`v2 pkg/react/use-tick.ts:13-19`, `v2 pkg/react/provider.tsx:21`).

**Why it matters.** Accrual is not the only thing that changes. Oracle prices,
pool liquidity, caps, and the user's own positions (a liquidation, or an aToken
swap made on the Trade page) all arrive only in a fresh read. A user who leaves
the dashboard open sees a health factor computed from prices that may be hours
old, and action assessments run on the same stale payload. A refetch happens
only on remount, window refocus, or after a v2 transaction.

**Fix direction.** Add `refetchInterval` to `useMarketReserves` and the
user-scoped reads (60 s restores v1), or key them under the app's block prefix.
ADR-0004's rule is about the tick not causing reads; a separate interval does
not contradict it.

### F-02 — Hollar offered for supply (high)

**v1.** `useSupplyAssetsData` drops Hollar:
`!displayGho({ currentMarket, symbol: reserve.symbol })`
(`v1 pkg/hooks/useSupplyAssetsData.ts:26-30`). The reserve page hides its supply
row (`v1 app/reserve/components/ReserveActions.tsx:91`) and disables the button
(`v1 pkg/hooks/useReserveActionState.tsx:41`).

**v2.** "Assets to supply" is `summaries.filter(isUsable)`, where `isUsable` is
active, not frozen, not paused (`v2 app/MoneyMarketV2Dashboard.tsx:72-73`,
`:179`). There is no Hollar filter, and `toSupplyRows` adds none
(`v2 app/toSupplyRows.ts:43-70`). `assessSupply` has no Hollar rule
(`v2 pkg/core/assess/supply.ts:83-102`). The reserve detail page does hide
Supply for Hollar (`v2 app/ReserveDetailPage.tsx:730-737`), so the dashboard is
the inconsistent surface.

**Why it matters.** A wallet holding HOLLAR gets a Hollar row with its balance
near the top of the list and a working Supply form. Upstream GHO's aToken
rejects minting (`GhoAToken.mint` reverts with `OPERATION_NOT_SUPPORTED`,
https://github.com/aave/gho-core/blob/main/src/contracts/facilitators/aave/tokens/GhoAToken.sol),
so the transaction would fail. I did not check Hydration's fork of that
contract; see section 7.

**Fix direction.** Filter `isHollar(reserve.underlyingAsset, market)` out of
`toSupply`, and add a blocker to `assessSupply` so every entry point agrees.

### F-03 — Max borrow has no margin (high)

**v1.** `getMaxAmountAvailableToBorrow` multiplies the result by 0.99 when the
user is borrowing at their limit, already has debt, or is near a cap or debt
ceiling (`v1 pkg/utils/getMaxAmountAvailableToBorrow.ts:69-108`). The Hollar
variant does the same (`:134-168`).

**v2.** The max is the smallest of `availableBorrows / price`, the headroom to
health factor 1.01, and liquidity or Hollar capacity, truncated to the asset's
decimals (`v2 pkg/core/assess/borrow.ts:147-164`, `:213-219`). Liquidation
threshold is above LTV, so the LTV bound is normally the binding one and it is
used exact. `grep -rn "margin\|0\.99\|1\.0025"` over the non-test files of
`packages/money-market-v2/src` returns nothing.

**Why it matters.** The pool checks
`(debt + amount) / ltv <= collateral` at execution. Existing debt accrues every
second and the value v2 computed is up to one tick (60 s) plus signing time old,
and prices can be staler still (F-01). For an account that already has debt,
pressing Max and submitting is likely to revert with
`COLLATERAL_CANNOT_COVER_NEW_BORROW`. The user loses the fee and has to guess a
smaller amount.

**Fix direction.** Apply a margin to the LTV bound in `assessBorrow` (v1's 1 %,
or a smaller one sized to the tick), next to `HF_MAX_TARGET` in
`v2 pkg/core/constants.ts:39-40`.

### F-04 — No history page (high)

**v1.** `/borrow/history` with type filter, search, sort and pagination
(`apps/main/src/routes/borrow/history.tsx:9-31`,
`v1 app/history/BorrowHistoryPage.tsx:12-63`), backed by
`apps/main/src/api/borrow/moneyMarketEvents.ts:12-21` (Supply, Withdraw, Borrow,
Repay, LiquidationCall, collateral enabled/disabled, UserEModeSet). It is a nav
entry (`apps/main/src/config/navigation.ts:154`).

**v2.** `apps/main/src/routes/money-market/` holds `index`, `markets/`,
`markets/$address` and `position` only. `grep -rln "moneyMarketEvents\|borrowHistory"`
finds nothing under `modules/money-market-v2`. The v2 nav has two children,
dashboard and markets (`navigation.ts:157-174`).

**Why it matters.** History is the only place a user sees that they were
liquidated. It disappears when the v1 routes are retired.

**Fix direction.** The page reads the indexer and needs nothing from the v1
package, so it can be mounted under `/money-market/history` nearly as is. The
query is not market-scoped today; decide whether it should be.

### F-05 — Multi-call plans are wrapped differently (medium)

**v1.** A multi-call action becomes `Utility.batch_all` of raw `EVM.call`s:
`createBatchTx({ txs: tx.map((evmTx) => transformEvmCallToPapiTx(papi, evmTx)) })`
(`v1 app/BorrowContextProvider.tsx:59-69`,
`apps/main/src/modules/transactions/utils/tx.ts:48-64`,
`apps/main/src/modules/transactions/hooks/useBatchTx.ts:52-54`).

**v2.** Each call is wrapped first:
`batch_all([Dispatcher.dispatch_evm_call(EVM.call), …])`
(`v2 app/actions/planToTransaction.ts:60-67`).

**Why it matters.** Two shared helpers look only for `EVM` calls at the top
level or directly inside a `Utility` batch:

- `containsEvmCall` (`tx.ts:81-96`) decides whether `useWrapEvmTransaction`
  prepends `bind_evm_address` for an unbound Substrate account
  (`apps/main/src/modules/transactions/hooks/useWrapTransaction.ts:57-86`). A
  v2 batch has `Dispatcher` children, so it returns false and no binding is
  prepended. Single-call plans are unaffected: they go out as a native EVM call
  and take the `isEvmCall` branch (`useWrapTransaction.ts:60-74`).
- `collectNestedEvmCallFees` (`tx.ts:121-136`) sums EVM fees inside a batch the
  same way, so it counts zero for a v2 batch.

v2 produces a multi-call plan in two cases: an isolation-join supply
(`v2 pkg/core/actions/pool.ts:121-134`), reachable only when the reserve does
not take the liquidity modal — another market, or no aToken in the registry
(`v2 app/actions/actionRoute.ts:28-36`) — and claim-all across more than one
incentive controller (`v2 pkg/core/actions/claim.ts:140-157`), which the code
says no market has today. So the exposure is narrow, but in those cases an
unbound account's first money-market transaction skips the binding v1 would
have added. What an unbound batch does on chain is a runtime question (section 7).

**Fix direction.** Either build the batch from unwrapped
`transformEvmCallToPapiTx(papi, call)` as v1 does, or teach `containsEvmCall`
and `collectNestedEvmCallFees` to look through `Dispatcher.dispatch_evm_call`.

### F-06 — v2 actions leave v1 caches stale (medium)

**v1.** Every transaction invalidates `["borrow"]` and
`TRANSFERABLE_ATOKEN_BALANCE_QUERY_KEY`
(`v1 app/BorrowContextProvider.tsx:55-58`), and on success also
`AAVE_HEALTH_FACTOR_QUERY_KEY`, `AAVE_SUMMARY_QUERY_KEY` and
`MAX_WITHDRAW_ALL_QUERY_KEY`, repeated at 2/4/6 s
(`v1 app/hooks/useMoneyMarketPostTxRefresh.ts:13-20`, `:59-63`).

**v2.** A plan submits with `invalidateQueries: [marketKey]`, the v2 market
prefix, and `useRefreshMarket` repeats that one key
(`v2 app/actions/useActionPlanMutation.ts:43`, `:59`,
`v2 app/actions/useRefreshMarket.ts:28-37`).

**Why it matters.** The liquidity modals v2 mounts read those v1 caches, as do
the trade, DCA, portfolio and liquidity pages
(`apps/main/src/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils.tsx`,
`…/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts`,
`apps/main/src/modules/portfolio/overview/Balances/WalletBalances.data.tsx`,
`apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapHealthFactor.ts`).
The transferable-aToken query is keyed on address, balance and asset
(`apps/main/src/api/aave.ts:225-230`), so a v2 borrow against that collateral
does not change the key. Sequence: borrow in v2, then open Withdraw on a
pool-share reserve; the modal first renders the pre-borrow maximum. The user
summary behind it has a 30 s `staleTime`
(`apps/main/src/api/borrow/queries.ts:89`, `:461`). The window is short because
the default `staleTime` is 0 and the modal refetches on mount, which is why this
is medium and not high. ADR-0012 covers the other direction only ("the modals
invalidate no v2 read").

**Fix direction.** Add the five v1 keys to `invalidateQueries` in
`useActionPlanMutation` for as long as v1 consumers exist.

### F-07 — Isolated supply with no other collateral (medium)

**v1.** `isJoiningIsolatedMode = isIsolated && !isActiveCurrentCollateral`
(`v1 pkg/components/transactions/supply/SupplyModalContent.tsx:113`). Whenever
it is true the action is a batch: disable each active collateral, supply, then
`setUsageAsCollateral(reserve, true)`
(`v1 pkg/components/transactions/supply/SupplyActions.tsx:167-194`). With no
other collateral the batch is still supply plus explicit enable.

**v2.** `isolationJoin` requires `otherCollateral.length > 0`
(`v2 pkg/core/assess/supply.ts:104-115`). With none, the plan is a single
`supply` (`v2 pkg/core/actions/pool.ts:121`), and the projection assumes the
pool enables it on first supply
(`v2 pkg/core/assess/project-account.ts:164-167`, `:177-195`). The form then
tells the user they are entering isolation mode (`supply.ts:126-140`).

**Why it matters.** That assumption holds for Aave v3.0.0's
`validateUseAsCollateral`. From v3.0.1 the pool does not auto-enable an isolated
asset unless the supplier holds `ISOLATED_COLLATERAL_SUPPLIER_ROLE`
(`validateAutomaticUseAsCollateral`,
https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/libraries/logic/ValidationLogic.sol).
If Hydration's pool behaves the later way, a v2 isolated supply leaves the asset
not enabled as collateral while the form showed "Collateral: Yes" and an
improved health factor. On `hydration_v3` this path is bypassed by the liquidity
modal (ADR-0012), so it applies to isolated reserves on other markets or without
a registry aToken.

**Fix direction.** Emit the trailing `setUserUseReserveAsCollateral(asset, true)`
whenever the supplied reserve is isolated and not yet collateral, as v1 does, or
confirm the deployed pool's behaviour and record it.

### F-08 — Dashboard tables: no sorting, no mobile layout (medium)

**v1.** Each of the four tables sorts through a URL search param
(`apps/main/src/routes/borrow/dashboard.tsx:9-17`; e.g.
`v1 app/dashboard/components/supply-assets/SupplyAssetsTable.tsx:57-58`), with
supplied defaulting to balance descending. On mobile each renders a
`StackedTable` with full-width action and Details buttons
(`SupplyAssetsTable.tsx:62-76`, `BorrowAssetsTable.tsx:25`,
`BorrowedAssetsTable.tsx:44`, `SuppliedAssetsTable.tsx:54`).

**v2.** All dashboard columns are `display` columns with no accessor or
`sortingFn` (`v2 app/MoneyMarketV2Tables.tsx:293-459`), and the `/money-market/`
index route declares no search schema (`apps/main/src/routes/money-market/index.tsx:5-7`).
Order is fixed in code (`v2 app/usePositions.ts:54-59`,
`MoneyMarketV2Dashboard.tsx:231-235`). One `DataTable` with `fixedLayout` serves
every breakpoint (`MoneyMarketV2Tables.tsx:495-508`). The markets page does sort
and search (`v2 app/MarketsPage.tsx:53-57`, `:84-118`).

**Why it matters.** Five fixed-width columns on a phone. Whether it is usable
needs a look in a browser.

**Fix direction.** Reuse `StackedTable` below the mobile breakpoint; turn the
balance and APY columns into accessors.

### F-09 — Reserve detail: no "your info" panel (medium)

**v1.** `ReserveActions` shows wallet balance, available to supply, available to
borrow, and alerts for empty wallet, no collateral, isolation and e-mode
restrictions and reached caps, with buttons disabled to match
(`v1 app/reserve/components/ReserveActions.tsx:74-143`,
`v1 pkg/hooks/useReserveActionState.tsx:40-119`).

**v2.** `ReserveActions` is two buttons with no disabled state
(`v2 app/ReserveDetailPage.tsx:720-749`). `MyPosition` renders only for an
existing position and returns null with no wallet
(`v2 app/MyPosition.tsx:85`, `:101`). With no wallet the buttons still open the
form, whose submit can never enable (`v2 app/actions/SupplyForm.tsx:116`,
`:138-141`).

**Why it matters.** The user learns why they cannot borrow only after opening
the form. Nothing unsafe.

**Fix direction.** Disable the buttons without a wallet; optionally surface
`assessSupply(...).max` and `assessBorrow(...).max` beside them, as the
dashboard already does for borrow (`MoneyMarketV2Dashboard.tsx:210-220`).

### F-10 — Account binding banner missing (medium)

**v1.** `AccountBindingBanner` prompts an unbound account to bind, on the
dashboard, markets list and reserve page
(`v1 app/account/AccountBindingBanner.tsx:16-52`,
`v1 app/dashboard/BorrowDashboardPage.tsx:50`,
`v1 app/markets/BorrowMarketsPage.tsx:20`,
`v1 app/markets/BorrowMarketDetailPage.tsx:70`). The e-mode button is also
hidden until bound (`BorrowDashboardPage.tsx:86-87`).

**v2.** `grep -rn "Binding\|isBound\|bind" apps/main/src/modules/money-market-v2`
returns nothing.

**Why it matters.** Mostly cosmetic for single-call actions, because the
transaction layer prepends the bind (`useWrapTransaction.ts:57-74`). It matters
more in combination with F-05, where that safety net does not fire.

**Fix direction.** Render the banner in `MoneyMarketV2Layout`.

### F-11 — Not yet presented as a user-facing surface (medium)

- Hard-coded English in user-visible places: table titles and empty states
  (`v2 app/MoneyMarketV2Dashboard.tsx:415-416`, `:442`, `:462`, `:479-480`,
  `:506-507`, `:515-517`), category labels (`:80-87`), column headers
  (`v2 app/MoneyMarketV2Tables.tsx:296-401`), the whole markets header and
  reserve detail page (`v2 app/MarketsPage.tsx:169-192`,
  `v2 app/ReserveDetailPage.tsx:214-237`, `:327-349`, `:531-599`), "Isolated"
  chips (`MoneyMarketV2Tables.tsx:196`, `:225`), and the breadcrumb
  (`apps/main/src/routes/money-market/position.tsx:7`). v1 uses `borrow:` keys
  for all of these. Only `en` exists (`apps/main/src/i18n/locales/`), so nothing
  breaks today.
- The layout's doc comment still says "developer-only surface … Nothing here
  signs, and nothing is meant to ship to users" and the chain config says
  "debug surface" (`v2 app/MoneyMarketV2Layout.tsx:21-30`,
  `v2 app/config.ts:6-22`). Both are untrue since the action forms landed.
- No route sets `head` meta; every v1 route calls `getPageMeta`
  (`apps/main/src/routes/borrow/dashboard.tsx:23-29` vs
  `apps/main/src/routes/money-market/route.tsx:17-23`).
- The market selector's label is a literal (`MoneyMarketV2Layout.tsx:75`).

**Fix direction.** A pass with the repo's translations convention before v2
replaces `/borrow`.

### F-12 to F-20 — low

- **F-12.** v1 formats e-mode labels as `"<label> Correlated"` unless the label
  is "Stablecoins" (`v1 pkg/store/poolSelectors.ts:284-287`). v2 passes the
  chain label through (`v2 pkg/core/derive/emode.ts:26`) and renders it
  (`v2 app/MoneyMarketV2Dashboard.tsx:267-270`, `v2 app/actions/EModeForm.tsx:75-80`).
- **F-13.** v1's markets table shows only active, unfrozen, unpaused reserves
  (`v1 pkg/hooks/useMarketAssetsData.ts:9-11`). v2 passes every reserve
  (`v2 app/MarketsPage.tsx:216`). The header totals match: both sum all reserves
  (`v1 pkg/hooks/useAggregatedMarketStats.ts:10-30`, `MarketsPage.tsx:59-74`).
- **F-14.** v1 renders no supply APY for Hollar
  (`v1 app/components/ApyColumn.tsx:22-24`). v2's markets table renders
  `ReserveApyCell side="supply"` for every row (`MarketsPage.tsx:104-110`),
  while the adjacent "Total supplied" cell is dashed for Hollar (`:94`).
- **F-15.** v1 warns about leftover debt only when max is selected and debt
  remains (`v1 pkg/components/transactions/repay/RepayModalContent.tsx:233-234`,
  `:317`). v2 raises `repayLeavesDebt` whenever the wallet is smaller than the
  debt, whatever amount is typed (`v2 pkg/core/assess/repay.ts:82`, `:101-110`).
- **F-16.** v1's withdraw input maximum is the transferable aToken balance
  (`v1 pkg/components/transactions/withdraw/WithdrawModalContent.tsx:60-66`) and
  the block is health factor below 1 (`…/WithdrawError.tsx:38-41`). v2 includes
  the 1.01 headroom in `max` (`v2 pkg/core/assess/withdraw.ts:129-144`) and the
  form rejects anything above `max` (`v2 app/actions/WithdrawForm.form.ts:15-17`),
  so the band between 1.00 and 1.01 is no longer reachable and the error is the
  generic balance message. Safer, but a change.
- **F-17.** v1's supply modal shows the debt-ceiling warning beside the
  supply-cap one (`SupplyModalContent.tsx:273-275`, `:362`). v2's supply
  assessment raises only `supplyCapFindings` (`v2 pkg/core/assess/supply.ts:117`);
  the debt-ceiling notice exists for borrow and collateral
  (`assess/borrow.ts:124-130`, `assess/collateral.ts:111`).
- **F-18.** v1 adds supply-side incentives and the LP fee to the borrow total
  (`apps/main/src/api/borrow/hooks.ts`, `calculateTotalSupplyAndBorrowApy`:
  `borrowMMApy = underlyingBorrowApy + incentivesNetAPR`,
  `totalBorrowApy = borrowMMApy + lpAPY`). v2's borrow rate is base plus feed
  only (`v2 app/effectiveApy.ts:124-141`), and the comment at `:149-153` calls
  it a deliberate departure. No ADR records it; ADR-0005 and ADR-0009 say only
  that composition is the app's. Displayed borrow APYs for adjusted reserves
  will differ from v1. Worth one line in an ADR.
- **F-19.** `GigaHDXBanner` heads the v1 dashboard
  (`v1 app/dashboard/BorrowDashboardPage.tsx:48`); v2 has none.
- **F-20.** `/money-market/position` is registered
  (`apps/main/src/routes/money-market/position.tsx:5-8`) but
  `grep -rn "money-market/position"` finds no link, and `LINKS` has no entry
  (`apps/main/src/config/navigation.ts:62-64`).

## 5. Intentional divergences

| ADR | Divergence |
|---|---|
| 0002 | Hollar, not GHO, in all v2 names |
| 0003 | v2 speaks EVM addresses; asset-id resolution is in the app (`v2 app/reserves.ts:16-17`) |
| 0005 | v2 package reports base APY; overrides are composed in the app (`v2 app/ReserveApyProvider.tsx`) |
| 0006 / 0008 | Truncating bigint math; last-digit differences from Aave's JS are expected. The `-1` health-factor sentinel is kept |
| 0007 | No approvals, permits or allowance reads; `MAX_UINT` passed through for max withdraw/repay. v1 hard-codes `requiresApproval = false` (`SupplyActions.tsx:84`) |
| 0009 | Expired or zero emissions report no APR where v1 could show one; no composed APY on the reserve summary |
| 0010 | No `hydration_testnet_v3` market and no network check (`v2 pkg/core/markets.ts:12-48`) |
| 0011 | v2 blocks things v1 left to the contract: frozen/paused borrow, paused supply, isolation collateral conflict, siloed borrowing, sub-1 health factor on e-mode exit. Health-factor blocker is `< 1` for every action (v1: `< 1` withdraw, `<= 1` collateral, `< 1.01` e-mode exit) |
| 0012 | Pool-share supply/withdraw and isolated supply on `hydration_v3` open the liquidity modals, with their own SDK health-factor engine and copy |
| CONTEXT.md | Isolated reserves are read from chain (`isIsolated`), not from v1's `ISOLATED_MODE_ASSETS` list; repay-with-aTokens, collateral swap, debt switch, WETH gateway are out of the domain. v1 has repay-with-aTokens commented out too (`RepayModalContent.tsx:186-204`) |

No implementation contradicts its ADR as far as I read. The two places where an
ADR's decision leaves a gap it does not mention are F-06 (ADR-0012) and F-18
(ADR-0005/0009).

## 6. Confirmed parity

- **Risk-acknowledgement threshold.** 1.1 in both, and only when the change is
  visible at two decimals (`v1 pkg/ui-config/misc.ts`
  `HEALTH_FACTOR_RISK_THRESHOLD = 1.1`, `v1 pkg/utils/hfUtils.ts:309-322`;
  `v2 pkg/core/constants.ts:37`, `v2 pkg/core/assess/finding-rules.ts:53-57`).
- **Cap warnings.** 98 % warn, 99.99 % reached
  (`v1 pkg/hooks/useAssetCaps.tsx:12`, `:156`; `finding-rules.ts:21-24`).
- **Supply max.** `min(wallet less fee, supplyCap − totalLiquidity)`, zero when
  frozen; neither applies a margin
  (`v1 pkg/utils/getMaxAmountAvailableToSupply.ts:26-61`,
  `v2 pkg/core/assess/supply.ts:186-204`). Fee buffer 0.5 in both
  (`SupplyModalContent.tsx:78-82`, `v2 app/actions/useSpendable.ts:17`).
- **Isolated supply with debt** is blocked in both
  (`SupplyModalContent.tsx:110-111`, `supply.ts:94-102`); **isolation join**
  with other collateral builds the same disable → supply → enable sequence
  (`SupplyActions.tsx:167-194`, `v2 pkg/core/actions/pool.ts:123-134`).
- **Repay.** Wallet-only in both; `MAX_UINT` exactly when the wallet covers the
  debt (`RepayModalContent.tsx:143-160`, `v2 pkg/core/assess/repay.ts:82`,
  `v2 app/actions/RepayForm.tsx:112-115`).
- **Withdraw.** `MAX_UINT` when max equals the whole balance
  (`WithdrawModalContent.tsx:88-92`, `v2 app/actions/WithdrawForm.tsx:125-128`);
  liquidity and zero-LTV blockers present in both; fee weighed against the
  aToken (`WithdrawModalContent.tsx:52-64`, `WithdrawForm.tsx:62-84`).
- **Collateral toggle.** Open-budget DCA acknowledgement carried over
  (`v1 pkg/components/transactions/collateral/CollateralChangeModalContent.tsx:74-87`,
  `v2 app/actions/CollateralForm.tsx:61-79`, `:103-114`).
- **E-mode.** Borrows-outside-category blocker and "restricts borrowing" notice
  (`EmodeModalContent.tsx:99-113`, `:356-361`;
  `v2 pkg/core/assess/emode.ts:41-74`).
- **Claim.** All or single reward, 0.01 USD threshold for the dashboard prompt
  (`v1 app/dashboard/components/DashboardHeader.tsx:29`, `:122`;
  `MoneyMarketV2Dashboard.tsx:70`, `:351`).
- **Borrow available with isolation.** Debt-ceiling headroom caps
  `availableBorrows` (`v2 pkg/core/derive/account.ts:114-126`, `:355-365`).
- **Net APY.** Same weighting, borrow incentives counted as earnings
  (`v2 pkg/core/derive/net-apy.ts:51-98`).
- **Gas limits.** 1,000,000 for supply/withdraw/repay/collateral/claim and
  1,300,000 for borrow in both (`v1 pkg/ui-config/gasLimit.ts:9-32`,
  `v2 pkg/core/actions/pool.ts:36-44`, `claim.ts:42-45`). Gas price surplus is
  1 % in v1 and 5 % in v2 (`poolSlice.ts:1000-1002`,
  `v2 app/actions/planToTransaction.ts:24-27`).
- **Post-tx refresh cadence.** 2/4/6 s in both
  (`useMoneyMarketPostTxRefresh.ts:13`, `useRefreshMarket.ts:8`).
- **Derivation tick.** 60 s in both (`v1 pkg/hooks/app-data-provider/useAppDataProvider.tsx:81`,
  `v2 pkg/react/provider.tsx:7`).
- **Dashboard header.** Net worth, net APY, health factor with risk modal,
  rewards; v2 adds the e-mode control there
  (`DashboardHeader.tsx:56-143`, `MoneyMarketV2Dashboard.tsx:306-389`).
- **Reserve detail.** Totals, utilization, oracle price, caps with progress,
  max LTV, liquidation threshold and penalty, reserve factor, debt ceiling,
  e-mode parameters, interest-rate model chart, rate history; Hollar variant
  with facilitator cap. v2 merges supply and borrow history into one chart and
  scopes it to the pool (`v2 app/reserveRates.ts:28-34`).
- **Markets list.** Columns, search and URL sort (`MarketsPage.tsx:53-153`).
- **Pool-share naming.** Shown as the aToken in both
  (`v1 app/hooks/useFormatReserve.ts:14-24`, `v2 app/reserveDisplay.ts:33-54`).
- **Unused in v1.** `HollarBanner` is defined but rendered nowhere, so its
  absence from v2 is not a gap.

## 7. Unverified / needs runtime check

- **F-02.** Whether Hydration's Hollar aToken rejects `supply` like upstream
  GHO, or whether the reserve is frozen on chain (in which case `isUsable`
  already hides it). Check the reserve's flags and try a dry-run.
- **F-05.** What `batch_all([dispatch_evm_call, …])` does for an unbound
  Substrate account, and whether any non-main market has an isolated reserve
  today. Also whether fee display and max-balance are visibly off for such a
  batch.
- **F-07.** Which `validateUseAsCollateral` behaviour the deployed pools have
  (auto-enable of isolated collateral on first supply).
- **Withdraw on non-main markets, shared by v1 and v2.** Both bound the
  withdraw amount by the transferable balance of `getRelatedAToken(assetId)`
  (`WithdrawModalContent.tsx:52-66`, `WithdrawForm.tsx:62-84`). The registry
  maps one aToken per underlying
  (`apps/main/src/states/assetRegistry.ts:77-82`), and a missing one yields a
  maximum of "0" (`apps/main/src/modules/transactions/hooks/useMaxBalance.ts:32-36`).
  For an asset that is a reserve of several markets (Hollar is in all three)
  the looked-up aToken may belong to another market. Not a regression, but v2
  makes other markets a first-class selector, so check a withdraw on BIL and
  GIGAHDX.
- **Hollar discount.** v1 can show a borrow-APY range from the GHO discount
  data (`GhoBorrowModalContent.tsx:48`, `:164-170`); v2 shows the reserve rate.
  Equal if no discount strategy is configured.
- **F-08.** Mobile rendering of the v2 dashboard and forms.
- **Numbers side by side.** I did not run the v2 vitest suite or compare live
  values against `/borrow`. ADR-0008 predicts last-digit differences only.
- **Incentive math.** `v2 pkg/core/derive/incentives.ts` was not read line by
  line; I relied on ADR-0009 and the existence of its tests.
