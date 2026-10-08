# Propeller UI: funded deposits and gradual deployment

The Juicer page in [hydration-ui #3978](https://github.com/galacticcouncil/hydration-ui/pull/3978)
supports the deferred strategy deployment design in
[money-market #62](https://github.com/galacticcouncil/money-market/pull/62).
A confirmed deposit supplies collateral and mints funded vault shares. It does
not borrow HOLLAR or trade. Keepers subsequently borrow and trade through bounded
slices, subject to the contracts' price and execution controls.

This report supersedes the deposit behavior in the October 3 integration report;
that report and its evidence remain a record of the earlier controlled-deposit
design. Separate yield ownership, queued withdrawals and later HOLLAR recovery
remain supported.

## Deposit behavior

The UI requires `deferredDeployment()` to return exactly `true` before enabling a
deposit. Missing, reverting or false capability reads leave deposits unavailable.
The existing deposit selector and `reinvestAssets` getter alone cannot distinguish
an older vault whose deposit would synchronously trade.

Available deposit capacity is the exact collateral amount between `tvlCap` and
`totalAssets`, read at one block with collateral identity, supply, Main ledger,
pause, funding and deleveraging status. Public users cannot bootstrap a new vault.
Keeper trade minimums, maximums, rate budgets and swap quotes do not restrict the
collateral deposit. Token precision, wallet balance and vault capacity still do.

If needed, approval goes to the vault and completes before the deposit is
simulated. Approval does not close the form. The UI rechecks capability and vault
state after approval, simulates the direct `deposit(assets, owner)` as the payer,
requires nonzero funded shares and estimates its gas with a 20% margin bounded by
block and native transaction limits. Simulation failures stop submission.
Vault state can still change before inclusion; the contract remains authoritative.

## Funded collateral, deployment and earnings

Each vault shows **Collateral awaiting deployment**, using its same-block
`reinvestAssets` value with exact collateral units. The amount is pooled across
deposits and converted earnings. It is not an individual queue, ownership of a
particular slice, or a completion estimate. A zero amount is displayed as zero;
it does not claim that the source has finished its own ramp. Missing or unsupported
reads display an unavailable amount instead of zero.

Converted earnings are funded collateral shares. Claiming them adds shares to the
holder's position; subsequent strategy deployment remains gradual. Unconverted
source receivables stay explicitly separate from funded crypto. Withdrawals use
the usual queue, including the configured cooldown and partial settlement.

**Est. APR before swaps** remains an indicative carry calculation after both
borrowing legs and harvest fees. Its disclosure now explicitly assumes all
collateral is deployed at current rates and source leverage. Swap fees, slippage
and conversion delays are excluded, and the estimate is not realized crypto APY.

## Five validation and fix rounds

| Round | Finding and resulting change | Validation |
| --- | --- | --- |
| 1 | The former controller envelope and shared trade budget no longer belong in a collateral deposit. Replaced them with a direct deposit path gated by the new capability marker. | 24 focused tests passed, including exact capacity, old/missing capability rejection, simulation, gas limits and retained accounting coverage. |
| 2 | Approval and changing vault state must remain separate from gradual strategy deployment. Added a testable approval lifecycle and connected the form to collateral capacity only. | 28 focused tests passed, covering approval to the vault, approval completion, cancellation, existing allowance and a fresh state check after approval. |
| 3 | Funded shares could be mistaken for an already deployed strategy, and the older getter could be mislabeled. Added the pooled amount, guarded its meaning by capability and clarified yield/return copy. | 32 focused tests passed, including pinned reads, exact amounts, zero versus unknown values, failed reads and older contracts. |
| 4 | The old browser fixture still asserted keeper trade limits. Replaced those expectations with collateral deposit behavior and checked changing vault and wallet limits. | Nine browser checks passed. One native collateral unit and amounts larger than the old keeper slice are accepted when otherwise valid. Shrinking capacity, exact MAX, pauses, unavailable reads and excess precision remain enforced. Propeller ESLint and the Vite 8 production build passed. |
| 5 | Reconciled the complete UI with the compiled contract interfaces, extended parity checks to the history events, and checked the complete application. | All 66 application tests passed (32 Propeller), along with full TypeScript, Propeller ESLint, the Vite 8 production build and desktop/mobile production-page checks. All 45 used contract functions and four events match the compiled production artifacts. |

The evidence directory is
[propeller-ui-deferred-deployment-2026-10-04](evidence/propeller-ui-deferred-deployment-2026-10-04/manifest.json).
The initial TypeScript invocation raced route generation in this fresh clone;
the final check runs after the production build has generated `routeTree.gen.ts`.
The production build retains its existing large-chunk warning. Tests use the
pure-JavaScript fallback for an optional native bigint binding. No production
dependency, configured contract address, deployment block or branding was changed.
The UI base is `167b5dbe4cf4f0e4d713c868704e1a4a3e457974`. ABI comparisons used
the final London production artifacts provided by the contract workstream, whose
working tree was based on `71aff84595acffd26653be91f43010c2ff777f81`. The manifest
pins those artifact hashes and the relevant contract source hashes; the contract
changes were not yet committed at comparison time. These are UI integration
results, independent of the contract regression suite.

Browser form checks render the actual deposit component and form hooks with
mocked contract reads, wallet submission, shared validators and presentation.
A separate production-build browser check renders the actual page at desktop
and mobile widths using the configured RPCs, without connecting a wallet.
Both widths had zero browser runtime errors and no page overflow beyond a one-pixel
desktop rounding difference.
These checks do not constitute a real-wallet or native-chain execution rehearsal.

## Reproduction and release boundary

Install the locked dependencies and generate the UI theme/workspace TypeScript
outputs. From `apps/main`:

```sh
node ../../node_modules/vite/bin/vite.js build
node ../../node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node ../../node_modules/vitest/vitest.mjs run
../../node_modules/.bin/eslint src/modules/strategies/propeller
node tests/propeller-abi.mjs /path/to/money-market/propeller-vault/out-production
```

The dedicated form fixture uses port 4179:

```sh
node ../../node_modules/vite/bin/vite.js --config tests/propeller-browser/vite.config.mjs
node tests/propeller-browser/check.mjs
```

For the built page, start Vite preview on `127.0.0.1:4178`, then run
`node tests/propeller-page-check.mjs`. Both scripts accept `PLAYWRIGHT_MODULE` and
`CHROMIUM_PATH` for an existing Playwright/Chromium installation.

The PR remains draft. The configured addresses are not an approved release
manifest. Release still requires pinning approved vault/source addresses and the
event start block, then rehearsing native-wallet approval/binding, funded deposit,
gradual deployment, harvest, earnings claim, cooldown, partial/final collateral
claim and later HOLLAR recovery. Missing capability at an old address leaves
deposits closed. This work neither deploys contracts nor activates production
policies.
