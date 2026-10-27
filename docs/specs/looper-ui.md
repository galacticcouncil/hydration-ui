# Multiply (looper) UI spec

Status: ready to build. The open items in [§11](#11-open-items) are deliberately left as placeholders.
Map: [Multiply (looper) UI spec](https://gitlab.com/emildoescode/hydration-ui/-/work_items/92). Each section links the ticket that decided it, and that ticket holds the reasoning.
Vocabulary: [`CONTEXT.md`](../../CONTEXT.md). Users see **Multiply** and the position statuses. "Looper", "ladder", "rung" and "stall" are internal terms only.

## 1. Scope

- **v1 delivers:** one Multiply pair, PRIME/HOLLAR, with:
  - a card on `/strategies`;
  - a detail page where users open a position and manage it (deposit, withdraw, close, resume);
  - a list of the user's positions.
- **Not in v1:**
  - other pairs;
  - zaps (depositing anything but the collateral);
  - an advanced settings section;
  - integration with the portfolio and notifications;
  - rung history;
  - exposing `cancel`.
- **Contract:** `galacticcouncil/money-market@feat/looper`, directory `looper/`, which holds `LooperFactory`, `LooperPosition` and `LooperLogic`. The factory is an admin-free ERC721 ("LOOP"). Each position is an EIP-1167 clone at `factory.predict(tokenId)`, owned by whoever holds that NFT. The position ramps up to its target leverage asynchronously, through ICE intents: one in flight at a time, and each fill calls the position back to submit the next one.

Research behind this spec, each on a throwaway branch on `origin`:

| Topic | Branch / file |
|---|---|
| Deployment, pairs, defaults | `research/looper-lark3-deployment`: `docs/research/looper-lark3-deployment.md` |
| Lifecycle, stalls, submission, gas, states | `research/multiply-lifecycle`: `docs/research/multiply-lifecycle.md` |
| Projection helpers, APY sources | `research/multiply-projection-helpers`: `docs/research/multiply-projection-helpers.md` |
| Position discovery | `research/multiply-position-discovery`: `docs/research/multiply-position-discovery.md` |
| Detail page prototype | `prototype/multiply-detail-page`, variant A |

## 2. Rollout

- Add a `looperEnabled` feature flag next to `bilEnabled` in `TFeatureFlags` (`apps/main/src/api/rpcClient.ts`). It is true only when a factory address is configured.
- The factory address comes from the optional env var `VITE_LOOPER_FACTORY_ADDRESS`. Set it in `.env.local` to test against a fork. An env var, rather than per-network config keyed on genesis hash, because lark3 is a mainnet fork and likely shares mainnet's genesis. **No `feat/looper` factory exists anywhere yet:**
  - lark3 runs an older, incompatible revision at `0x51d94fb0…7fee`, which has admin roles and is not an ERC721. Do not integrate against it.
  - The new factory comes from [Deploy the feat/looper contracts on lark3](https://gitlab.com/emildoescode/hydration-ui/-/work_items/100).
- Verify on lark3 (`https://3.lark.hydration.cloud`) first.
- When the flag is off, the card is hidden and the detail route redirects to `/strategies`, as `BilVaultPage` does.

## 3. Pair config

Decided in [Which Multiply pairs launch](https://gitlab.com/emildoescode/hydration-ui/-/work_items/102).

Pairs live in a hardcoded list. Each entry becomes one card. Port the shape of the old `upstream/feat/looping` `config/pairs.ts`, plus the fields below. v1 has exactly one entry:

| Field | PRIME/HOLLAR |
|---|---|
| slug | `prime-hollar` |
| collateral / aCollateral | PRIME `0x000000000000000000000000000000010000002B` / aPRIME `0x4C892a298A9C6b4cEd988b3D6E9CF93333aADcF7` (`aCollateralAssetId` 1043) |
| debt / variableDebt | HOLLAR `0x531a654d1696ED52e7275A8cede955E82620f99a` (`debtAssetId` 222) / `0x342923782cCaEBf9c38DD9cb40436e82C42c73B5` |
| eMode | 0 |
| minHf | `1.10e18`. Max leverage = min(1.10/(1.10−0.88), 1/(1−0.85)) = **5.0×** |
| stepHf | `1.05e18`. This sits exactly on the factory bound `stepHf + 0.05 ≤ minHf`. |
| slippageBps | 100 |
| feeAsset | HDX `0x0000000000000000000000000000000100000000`, `feeAssetId` 0 |
| feeReserve / feeBudget | **placeholders**: 5 HDX reserve, and a budget of `(expected ramp rungs + close rungs) × perCallbackFee + feeReserve`. See §11. |

`minIntentDebt` and `minIntentAToken` are **computed at open** as `max(2 × ED, 1% of the deposit)`, each in its own leg's units:

- debt leg: the HOLLAR ED, 0.02 on lark3;
- aToken leg: the aPRIME ED, 9 901 base units.

These floors are fixed for the life of the position. They hold a 3× ramp to about 11 rungs, at the cost of landing about 0.7% short of the target leverage.

PRIME is an isolation-mode collateral, and HOLLAR is the only debt that can be borrowed against it. `_validate` does not check this, so a pair config must never pair PRIME with any other debt.

## 4. Contract integration

### 4.1 ABI and reads

Generate the ABI from `money-market@feat/looper:looper`, for example with `forge build` and `out/*.json`. Commit only the `LooperFactory` and `LooperPosition` ABIs. Make the reads over viem, the way `packages/money-market/src/core/chain` does.

| Read | Use |
|---|---|
| `factory.maxLeverage(collateral, eMode, minHf)` | slider max, card stat |
| `factory.nextId()`, `ownerOf(id)`, `predict(id)` | position discovery (§4.3) |
| `position.ladder()`, `closing()`, `stalled()`, `pending()`, `isClosed()` | status (§7.2) |
| `position.nav()`, `pnl()`, `principal()`, `aaveLeverage()`, `targetLeverage()`, `effectiveHealthFactor()`, `collateral()`, `debt()`, `request()`, `nonce()` | row figures, progress |
| `feeAsset.balanceOf(position)` | remaining fee budget (there is no view for it) |
| `LadderStopped(reason, remainder)` logs at the position address | the stall's remainder. It is only emitted in this event, and the events are not indexed. |

### 4.2 Writes

Each write is an `EVM.call` inside `Utility.batch_all`, using the BIL plumbing unchanged:

- `useVaultEvmCall` / `transformEvmCallToPapiTx` in `modules/strategies/bil/hooks/useVaultWrites.ts`;
- `useSignAndSubmit`;
- `bind_evm_address` prepended for unbound accounts.

| Action | Batch, in order | Approvals |
|---|---|---|
| Open | `PRIME.approve(factory, amount)` if short → `HDX.approve(factory, feeBudget)` if short → `factory.open(params, amount, feeBudget)` | two, both to the **factory** |
| Deposit | `HDX.transfer(position, topUp)` if the budget is low → `PRIME.approve(factory, amount)` if short → `factory.deposit(id, amount)` | PRIME to the factory |
| Withdraw | `position.withdraw(amount)` | none |
| Close | `position.close()` | none |
| Resume | `position.resume(intentId)` (rung past its deadline) or `position.resume(0)` (stalled). See §8. | none |

- **Approvals:** approve the exact amount, never `maxUint256`. The ERC20 precompile rejects `uint256.max`.
- **Gas, the main trap:** an out-of-gas inside a rung does **not** revert. `_attempt` catches it and records it as an `AaveRefused` stall, and the outer transaction succeeds. `eth_estimateGas` will happily return a value at which that happens.
  - Use a fixed, generous gas limit per action instead of BIL's `EVM_CALL_GAS = 2_000_000`. The placeholders are 5M for `open` and 3.5M for the others; see §11.
  - Dry-run before signing. The submit is valid only if the dry-run shows a pending intent, or `LadderCompleted` / `Withdrawn` / `Closed`, and not `LadderStopped(AaveRefused, 0)`.

### 4.3 Discovering a user's positions

Decided in [Finding a user's Multiply positions](https://gitlab.com/emildoescode/hydration-ui/-/work_items/96).

1. Read `nextId`.
2. Call `ownerOf(id)` for `1..nextId−1`. Multicall3 is not deployed, and lark3 caps a JSON-RPC batch at 10, so run the calls concurrently in chunks of 10. Follow the pattern in `bil/hooks/useRedemptionQueue.ts:33-65`.
3. Keep the ids whose owner is `useEvmAddress()`, which is correct for both EVM and Substrate accounts.
4. Map each kept id to `predict(id)`.
5. Drop positions where `isClosed()`. Closing does not burn the NFT.

Read ownership live; never cache the opener, because the NFT can be transferred. Logs and indexers can't serve this on mainnet. If the scan gets slow, the fix is an owner index in the contract or Multicall3 (§11).

## 5. Projection math

Decided in [Reusable helpers for projecting a Multiply position](https://gitlab.com/emildoescode/hydration-ui/-/work_items/95). Put it in pure functions with Vitest tests.

For a deposit `E` (collateral value), target leverage `L`, and the reserve's `LT` and `LTV`:

```
collateral = L·E            debt = (L−1)·E            (in value)
HF         = max(LT·L/(L−1), minHf)
liqPrice   = collateralPrice / HF        (vs the debt asset; no liquidation if the e-mode price source prices both the same)
netApy     = L·supplyApy − (L−1)·borrowApy             (on equity)
maxLev     = min(minHf/(minHf−LT), 1/(1−LTV))          (must match factory.maxLeverage)
sliderMax  = floor(maxLev·10 + 1e-9) / 10              (without the epsilon, 1.10/0.22 shows as 4.9×)
rungs      = ⌊ln(m/(k·E)) / ln(k·f)⌋ + 1,  k=(L−1)/L,  m = binding intent floor,  f ≈ 0.995
```

- **Reuse:**
  - `summarizeNetApy` (`core/derive/net-apy.ts`), fed two synthetic positions;
  - `calculateHealthFactorFromBalances` (`core/derive/pool-math.ts`);
  - `ReserveSummary`;
  - the app's `useReserveApy`. PRIME's supply APY is the base rate, plus the Kamino feed, plus incentives (the Kamino part is mainnet only). HOLLAR's borrow APY is its base rate.
- **Build new:** the projector above, `maxLeverage` with the minHf term, and the liquidation price.
- **Port from `upstream/feat/looping`:** the pair LTV/LT helpers in `utils/leverage.ts` and the slider constants.
- **Drop:** everything tied to proxies, batches or steps.

## 6. Strategy card

Decided in [Multiply strategy card content](https://gitlab.com/emildoescode/hydration-ui/-/work_items/97). It uses the existing `StrategyCard`, rendered when `looperEnabled` is on, last in the grid after BIL and HOLLAR Bonds. Pairs appear in config order.

- **Title:** `{{collateral}}/{{debt}} Multiply`, e.g. "PRIME/HOLLAR Multiply".
- **Logo:** the collateral (PRIME) logo only. `StrategyCard.logoId` stays a single id.
- **Stats:**
  - Max APY: `netApy` at `sliderMax`, shown even when negative;
  - Max leverage: "5.0×". The card computes it client-side from the reserve's LT and LTV with `getMaxLeverage`, which mirrors `factory.maxLeverage`, so the card needs no deployed factory. The open form still checks against the factory value.
- **Badges:** `StrategyBadgeType.Leverage`, plus a grey "Unavailable" chip when §9 applies. The card stays clickable either way.
- **Description** (`strategies.json` `cards.multiply.description`): "Multiply your {{collateral}} yield up to {{max}}× by borrowing {{debt}} against it. Your position builds automatically in a few steps."
- **Link and navigation:** `/strategies/multiply/$pairId`. The crumb is the title. Add no entry to the Strategies submenu.

## 7. Detail page

Decided in [Multiply detail page and open form](https://gitlab.com/emildoescode/hydration-ui/-/work_items/98) (prototype variant A) and [Showing and managing a Multiply position](https://gitlab.com/emildoescode/hydration-ui/-/work_items/99).

Route: `/strategies/multiply/$pairId`. An unknown slug redirects to `/strategies`.

Layout:
- **Header:** the stacked pair logo, the title, the subtitle "Supply PRIME · Borrow HOLLAR", and the Leverage chip.
- **Body:** `TwoColumnGrid template="sidebar"`, like `BilVaultPage`. On mobile the form comes first (`order: [1, null, 0]` on the left column).

### 7.1 Left column

1. **My positions.** Copy the structure of BIL's `MyPositionsCard`: a `Paper` with a title and a separator, then `Flex direction="column" gap="m" p="m"`, then one **`PositionCard`** per open position. Hide the whole card when there are none.
   - `logo`: the pair logo.
   - `symbol`: "Position #{{tokenId}}", a status `Chip` (§7.2), a small `ProgressBar` while a ladder runs, and a reason line in danger colour when the position is Paused.
   - `stats` (`ValueStats size="small" font="secondary" wrap`):
     - Net value: `nav()` in PRIME, with USD below;
     - PnL: `pnl()` in PRIME, with % of `principal` below;
     - Leverage: `aaveLeverage()`, with "target {{targetLeverage}}×" below;
     - Health factor: `effectiveHealthFactor()`.
   - *Not built:* the expandable section with collateral, debt and remaining fee budget. `PositionCard` has no expandable slot. The fee budget shows in the Close modal.
   - `cta`: Deposit (micro, muted, outline), then Withdraw and Close (tertiary, small). A Paused position shows Resume (primary) and Close.
2. **Strategy details.** Same structure as BIL's `StrategyDetailsCard`.
   - A stats row: Max APY, Max leverage, PRIME supply APY, HOLLAR borrow APY.
   - Two summaries: Collateral / Debt / Fee asset, and Max LTV / Liquidation threshold / Min health factor.
3. **About.** Short copy saying the position builds step by step through intents, in about a minute or two.

### 7.2 Position status

The contract's 10 states collapse into 5 statuses:

| Status (Chip variant) | Condition | Progress bar |
|---|---|---|
| Active (success) | `ladder = None`, not closed | none |
| Building (info) | `ladder = Ramp`, `stalled = None`, no pending past its deadline | `(aaveLeverage − 1)/(targetLeverage − 1)` |
| Withdrawing (info) | `ladder = Unwind`, `!closing`, as above | none: a partial withdraw keeps its leverage, and the debt at ladder start isn't stored |
| Closing (warning) | `ladder = Unwind`, `closing`, as above | debt repaid toward 0 |
| Paused (danger) | `stalled ≠ None`, **or** pending with `now > pending.deadline` (in ms) | frozen at its last value |

Put this mapping in a pure, tested function.

### 7.3 Right column: the open form

The form always opens a **new** position; top-ups go through the row's Deposit. It is one `Paper p="xl"`, with sections divided by `Separator mx="-xl"`:

1. **Deposit:** an `AssetInput` for PRIME only, with balance + MAX and a USD display value.
2. **Leverage:** a label with the current value on the right, then a `Slider` from min 1.1 to max `sliderMax`, step 0.1, with min/max labels under it.
3. **Multiplied position:** a dimmed `Paper`, "≈ {{collateral}} aPRIME", its USD value, and "{{L}}× leverage".
4. **Open position:** the primary large `LoadingButton`, wrapped in `AuthorizedAction`.
5. **Summary:**
   - Total collateral
   - Total debt
   - Health factor
   - **Liquidation price**: at 1.10 minHf, about a 10% drop liquidates at max leverage, so keep this prominent.
   - Net APY
   - Fee budget (HDX)

Validation:
- the amount is > 0 and ≤ the PRIME balance;
- the HDX balance is ≥ the fee budget;
- the pair is not unavailable (§9);
- the dry-run passes (§4.2).

## 8. Position actions

Decided in [Showing and managing a Multiply position](https://gitlab.com/emildoescode/hydration-ui/-/work_items/99).

- **Modals:** Deposit, Withdraw and Close are modals, like BIL's `WithdrawModal`. While a ladder runs unstalled they are **disabled with a tooltip**, because the contract would revert `Busy`.
  - **Deposit:** needs `ladder = None`, so a Paused position cannot take a deposit either.
  - **Withdraw:** takes an amount in PRIME, capped at the net value. It is also allowed from Paused. The modal explains that the payout arrives once the unwind finishes. Withdrawing the full amount becomes a close, which the contract does on its own. `Withdrawn(requested, paid)` can show `paid < requested`.
  - **Close:** lists what gets swept back to the NFT holder: collateral, debt-asset cash, the leftover fee budget, and any foreign aTokens. It is also allowed from Paused.
- **Resume:** one generic button on a Paused position.
  - If the pending rung is past its deadline, call `resume(intentId)`. Get the id from `useAccountIntents` on the position's Substrate account (`"ETH\0" ++ address ++ 8×0x00`). If the intent was already cleaned up, synthesise it as `(submittedAt·1000) << 64`.
  - If the position is stalled, call `resume(0)`.
  - The per-reason recovery is still open (§11).
- **Cancel:** not exposed.
- **Live updates:** while any of the user's positions has a ladder running, refetch that position's views every 6 s (a fixed interval standing in for every block), then drop back to normal polling once it is idle. v1 shows no rung history.

## 9. Availability

The card and the form show the pair as **unavailable**, with the reason, instead of hiding it, when any of these hold:

- either reserve is frozen or paused, or HOLLAR is not borrowable;
- PRIME's isolation debt ceiling has no headroom;
- HOLLAR's borrow cap or facilitator bucket is full;
- `maxLeverage` returns 0.

The detail page stays reachable in every case, so users can still manage existing positions.

## 10. i18n

Write all copy by hand in `apps/main/src/i18n/locales/en/strategies.json` under a `multiply.*` namespace. Use "Multiply", "position", "leverage" and the five status names. Never use "loop", "rung" or "stall" in copy.

## 11. Open items

These are tracked on the map. Ship with the placeholders above and replace them when each item resolves.

| Item | Ticket | Placeholder until then |
|---|---|---|
| Deploy the `feat/looper` factory on lark3 | [Deploy the feat/looper contracts on lark3](https://gitlab.com/emildoescode/hydration-ui/-/work_items/100) | empty factory address, so `looperEnabled` is off everywhere |
| Per-callback fee, gas per action, real rung timing | [Measure Multiply costs and timing on lark3](https://gitlab.com/emildoescode/hydration-ui/-/work_items/101) | fee reserve 5 HDX; budget formula in §3; gas 5M (`open`) / 3.5M (other actions); the About copy says "a minute or two" |
| Per-stall recovery UX: fee top-up, debt-asset transfer, slippage, `AaveRefused` copy | [Recovering a paused Multiply position](https://gitlab.com/emildoescode/hydration-ui/-/work_items/103) | generic Resume (§8) |
| Pre-sign dry-run of the open batch (§4.2) | none: needs a deployed factory to test against. A batch can't be `eth_call`ed together with its approvals, so it needs a dry-run through the runtime. | the generous gas limits only |
| Advanced settings (slippage, fee budget) | not yet ticketed | defaults from §3 |
| Portfolio, notifications, async-progress toasts | not yet ticketed | none |
| Position scan at scale | none (see §4.3) | concurrent `ownerOf` scan |
