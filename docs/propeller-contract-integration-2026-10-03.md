# Propeller UI contract integration — five validation rounds

The Juicer UI in [hydration-ui #3978](https://github.com/galacticcouncil/hydration-ui/pull/3978)
now supports the controlled-deposit and separate yield-ownership interfaces in
[money-market #62](https://github.com/galacticcouncil/money-market/pull/62).
Validation used contract revision `6cac12f7982b9a867c9a2ee8696a32f5ad7f18c2` and
UI base `efbfbd2f6d4ac60e4a36ac4eef006036e14c63b3`.

## Resulting behavior

Deposits discover the controller and source bindings from the configured vault.
The form reads the shared entry budget, lane minimum and maximum, policy expiry,
collateral price, LTV and remaining vault capacity at one block. Bigint sizing
preserves token precision and allows for USD8 rounding. Unknown or failed reads,
expired/exhausted budgets, underfunding and zero capacity disable deposits.
The actual contract preview remains authoritative; a refill is permitted volume,
not evidence that market liquidity has recovered.

The depositor approves the **vault**. When approval is necessary it completes
before the contract preview, without closing the form. The UI refreshes account
binding between the steps and waits briefly for approval to appear at the quote
block. It previews as the original payer, then encodes `ExecutionController.execute`
with the canonical reference block/hash, exact maximum input per observed lane
and an output floor 2 bp below the preview. The deadline is the smaller of 90
seconds and the controller's permitted age. On-chain quote age, block age,
independent oracle floors and shared budgets still apply. Failed previews never
fall back to direct deposits. Gas is estimated for the complete controller route,
with a 20% margin bounded by the block and native transaction limits.

The form revalidates an entered amount when available capacity or balance changes.
MAX and withdrawal instructions preserve exact decimal strings; amounts with
excess precision are rejected rather than rounded. Withdrawal completion uses
integer repayment comparisons. Failed balance reads no longer turn positions into
zero balances, and position collateral uses the same-block `convertToAssets` view.
Funded earnings remain separate from estimated unconverted source value, including
when ordinary position shares have already been withdrawn.

The previous “Estimated APY” was an annual carry calculation. The label now says
**Est. APR before swaps**. The calculation converts the displayed source APY to
hourly-equivalent annual accrual, subtracts source borrowing, applies the harvest
fee to positive source carry, then subtracts the discounted Main borrowing leg.
It shows negative carry instead of concealing it as missing data. This is an
indicative current-rate calculation: swap fees, slippage, admission/harvest delays
and historical oracle reporting gaps are excluded. It is not funded crypto APY.

## Five self-feeding rounds

| Round | Finding and correction | Verification |
| --- | --- | --- |
| 1 | Direct vault deposits were incompatible with bound execution controls; approval must precede a transfer-based preview. Added the execution envelope, freshness checks and route gas estimate. | 17 targeted tests passed. |
| 2 | TVL headroom did not enforce the shared entry budget, minimum or expiry. Added pinned policy discovery, exact sizing and fail-closed form/mutation checks. | 25 targeted tests passed, including collateral scales, prices, LTVs, exhausted/expired policies and RPC failures. |
| 3 | Number conversion could round withdrawal MAX and an unpaid debt remainder; displayed “APY” treated source APY as APR. Preserved exact instructions/completion and corrected rate presentation. | 29 targeted tests passed; full type check and Vite 8 production build passed after generating workspace artifacts. |
| 4 | Browser interaction exposed a stale valid amount after the budget shrank. Added form revalidation and precision feedback. | The browser regression fails with revalidation removed and passes restored. Browser checks cover submission, minimum/maximum, exact MAX, shrinking limits, unavailable reads, underfunding and expiry. |
| 5 | Audited quote lifetime boundaries and unconfirmed approval timeout, then repeated the complete integration checks. | 66 application tests across 9 files passed (32 Propeller tests), Propeller ESLint, full TypeScript, Vite 8 build, browser form checks and 58 compiled ABI comparisons passed. |

Evidence is in [the validation directory](evidence/propeller-ui-five-rounds-2026-10-03/manifest.json).
The production build retains its large-chunk warning. No production dependency
was added. Browser form checks use the actual deposit component/form hooks with
mocked contract reads, wallet submission, shared validators and presentational
components. They are interaction regressions, not a native-chain execution test.
A separate production-build browser check uses the actual app and configured RPCs
at desktop/mobile widths without connecting a wallet. Screenshots were unavailable
because capture stalled in this headless environment; DOM checks completed.

## Reproduction

From `apps/main`, after installing dependencies and building the workspace's
required generated artifacts:

```sh
yarn test
yarn lint:ts
yarn eslint src/modules/strategies/propeller
node ../../node_modules/vite/bin/vite.js build
node tests/propeller-abi.mjs /path/to/money-market/propeller-vault/out
```

For the browser component checks, run the dedicated local fixture server:

```sh
node ../../node_modules/vite/bin/vite.js --config tests/propeller-browser/vite.config.mjs
node tests/propeller-browser/check.mjs
```

The check uses an installed Playwright package and Chromium. `PLAYWRIGHT_MODULE`
can point to a separately installed package; `CHROMIUM_PATH` can select an existing
browser. The fixture does not connect a wallet or submit a real transaction.
For the actual production page, start Vite preview on `127.0.0.1:4178` and run
`node tests/propeller-page-check.mjs` with the same browser environment.

## Deployment boundary

The PR remains draft. Configured vault/source addresses and the historical log
start block have not been replaced with an approved release manifest. Older
configured contracts without the required controller interface leave deposits
unavailable. This change does not activate deposit policies or publish contracts.

Before release, pin the approved deployment and rehearse the native-wallet path:
approval/binding → quoted deposit → harvest → funded earnings claim → cooldown →
partial/final collateral claim → any later HOLLAR recovery. The controller's
quote lifetime must leave enough time for wallet review. A quote can legitimately
expire or lose available capacity before inclusion; retry obtains a new preview
without weakening its price protections.
