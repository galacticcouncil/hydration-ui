# Looper slippage: can the user set it, and what would it control?

Research for adding a slippage setting to the looper ("Multiply") open form. Read 2026-11-20. Every claim cites the source that owns it.

Pinned sources:

| Source | Revision |
| --- | --- |
| `next-hydration-ui` (local) | branch `feat/looper-ui`, head `062b8f8bf` |
| `galacticcouncil/money-market` looper contracts | `feat/looper2` @ [`63c89208`](https://github.com/galacticcouncil/money-market/tree/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src). The lark-3 deployment records commit [`1a835f3`](https://github.com/galacticcouncil/money-market/tree/1a835f34bc9cec8072f337d459c08e61f13e65d4/looper/src) ([`looper/deployments/lark-3.json`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/deployments/lark-3.json)). Every slippage line below is identical in both. `1a835f3`'s `LooperLogic.sol` sits one line lower. |
| `galacticcouncil/hydration-node` | master @ [`23853040`](https://github.com/galacticcouncil/hydration-node/tree/23853040556c73011f384a4a6b5f05c60893ef76) |

> The UI's ABI header says the contracts are on `feat/looper`, `looper/src` ([`config/abi.ts:1`](../../apps/main/src/modules/strategies/multiply/config/abi.ts)). That is wrong: `feat/looper` has no `looper/src`, only an off-chain `juicer-vault/looper` service. The Solidity is on **`feat/looper2`**.

## TL;DR

- **The contract already takes slippage.** `Params.slippageBps` (`uint16`, basis points) is part of `factory.open(p, amount, feeBudget)`. It is stored on the position, and the owner can change it later with `position.setSlippage(uint16)`. Today the UI hardcodes it to **100 bps (1%)** for every pair, presets and custom loops alike ([`pairs.ts:40-49`](../../apps/main/src/modules/strategies/multiply/config/pairs.ts)).
- **It is not a router `min_amount_out` on one swap.** The ladder applies it to *every* rung. Each rung is an ICE swap intent (`Intent.submit_intent`) whose `amount_out` floor is the **Aave-oracle fair value × (1 − slippage)**. Ramp rungs sell debt for the aToken. Unwind rungs (withdraw/close) sell the aToken for debt. The intent pallet rejects any resolution below that floor, so a rung that can't clear just doesn't fill. It is returned at the 5-minute deadline and the ladder **stalls**, with no revert and no loss.
- **A user-set value is feasible, with no contract change.** Convert % to bps and pass it in place of `pair.slippageBps` in `useOpenCalls`. The fill checks and the "can't fill / can't unwind at X%" copy read the same field and must use the same value. Existing positions could get a "change slippage" action by adding `setSlippage` to the ABI.
- **The separate step-1 sell (pay with another asset) already uses the global swap slippage.** It is a normal router sell built with `useTradeSettings().swap.single.swapSlippage`. That path is currently switched off (`MULTIPLY_PAY_WITH_OTHER_ASSETS = false`).

## 1. Where the looper lives and how a loop is built

**UI.** `apps/main/src/modules/strategies/multiply/`:

- form: [`components/MultiplyOpenForm.tsx`](../../apps/main/src/modules/strategies/multiply/components/MultiplyOpenForm.tsx)
- custom pair picker: `components/CustomLoopWizard.tsx`
- entry hooks: `hooks/useOpenMultiplyPosition.ts` (pay with the collateral) and `hooks/useOpenMultiplyEntry.ts` (two-step pay-with-other-asset, from commit `1f714cfba`)
- pure helpers: `utils/entry.ts`, `utils/projection.ts`, `utils/loops.ts`

`packages/money-market` and `api/borrow` are not on the open path. The module talks to the factory directly through viem (`evm.readContract`) and an EVM batch (`useVaultEvmCall` from the BIL module).

**Pair config.** `MULTIPLY_DEFAULTS` holds `minHf 1.10`, `stepHf 1.05`, **`slippageBps: 100`**, the HDX fee asset, `feeReserve 5 HDX` and `feeBudget 100 HDX` ([`pairs.ts:40-49`](../../apps/main/src/modules/strategies/multiply/config/pairs.ts)). Presets spread it in (`pairs.ts:51-77`), and so do custom loops (`buildCustomLoop`, `pairs.ts:104-120`). The factory address comes from `VITE_LOOPER_FACTORY_ADDRESS` (`pairs.ts:14`). It is `0xfa456bAF…cA2f` in `apps/main/.env.production:17`, the same address as the lark-3 deployment, and `VITE_EVM_CHAIN_ID=222222` in both env files.

**Path A, paying with the collateral (the only path today).** `useOpenMultiplyPosition` → `useOpenCalls` ([`useOpenMultiplyPosition.ts:48-126`](../../apps/main/src/modules/strategies/multiply/hooks/useOpenMultiplyPosition.ts)) builds one EVM batch:

1. `ERC20.approve(factory, amount)` on the collateral, if the allowance is short (lines 86-110)
2. `ERC20.approve(factory, feeBudget)` on the fee asset, if short
3. `LooperFactory.open(params, amount, feeBudget)` (lines 112-120), with:

```ts
// useOpenMultiplyPosition.ts:65-82
const params = {
  collateral, aCollateral, debt, variableDebt, feeAsset,
  debtAssetId, aCollateralAssetId, feeAssetId, eMode,
  slippageBps: pair.slippageBps,              // ← hardcoded 100
  leverage: parseUnits(leverage.toFixed(2), 18),
  minHf: pair.minHf, stepHf: pair.stepHf, feeReserve: pair.feeReserve,
  minIntentDebt, minIntentAToken,             // max(2×ED, 1% of deposit), projection.ts:97-133
}
```

The batch is wrapped by `buildBatchTx(calls, MULTIPLY_OPEN_GAS)` (line 177). There are no flash loans and no router swap in the user's transaction.

**Path B, paying with another asset (behind `MULTIPLY_PAY_WITH_OTHER_ASSETS = false`, [`constants.ts:15-17`](../../apps/main/src/modules/strategies/multiply/config/constants.ts)).** [`useOpenMultiplyEntry.ts:56-225`](../../apps/main/src/modules/strategies/multiply/hooks/useOpenMultiplyEntry.ts) takes two signatures:

- **Step 1** is a router sell of the pay asset into the collateral share token, prebuilt by `usePayQuote`.
- **Step 2** is Path A's batch, opened with exactly what step 1 delivered. That amount is read from `Router.Executed` events, or from a balance diff (`utils/entry.ts:27-45`).

**On chain**, `LooperFactory.open` ([`LooperFactory.sol:46-59`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperFactory.sol#L46-L59)) does the following:

- validates the params
- clones a `LooperPosition` and mints the NFT
- pulls the fee budget, then `initialize(id, p)`
- pulls the collateral, then `deposit(amount)`

`deposit` supplies to Aave, sets `ladder = Ramp` and runs the first rung ([`LooperLogic.sol:99-112`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L99-L112)). Each ramp rung (`_rung`, [`LooperLogic.sol:273-293`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L273-L293)):

1. borrows the gap up to the deploy HF (`pool.borrow`, variable rate)
2. submits an ICE intent from the contract through the dispatch precompile `0x…0401`: `Intent.submit_intent(Swap{debtAssetId → aCollateralAssetId, amountIn, minOut, partial: false}, deadline = now + 5 min, on_resolved = Forward{position, abi.encode(kind, nonce)})` ([`Dispatch.sol:13-44`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/lib/Dispatch.sol#L13-L44), [`LooperLogic.sol:436-468`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L436-L468))

When a solver resolves the intent, the lazy executor calls `position.execute(...)`. That checks `amountOut >= p.minOut` and runs the next rung ([`LooperLogic.sol:198-221`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L198-L221)). The ramp ends once a rung would fall under `minIntentDebt` / `minIntentAToken`.

Leverage therefore builds asynchronously over several blocks. The user signs only the first transaction.

## 2. Slippage parameters in the call path

| Where | Parameter | Value today |
| --- | --- | --- |
| `factory.open` → `Params.slippageBps` (`uint16`) | per-rung floor for both ramp and unwind | **hardcoded 100 bps**: `MULTIPLY_DEFAULTS.slippageBps: 100` ([`pairs.ts:43`](../../apps/main/src/modules/strategies/multiply/config/pairs.ts)), passed at [`useOpenMultiplyPosition.ts:75`](../../apps/main/src/modules/strategies/multiply/hooks/useOpenMultiplyPosition.ts) |
| `position.setSlippage(uint16)` | changes the stored value later | **absent from the UI ABI** ([`config/abi.ts:96-170`](../../apps/main/src/modules/strategies/multiply/config/abi.ts) lists `withdraw`, `close`, `resume` and views). `useMultiplyPositionWrites` only knows `"withdraw" \| "close" \| "resume"` (`useMultiplyPositionWrites.ts:33`) |
| `withdraw(amount)` / `close()` | none: they reuse the stored `slippageBps` | — |
| Step-1 router sell (Path B) | `min_amount_out` from SDK `.withSlippage(slippage)` | **global swap setting**: `useTradeSettings((s) => s.swap.single.swapSlippage)` ([`usePayAsset.ts:56`](../../apps/main/src/modules/strategies/multiply/hooks/usePayAsset.ts), passed to `bestSellWithTxQuery` at 62-68 → `bestSellTxQuery` `.withSlippage(slippage)` at [`api/trade.ts:65-80`](../../apps/main/src/api/trade.ts)). The summary shows the min received through `useMinimumTradeAmount` (`usePayAsset.ts:89`, `RemoveMoneyMarketLiquidity.utils.tsx:383-394`) |
| Fill checks (UI only) | `pair.slippageBps − FILL_MARGIN_BPS (25)` | quotes must lose ≤ 75 bps against oracle prices ([`useLoopFills.ts:108, 141-145`](../../apps/main/src/modules/strategies/multiply/hooks/useLoopFills.ts), [`utils/loops.ts:86`](../../apps/main/src/modules/strategies/multiply/utils/loops.ts)) |
| User-facing copy | `pair.slippageBps / 100` | "can't fill … at {{slippage}}" ([`MultiplyOpenForm.tsx:489-495`](../../apps/main/src/modules/strategies/multiply/components/MultiplyOpenForm.tsx)), "can't unwind … at {{slippage}}" ([`CustomLoopWizard.tsx:113-116`](../../apps/main/src/modules/strategies/multiply/components/CustomLoopWizard.tsx)); strings at `i18n/locales/en/strategies.json:75, 152` |

Existing positions are read back with their own on-chain `params.slippageBps` ([`useMultiplyPositions.ts:145`](../../apps/main/src/modules/strategies/multiply/hooks/useMultiplyPositions.ts)), so a custom value survives a reload.

## 3. On-chain enforcement

**Validation.**

- `factory.open` reverts `InvalidParams` when `p.slippageBps >= 10_000` ([`LooperFactory.sol:126`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperFactory.sol#L126)). There is no lower bound, so `0` is accepted.
- `setSlippage` is `onlyOwner`, i.e. the current NFT holder ([`LooperPosition.sol:78-80`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperPosition.sol#L78-L80)). It reverts `SlippageTooHigh` on `>= 10_000` ([`LooperLogic.sol:183-187`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L183-L187)).
- The value is stored at init ([`LooperLogic.sol:83`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L83)).

**Ramp floor (per rung, oracle-relative)**, [`LooperLogic.sol:279-286`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L279-L286):

```solidity
(uint256 pC, uint256 pD) = _prices(s, pool);   // Aave oracle, or the eMode price source
uint256 fair = fromBase(toBase(amountIn, pD), pC);
uint256 minOut = fair * (BPS - s.slippageBps) / BPS;
uint256 reconcileOut = Units.sat(minOut, A_TOKEN_ROUNDING);
if (amountIn < s.minIntentDebt || minOut < s.minIntentAToken || reconcileOut == 0) { _completeRamp(...); }
```

`_prices` reads the Aave oracle, or the eMode category's `priceSource` when it has one ([`LooperLogic.sol:597-609`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L597-L609)). **The reference price is the oracle, not a router quote.** Slippage therefore bounds the loss against the oracle: pool price impact plus any pool-vs-oracle gap.

**Unwind floor (withdraw and close)**, [`LooperLogic.sol:323-347`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L323-L347). The sliver size is *grossed up* by slippage, `_grossColl = base × BPS / (BPS − slip)` (lines 429-432). `minOut = oracleValue(sliver) × (BPS − slip) / BPS`. A larger slippage sells more collateral per exit rung and accepts less debt back.

**Where the floor binds.** `minOut` becomes the intent's `amount_out` ([`LooperLogic.sol:441-451`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L441-L451)). For a non-partial swap, the intent pallet requires `resolve.amount_in == amount_in && resolve.amount_out >= amount_out`, or it fails with `LimitViolation` ([`pallets/intent/src/lib.rs:989, 1033-1034`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/intent/src/lib.rs#L1033-L1034)). The position checks again in `execute` (`amountOut < p.minOut` → `WrongIntent`, LooperLogic.sol:215-218).

**Failure mode.** If no solver can meet the floor, the intent stays unresolved until its 5-minute deadline (`TTL_MS`, LooperLogic.sol:24). The deadline is validated by the pallet ([`intent/src/lib.rs:549-552`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/intent/src/lib.rs#L549-L552)). The owner then calls `resume(intentId)`, which removes or reconciles the intent and marks the stall `Returned` ([`LooperLogic.sol:156-181`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L156-L181)). The position holds whatever leverage it reached. Funds aren't lost, but the target leverage isn't reached either, and the borrowed debt for that rung sits as cash until resumed.

**Not slippage-controlled:**

- the final health factor, which is governed by `minHf` / `stepHf` / `_deployHf`
- the HF floor in emergency unwind (`EMERGENCY_FLOOR 1.01`)
- the exit cap at 90% of headroom (`CAP_BPS`)

These are separate params ([`LooperLogic.sol:22-34, 326-330`](https://github.com/galacticcouncil/money-market/blob/63c89208a1cc9382f14b790f59e321a101a4a35c/looper/src/LooperLogic.sol#L22-L34)).

**Protocol docs index.** [`galacticcouncil/hydration/CLAUDE.md`](https://raw.githubusercontent.com/galacticcouncil/hydration/main/CLAUDE.md) only points to the hydration-node, aave-v3-deploy, UI and SDK repos. It has no looper or ICE reference doc. The intent pallet source above is the primary source.

## 4. How the rest of the app handles slippage

- **Store.** `useTradeSettings` is a zustand store persisted as `trade-settings` (v3) ([`states/tradeSettings.ts:126-153`](../../apps/main/src/states/tradeSettings.ts)). It holds:
  - `swap.single.swapSlippage` (default **1**%)
  - `swap.split.twapSlippage` (3)
  - `liquidity.slippage` (3)
  - `dca.slippage` (1)

  Trade slippage has a min of `MIN_TRADE_SLIPPAGE = 0.5` and a max of 100 (lines 34-48, 101-120). Values are in **percent**.
- **Editor component.** `TradeSlippage` takes the props `slippage`, `onSlippageChange`, `options` (default `[1, 2, 3]`), `helpTooltip`, `description` and `error` ([`TradeSlippage.tsx:15-31, 106`](../../apps/main/src/modules/trade/swap/components/SettingsModal/TradeSlippage.tsx)). Users:
  - the swap settings modal (`SwapSettings/SingleTradeSection.tsx`)
  - `TradeLimit` / `TradeLimitRow`, a summary row with an edit button that writes straight to the store ([`TradeLimitRow.tsx:31-57, 116`](../../apps/main/src/modules/liquidity/components/TradeLimitRow/TradeLimitRow.tsx)). It is reused by liquidity forms and by Juicer's `ClaimModalForm.tsx:125`.
- **Math helper.** `calculateSlippage(amount, pct)` ([`api/utils/slippage.ts`](../../apps/main/src/api/utils/slippage.ts)). It is used by BIL and Juicer writes (`bil/hooks/useVaultWrites.ts:531`, `juicer/hooks/useVaultWrites.ts:644`).

Reuse options for the looper:

- **(a)** Drop `<TradeLimit type={TradeLimitType.Trade} />` into the form summary and derive `slippageBps = round(swapSlippage × 100)`. Cheapest, but it couples the looper to the user's swap preference, which is shared with every swap.
- **(b)** Add a `strategies.multiply.slippage` key (or similar) to the store and render `TradeSlippage` in a small modal or row. The looper value is semantically different (vs. oracle, per rung, also governs future exits), so a separate key is defensible.

## 5. Garden notes

- `garden/research/money-market-pr97-pashov-2026-11-13/README.md` is a three-round Pashov review of the **same frozen source `63c89208`** (PR 97). It found no high or critical issue. Its P2 items are late-refund recovery, double-counted refunds in NAV/effective HF, and mixed-collateral sizing in `_cap` / `_finish`. None concerns slippage. `raw/round-1-agent-2.md:11` confirms `setSlippage` (with withdraw, close, cancel, resume and setFeeReserve) is gated to the current NFT holder. `raw/round-1-agent-1.md:50` uses `slippageBps = 100` in an exit-cap example.
- `garden/src/site/notes/wiki/ice.md:61, 93, 101, 138` covers ICE mechanics. A swap intent's `amount_out` is the hard minimum. Non-partial resolution needs `amount_out ≥ limit`. Score is the surplus over users' limits, which the solver maximises. ICE is a uniform-clearing-price batch (line 140).
- `garden/research/ice-callback-vs-router-buy-2026-11-07/README.md` describes the `on_resolved: Forward` → lazy executor → `execute(...)` callback the looper relies on. It notes settlement and the forward land in **separate blocks**, and a failed forward rolls back only itself.
- `garden/hydration-strategy-call-2026-11-03-analysis.md:50-60` covers product context (a wstETH ETH loop, "Martin's standalone looper"). Nothing on slippage.

## 6. Conclusion

**Feasible: yes, with no contract work.** `slippageBps` is already a per-position input to `factory.open`, and it can be changed later through `setSlippage`.

**What it would control:**

1. The minimum aToken out per **ramp** rung, against the oracle.
2. The minimum debt out per **unwind** rung, against the oracle, for every future `withdraw` and `close` (until changed).
3. The size of each exit sliver, which grows with slippage.

It does **not** bound final HF or total entry cost. Each rung may lose up to the slippage, and costs compound across rungs. The fair value used is the Aave oracle, so a pool trading away from the oracle by more than the slippage stalls the ladder. Raising slippage is the user's lever to get it filled.

**Values that need to flow:**

- **form → `useOpenCalls`.** Pass `slippageBps` as an `OpenCallArgs` field instead of reading `pair.slippageBps` (`useOpenMultiplyPosition.ts:35-41, 75`). It must be an integer, `0 ≤ bps < 10_000`. Enforce a sensible UI min/max, e.g. reuse `MIN_TRADE_SLIPPAGE` 0.5% and cap well under 100%.
- **The same value → `useLoopFillCheck` / `useLoopFillHints`.** These read `pair.slippageBps − 25` (`useLoopFills.ts:108, 141`). The value also goes to the `cantFill` / `cantUnwind` copy (`MultiplyOpenForm.tsx:493`, `CustomLoopWizard.tsx:115`). Otherwise the form validates against 1% while opening at X%.
- **Path B.** The step-1 router sell already uses `swapSlippage`. Decide whether one control drives both legs or they stay separate.
- **Optional: existing positions.** Add `setSlippage(uint16)` to `LOOPER_POSITION_ABI`, and `"setSlippage"` to `useMultiplyPositionWrites`'s `functionName` union. Expose it on the position card, especially for a stalled `Returned` ladder or a close that can't unwind.

**Open questions and risks:**

- **Default and bounds.** The contract allows 0-99.99%. With a single protocol solver, does a loose floor get filled near the floor? ICE scores surplus (wiki/ice.md:138), but competition is unverified. Ask the contract author for a recommended max.
- **Units mismatch.** The store is in percent, the contract in bps. A rounding mistake (e.g. 0.5% → 50, not 5) silently changes protection.
- **Exit coupling.** The open-time value also governs future exits. A user who opens at 0.5% may later be unable to close in thin liquidity until they call `setSlippage`, which needs the ABI addition above.
- **Branch/source drift.** The ABI comment points at `feat/looper`, but the source is `feat/looper2`. The deployed lark-3 factory is `1a835f3`, not the branch head. The slippage code is identical in both, but re-check on redeploy.
- **Environment.** `.env.production` sets the lark-3 (chain 222222) factory. Confirm which network the mainnet dev server is expected to exercise before verifying by eye.
- **Fill margin.** `FILL_MARGIN_BPS = 25` is a fixed buffer. At very low user slippage (≤ 0.25%), `slippage − 25` goes to zero or negative and every loop shows "can't fill". Clamp it or scale it.
