# Hydration UI dependency resilience audit

With a healthy Hydration RPC, optional APIs and other-chain RPCs must leave native Hydration operations usable. This audit records gaps in that requirement at `master` commit **19f54bf5bde252a407e23e7ce3e4a8f6e3992182**, dated 1 October 2026. It includes SDK and 1Click dependencies. It does not change application behavior.

- [Findings and verified browser matrix](report.md)
- [Complete per-dependency reference](dependency-details.md)
- [Offline interactive dependency chart](dependencies.html): download/open locally, or serve this directory. Its data and scripts are embedded; it makes no runtime requests.
- [Machine-readable inventory](dependencies.json): 86 groups, 20 configured chain entries, 97 declared production package/version records. These are different inventories, not counts of active external APIs.
- [Original evidence and provenance](evidence/README.md): retained from the garden audit, including screenshots, result JSON, installed artifact hashes and build/lint/test logs. Original scripts in `evidence/` are archival; run the portable scripts in this directory.

Tracked in [issue #4105](https://github.com/galacticcouncil/hydration-ui/issues/4105). [Publication verification](verification.json) records the portable runner checks; the directive still needs implementation fixes.

## Install and run the function audit

Use this branch, the repository's `.nvmrc` (currently Node 25.9.0), and Yarn 1.22.22. The historical run used Node 25.7.0. Install the frozen lockfile; do not upgrade dependencies before reproducing the baseline.

```sh
yarn install --frozen-lockfile --non-interactive
yarn audit:resilience
```

The command runs seven harnesses in separate Node processes and saves logs, current checkout/lock hash, actual installed versions, and JSON under `resilience-audit/results/<timestamp>/`. This directory is ignored. Set `AUDIT_OUTPUT_DIR=/absolute/path` to choose another location. Historical `evidence/` is preserved.

**The function harnesses characterize existing behavior, including bugs.** Passing means those observations were reproduced, not that the directive is satisfied. They use actual installed dependencies or transpile actual source with mocked transports; they make no live API requests and sign no transactions. A future fix can make an old assertion fail: review the changed behavior, then replace that expectation with the desired acceptance assertion. Never rewrite historical evidence as a new release's results.

| Harness | Historical coverage |
|---|---|
| `metadata-faults.cjs` | 15 metadata/factory/query cases |
| `dependency-faults.cjs` | 5 AppKit, NEAR and registry checks |
| `oneclick-faults.mjs` | 27 assertions across 9 1Click transport observations |
| `deep-startup-faults.cjs` | 14 storage, SDK, viem and hosting cases |
| `deep-crosschain-faults.cjs` | 13 RPC, executor, Ocelloids and conditional wallet checks |
| `deep-data-faults.cjs` | 16 query, malformed-data and consumer checks |
| `wait-faults.cjs` | 3 polling deadline cases |

These counts use different units. Pending mock observations last 100–250ms; source analysis establishes missing deadlines. Real SDK scoped pool reads have 15s deadlines and background seeding is bounded at 60s. The aggregate mock does not negate those protections.

Run a single harness with `node resilience-audit/<name>`; its default output is `results/latest/`. Git worktrees are supported. Keep this directory directly under the repository root. The 1Click ESM harness intentionally imports the lockfile's nested Axios instance; if a future SDK/hoisting change removes that path, update the adapter interception before drawing conclusions. Source-expression matching and browser selectors also need review after upgrades.

## Run production browser fault scenarios

Build with the normal application environment and working build inputs, then start a production preview. Theme generation fetches style-token inputs during the build; that is separate from runtime resilience.

```sh
yarn build
yarn workspace @galacticcouncil/main preview --host 127.0.0.1 --port 4173
```

In another terminal, install isolated browser tooling without changing the app lockfile:

```sh
npm install --prefix resilience-audit/tooling --no-save playwright@1.58.1
resilience-audit/tooling/node_modules/.bin/playwright install chromium
AUDIT_PLAYWRIGHT_MODULE="$PWD/resilience-audit/tooling/node_modules/playwright" \
  AUDIT_WAIT_MS=35000 yarn audit:resilience:browser
```

The preview must be running, and the browser needs live access to a Hydration RPC. `AUDIT_ORIGIN` changes the preview URL. `AUDIT_CHROMIUM_EXECUTABLE` can select an already-installed compatible Chromium; otherwise Playwright uses its matching browser. HTTP/WS permissions and browser launch must be available in the environment.

The harness allows the preview origin, configured Hydration WebSockets in `apps/main/src/config/rpc.ts`, and their HTTPS probe origins. Other requests reject or hang according to the scenario. Do not use an unlisted custom `VITE_PROVIDER_URL`: add it to the allowlist before testing. Seven scenarios cover healthy baseline, simultaneous external rejection, simultaneous external hang on cold start, malformed metadata, hanging metadata, warm cached reload under simultaneous hangs, and malformed Neckwork statistics on `/liquidity`. Each window is 35s; warm reload has an additional 35s preparation window. Scenarios run concurrently within each harness.

Browser collection exits unsuccessfully on harness errors, missing RPC response evidence, or a broken healthy baseline. It records known UI failures without treating them as a successful resilience assessment. Logs and screenshots are kept in the run directory.

To check the anonymous native-flow acceptance subset after fixes:

```sh
AUDIT_PLAYWRIGHT_MODULE="$PWD/resilience-audit/tooling/node_modules/playwright" \
  AUDIT_WAIT_MS=35000 node resilience-audit/run.cjs --browser --acceptance
```

**Acceptance fails on the audited baseline** for cold hangs and malformed metadata/statistics. It requires a finite positive native quote in each swap scenario, successful Hydration runtime calls (`state_call` or completed `chainHead_v1_call`), and usable liquidity pool links without a route error from malformed statistics. This subset is not a full release gate: it does not verify liquidity submission controls, connected-wallet flows, signing, or settlement.

## Extend acceptance coverage before closing the issue

- Cold start and matching-genesis cached start: reject, 503, stalled headers/body, malformed successful payload, stale/empty data, and service recovery.
- Healthy injected wallet alongside pending WalletConnect; independent restoration; connected Multix malformed payload.
- Begin pending cross-chain preparation, switch back to Hydration, and verify native controls recover; discard late results. Never sign during fault injection.
- Per-chain balances, charts, history and APYs: preserve healthy/stale values and distinguish unavailable from confirmed empty/zero.
- Governance/GIGA unlock, collateral warning and liquidity controls: optional data must not erase independent chain-only functionality or consent context.
- Tracking: show submitted/unknown while monitoring is unavailable, retain identifiers, recover polling, and cancel obsolete account subscriptions.

The recorded browser uses anonymous accounts and unsigned native quotes. Blocking rules do not prove every configured external chain was queried. Connected-wallet and submission blast radii are source-inferred where the report says so. Dormant exports and build-only integrations are separately classified.

## Inspect or update the snapshot

```sh
python3 -m http.server 4174 --directory resilience-audit
```

Open `http://127.0.0.1:4174/dependencies.html`. The chart's original record/source links remain pinned to the audited commit and exact npm versions. `evidence/sha256-manifest.json` describes the immutable original evidence; rerun tools and generated reference files are outside that manifest. Recheck source/lockfile, rerun relevant tests, and collect new provenance before labeling a later release. The garden presentation generator rebuilds the dated reference; it does not perform a fresh audit.

With the same Playwright environment, `node resilience-audit/verify-chart.cjs` verifies all records, desktop/mobile layout, filters, evidence paths, offline operation and malicious markup escaping. It needs no production preview or live RPC.
