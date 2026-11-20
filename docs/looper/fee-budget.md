# Looper fee budget

How the Multiply (looper) fee budget works on chain, why the UI sends 100 HDX, whether the user's fee payment asset can fund it instead, and what to change.

Sources pinned at:
- UI: `feat/looper-ui` working tree (paths below are under `apps/main/src/modules/strategies/multiply/` unless stated).
- Contracts: [`galacticcouncil/money-market@e04dc47`](https://github.com/galacticcouncil/money-market/tree/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src) (`feat/looper`, the branch `config/abi.ts:1` names).
- Node: [`galacticcouncil/hydration-node@2385304`](https://github.com/galacticcouncil/hydration-node/tree/23853040556c73011f384a4a6b5f05c60893ef76) (`master`, 2026-11-14). Lark 3 may run a different build; not checked.

## TL;DR

- The fee budget is a plain token balance held by the position contract. It pays the ICE **forward fee** that the LazyExecutor charges each time one of the position's intents resolves, which happens once per ladder rung. It is not a pallet reserve or a DCA budget. The remainder goes back to the NFT holder on close.
- **Why 100:** it's a placeholder. The code comment says so (`config/pairs.ts:44`), and the line arrived with the first looper UI commit `3875143a74` ("feat(strategies): looper ui", 2026-10-27), waiting on measurement ticket #101. The contract tests use 1,000 HDX, not 100.
- **Why HDX:** also a default. The contract accepts any `feeAssetId` that `MultiTransactionPayment.set_currency` accepts. HDX is the one currency that can never be delisted.
- **Can it use the user's fee payment asset?** Yes, with four conditions: the asset must be HDX or in `AcceptedCurrencies`; it must not be the pair's collateral, aToken, debt or debt token; amounts must be converted to that asset's decimals and price; and the budget is exposed to that asset being delisted later.
- **There's a sizing problem whatever the asset.** One forward costs about 8.1 HDX on mainnet (garden estimate). `feeReserve = 5 HDX` is below one forward fee, and 100 HDX covers about 12 forwards, while a 3x ramp needs about 11 rungs and a 5x eMode ramp about 20.
- **Recommendation:** compute the budget as forward fee × estimated rungs × margin. Fund it in the user's fee payment asset when that asset is eligible, otherwise in HDX. Raise `feeReserve` to at least one forward fee. Details in "Recommendation" below.

## How it works end to end

1. **UI → factory.** `MULTIPLY_DEFAULTS` hardcodes `feeAssetId: HDX_ASSET_ID`, `feeAsset: getAddressFromAssetId(HDX_ASSET_ID)`, `feeReserve: parseUnits("5", 12)` and `feeBudget: parseUnits("100", 12)` (`config/pairs.ts:39-47`). Custom loops inherit the same defaults (`config/pairs.ts:102-118`). `useOpenCalls` puts `feeAsset`, `feeAssetId` and `feeReserve` into `Params`, approves `feeBudget` of `feeAsset` to the factory, then calls `factory.open(params, amount, feeBudget)` (`hooks/useOpenMultiplyPosition.ts:72-91,116-120`). The value comes from `pair.feeBudget` (`hooks/useOpenMultiplyPosition.ts:165`).
2. **Factory.** `open` transfers `feeBudget` of `p.feeAsset` from the user to the new position clone. Its doc comment says: "funds the position's forward fees; anyone can top it up later with a plain transfer, and the remainder is paid out on close" ([`LooperFactory.sol:44-54`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperFactory.sol#L44-L54)). `_validate` requires `feeAsset` to differ from `collateral`, `aCollateral`, `debt` and `variableDebt`, and to match `feeAssetId` through the asset precompile at `(1<<32)|id` ([`LooperFactory.sol:99-112,139-147`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperFactory.sol#L99-L147)). Nothing on chain checks the size of the budget, which can be 0 (`if (feeBudget > 0)`).
3. **Position sets its own fee currency.** `initialize` and `deposit` call `_feeCurrency`, which dispatches `MultiTransactionPayment.set_currency(feeAssetId)` (pallet 203, call 0) through the dispatch precompile `0x…0401`, with the position as origin. Both revert `FeeCurrencyRejected` if the dispatch fails. Owner actions use the non-reverting `_tryFeeCurrency` ([`LooperLogic.sol:71-101,583-591`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L583-L591), [`lib/Dispatch.sol`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/lib/Dispatch.sol)).
4. **Gate per rung.** `_submit` reads `feeAsset.balanceOf(position)` and stalls with `FeeBudgetLow` if the balance is below `feeReserve`. Otherwise it submits an ICE intent with an `on_resolved` forward back to the position ([`LooperLogic.sol:437-439`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L437-L439); "a rung submits only while that balance is at least `feeReserve`", [`ILooperPosition.sol:32-33`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/interfaces/ILooperPosition.sol#L32-L33)). The UI shows this stall as `Stall.FeeBudgetLow` (`config/abi.ts:179-189`).
5. **Who charges the fee.** When the solver resolves the intent, `Intent::queue_forward` calls `LazyExecutor::queue(owner = position, …)` ([`intent/src/lib.rs:1139-1159`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/intent/src/lib.rs#L1139-L1159)). `add_to_queue` computes `compute_fee(len, weight = dispatch_top_base + gas_to_weight(GasLimit))` and withdraws it from the position through `OnChargeTransaction::withdraw_fee`, using a `system.remark` call as a stand-in ([`lazy-executor/src/lib.rs:335-397`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/lazy-executor/src/lib.rs#L335-L397)). The forward gas limit is `IntentForwardGasLimit = 2_000_000` ([`runtime/hydradx/src/assets.rs:1690`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/runtime/hydradx/src/assets.rs#L1690)).
6. **In which currency.** `OnChargeTransaction` is multi-payment's `TransferFees` ([`runtime/hydradx/src/system.rs:680-681`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/runtime/hydradx/src/system.rs#L680-L681)). `withdraw_fee` resolves the currency, which for `remark` is `account_currency(position)`, converts the HDX-denominated fee with the currency's price, and withdraws it ([`transaction-multi-payment/src/lib.rs:748-775,877-882`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/transaction-multi-payment/src/lib.rs#L748-L775)). `account_currency` returns the stored currency while it is HDX or still accepted. Otherwise it falls back to WETH for EVM accounts and HDX for others ([`lib.rs:620-633`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/transaction-multi-payment/src/lib.rs#L620-L633)). `set_currency` accepts HDX or any `AcceptedCurrencies` key ([`lib.rs:656-668`](https://github.com/galacticcouncil/hydration-node/blob/23853040556c73011f384a4a6b5f05c60893ef76/pallets/transaction-multi-payment/src/lib.rs#L656-L668)).
7. **If the position can't pay**, the fill still lands but no forward is queued (`FailedToQueueCallback`). The holder then settles the rung with `resume` (garden `research/ice-callback-vs-router-buy-2026-11-07/README.md:83,144`; [`LooperLogic.sol:587-588`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L587-L588)).
8. **On close**, `_finish` sweeps the whole `feeAsset` balance to the NFT holder ([`LooperLogic.sol:384`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L384)). The UI shows this as "Fee budget returned" (`components/MultiplyWithdrawSummary.tsx:114-117`).

The fee that matters is the **position's** currency, which the contract sets. The user's own `AccountCurrencyMap` entry only decides which asset the user already holds.

## How big it needs to be

- **Per forward:** about **8.1 HDX** on mainnet at the multiplier current on 2026-11-07, computed as `query_weight_to_fee(50,547,783,000 ref_time)` = 7.79 HDX plus about 0.3 HDX of length fee. This is derived from the weight formula, not read from a `Queued.fees` event (garden `research/ice-callback-vs-router-buy-2026-11-07/README.md:83`). It moves with `TransactionPayment.NextFeeMultiplier` (bounded 1/1000…320, `system.rs:673-675`).
- **Forwards per position:** one per rung. The UI already has `estimateRampRungs` (`utils/projection.ts:73-93`), which nothing calls outside its tests. With `minHf` 1.10, it gives 11 rungs at 3x (LT 0.80 or 0.93), 20 at 5x and 26 at 8x (LT 0.93, eMode). Unwind and close rungs come on top, and their count is not estimated here.
- **Result:** 100 HDX ≈ 12 forwards, so it is short for anything above about 3x. A larger budget only ties up capital, because the remainder is refunded. `feeReserve = 5 HDX` is **below one forward fee**, yet the contract's own note says the reserve should stay "above one callback's fee" ([`LooperLogic.sol:190`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L190)). A rung can therefore submit with 5–8 HDX left and then fail to queue its forward, which leaves it pending until a manual `resume`. The contract tests use `FEE_RESERVE = 5e12` and `FEE_BUDGET = 1_000e12` ([`test/helpers/Fixture.t.sol:28-29`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/test/helpers/Fixture.t.sol#L28-L29)).
- `feeReserve` and `feeBudget` are in fee-asset base units. `parseUnits(x, 12)` is correct only for 12-decimal HDX (`config/pairs.ts:45-46`).

## What the app already has

- **User's fee asset:** `useAccountFeePaymentAssetId` reads `MultiTransactionPayment.AccountCurrencyMap` and defaults to WETH for EVM accounts and HDX otherwise (`apps/main/src/api/payments.ts:87-109`). The accepted list comes from `useAcceptedFeePaymentAssets` (`api/payments.ts:37-84`).
- **HDX → fee asset conversion:** `convertNativeFeeToFeeAsset` tries the router spot price first, then the `AcceptedCurrencies` price (`apps/main/src/modules/transactions/utils/permitFee.ts:133-160`). The chain itself uses the oracle/`AcceptedCurrencies` price (`get_currency_price`, multi-payment `lib.rs:672-705`).
- **Existing positions** read `feeAssetId`, `feeAsset` and `feeReserve` from `position.params()` and the budget from `feeAsset.balanceOf` (`hooks/useMultiplyPositions.ts:145-147,161,178`). Display already uses `pair.feeAssetId`, so positions funded in other assets would render without changes.
- **Pay-max logic** already holds the budget back only when the pay asset equals the fee asset (`utils/pay.ts:22-37`, `hooks/usePayAsset.ts:146,170-174`).
- There's no top-up or `setFeeReserve` UI, even though the stall exists (`strategies.json:115`).

## Options

| # | Option | Pros | Cons |
|---|---|---|---|
| A | Keep HDX, keep 100 | No work | Short above ~3x (stalls). Blocks users with no HDX (`MultiplyOpenForm.tsx:148,307-308`). `feeReserve` < one forward. |
| B | Keep HDX, size dynamically: `fee/forward × rungs × margin` | HDX can't be delisted. HDX is never a pair asset, so no collision (unverified: HDX is not a money-market reserve today). Single decimals. | Still needs HDX in the wallet. |
| C | Always the user's fee payment asset, converted | Best UX: user already holds it | Fails for pairs that use it, e.g. a DOT payer on vDOT/DOT or a HOLLAR payer on PRIME/HOLLAR (`_validate` distinctness). Asset could be delisted mid-life, which falls back to WETH so forwards stop queueing until a manual `resume` ([`LooperLogic.sol:587-588`](https://github.com/galacticcouncil/money-market/blob/e04dc47cf3c2b5792215a6efe348f4eceb685d79/looper/src/LooperLogic.sol#L587-L588)). The budget's HDX value drifts with price. ERC20-bound assets (HOLLAR) need the right `feeAsset` address: unverified whether the precompile address works for transfers. |
| D | User's fee asset when eligible, else HDX (B's sizing for both) | UX of C where safe, B's robustness otherwise | One eligibility rule plus conversion to maintain |
| E | Pay in anything, swap to HDX inside the open batch | One asset for everything | Most code, adds a swap and slippage. `MULTIPLY_PAY_WITH_OTHER_ASSETS` is off (`config/constants.ts:19-21`). |

Ways to get the per-forward fee, for B, C and D:
1. Hardcode a constant per network. Simplest, but it drifts with the multiplier.
2. Compute `TransactionPaymentApi.query_weight_to_fee(dispatch_top_base + 2,000,000 × 25,000)` × `NextFeeMultiplier`, plus length fee. This mirrors `compute_fee`. Unverified: that papi exposes this runtime API typed in this app.
3. Read recent `LazyExecutor.Queued { fees }` events through the indexer. Exact but needs history.

## Recommendation

Use **D with B's sizing**. Also raise `feeReserve` to at least one forward fee plus margin.

1. **Size.** `budgetHdx = forwardFeeHdx × (estimateRampRungs(leverage, lt, minHf) + unwindAllowance) × 1.5`, and `reserveHdx = forwardFeeHdx × 1.5`. For `forwardFeeHdx`, use way 2 above, with a hardcoded ~8.1 HDX fallback. Wire up `estimateRampRungs` (`utils/projection.ts:77`).
2. **Pick the asset.** Use `useAccountFeePaymentAssetId()` (`api/payments.ts:87`) if all of these hold: it's HDX or accepted (`useAcceptedFeePaymentAssets`); its id and address are none of `collateral`, `aCollateral`, `debt` or `variableDebt`; and the user's transferable balance covers the budget. Otherwise use HDX. Optionally let the user override with a selector of their accepted currencies, reusing the Settings `PaymentAsset` list (`apps/main/src/modules/layout/components/Settings/PaymentAsset.tsx`).
3. **Convert** both amounts with `convertNativeFeeToFeeAsset` (`modules/transactions/utils/permitFee.ts:133`) into the asset's own decimals. The 1.5 margin absorbs price drift.
4. **Plumb.** Drop `feeAssetId`, `feeAsset`, `feeReserve` and `feeBudget` from `MULTIPLY_DEFAULTS`/`MultiplyPair` (`config/pairs.ts:31-35,42-46`) and return them from a new `useLooperFeeBudget(pair, leverage)` hook. Consume it in `useOpenCalls` (`hooks/useOpenMultiplyPosition.ts:72-90`), `useOpenMultiplyPosition` (`:165`), `useOpenMultiplyEntry` (`hooks/useOpenMultiplyEntry.ts:168`), `usePayAsset` (`:146,170-174`) and the gate and copy in `MultiplyOpenForm.tsx:148,238,307-308,548-552,640-645`. Existing positions keep reading from `params()`.
5. **Follow-ups.** Add a "Top up fee budget" action, a plain ERC20 `transfer` of `feeAsset` to the position, shown on `FeeBudgetLow` (`components/MultiplyPositionsCard.tsx:79`), and later a `setFeeReserve` control. Ask the contract team whether `FEE_RESERVE = 5e12` in tests matches their intended production reserve. They own ticket #101.

Choose plain B instead of D if the team prefers one asset to reason about. It fixes the sizing and reserve problems, and only the "no HDX" UX remains.

## Unverified

- The 8.1 HDX per-forward figure is a garden estimate from the weight formula at 2026-11-07 mainnet multiplier, not an observed `Queued.fees` event, and not checked on Lark 3.
- That HDX is not, and won't be, a money-market reserve (needed for B's "no collision" claim).
- Whether an ERC20-bound asset (HOLLAR) can be the `feeAsset` through its precompile address, or needs its bound contract address.
- That the Lark 3 runtime matches node `master@2385304`.
- That papi exposes `TransactionPaymentApi.query_weight_to_fee` typed in this app.
- The number of unwind/close rungs.
