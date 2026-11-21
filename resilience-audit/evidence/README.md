# Hydration UI dependency audit evidence

This evidence belongs to upstream Hydration UI `master` at `19f54bf5bde252a407e23e7ce3e4a8f6e3992182`, audited on 1 October 2026. It supports the [audit note](/wiki/note-hydration-ui-dependency-resilience/), [per-dependency details](/wiki/note-hydration-ui-dependency-details/) and [offline chart](/graphs/hydration-ui-resilience.html). No UI implementation was changed, and no signed transaction was sent.

## Evidence inventory

| File | What it establishes |
|---|---|
| `report.json` | Initial audit and ordinary build/lint/test results; the deeper slice files below extend it. |
| `deep-startup.json` | Startup, metadata, SDK-next, core transport, framework, storage and hosting paths. |
| `deep-crosschain.json` | Destination RPCs, 1Click, bridge fee services, tracking and wallet cloud services. |
| `deep-data.json` | Each active Neckwork resource, legacy GraphQL/Grafana, Multix, yield, pricing and vote history. |
| `deep-wait.json` | Polling timeout does not bound a hanging RPC condition in p-wait-for 6.0.0. |
| `deep-build.json` | Separately classified theme-token and manual color-generation build inputs; deployed runtime has no live request for these. |
| `package-inventory.json` | 97 declared production package/version records, declaring workspaces and network roles. |
| `package-review.json` | 116 workspace resolutions checked; no mismatches. Distinguishes nested package versions. |
| `source-runtime-import-omissions.json` | Supplemental imports/transitives; includes explicit type/development/generated-code limitations. |
| `crosschain-rpc-inventory.json` | 20 configured XC chain entries, including Hydration and alias entries; these are not 20 unique external chains or hosts. |
| `source-provenance.json` | Exact installed artifact paths, versions, hashes and formatted-source mappings. |
| `browser-verified/` | Five cold production-browser scenarios, JSON traffic/results and screenshots. |
| `browser-additional/` | Cached reload with all optional requests hanging, and malformed Neckwork statistics on the liquidity route. |
| `reference-validation/` | Saved chart desktop/mobile previews, every-record interaction checks and Markdown preview checks. The garden theme itself was not built. |
| `build.log`, `lint.log`, `tests.log` | Audited checkout verification logs; 6 build tasks, 11 lint tasks, 34 existing tests. |

Fault scripts use exact installed packages or transpile the checked source with injected transports. Their mocks do not use live APIs or sign transactions. Pending observations last 100–250ms; missing deadlines are established by source inspection, not by observing infinity. SDK scoped pool reads have 15s deadlines, and background seed has a 60s bound.

| Harness | Recorded result | Important scope limit |
|---|---|---|
| `metadata-faults.cjs` | 15 cases in `metadata-faults.results.json` | Healthy chain mocks; production browser supplements cold root impact. |
| `dependency-faults.cjs` | 5 checks in `dependency-faults.json` | Exact AppKit, NEAR and cached registry helper behavior; UI coupling separately traced. |
| `oneclick-faults.mjs` | 27 assertions in `oneclick-faults.json` | Browser ESM SDK/helper and matching nested ESM Axios; status method tested even though unused by the current UI. |
| `deep-startup-faults.cjs` | 14 cases in `deep-startup-faults.results.json` | Storage exceptions, SDK aggregation, viem body timeout and background update handling. Root storage impact is source-inferred. |
| `deep-crosschain-faults.cjs` | 13 checks in `deep-crosschain-faults.json` | Ocelloids, Sui, Solana, executor service, dormant scan and conditional auth iframe. |
| `deep-data-faults.cjs` | 16 checks in `deep-data-faults.json` | Actual query/transport and consumer expressions, not complete signed-in route rendering. |
| `wait-faults.cjs` | 3 cases in `wait-faults.results.json` | Exact polling library; external transaction UI effect traced separately. |

The table mixes cases, checks and individual assertions; it is not a homogeneous test-suite count. None proves every failure permutation has been exercised.

## Reproduce function faults

Use a temporary checkout at the exact commit. Copy this evidence directory into its `audit/` directory; scripts resolve application sources and dependencies from that parent directory. Keep the original evidence separate because running a script writes its result JSON again.

```bash
git clone https://github.com/galacticcouncil/hydration-ui.git /tmp/hydration-ui-audit
cd /tmp/hydration-ui-audit
git checkout 19f54bf5bde252a407e23e7ce3e4a8f6e3992182
yarn install --frozen-lockfile --ignore-scripts --non-interactive
mkdir -p audit
cp -R /path/to/garden/src/site/graphs/hydration-ui-resilience/evidence/. audit/
node audit/metadata-faults.cjs
node audit/dependency-faults.cjs
node audit/oneclick-faults.mjs
node audit/deep-startup-faults.cjs
node audit/deep-crosschain-faults.cjs
node audit/deep-data-faults.cjs
node audit/wait-faults.cjs
```

These tests use installed dependency implementations. A mismatched CommonJS Axios instance does not intercept the 1Click browser ESM helper: that harness intentionally imports the SDK's nested ESM Axios adapter. Mocked aggregate SDK family hangs do not override real scoped RPC deadlines.

## Reproduce production browser scenarios

Build first with working build inputs. Theme generation downloads the style-token JSON during `yarn build`; this build-time requirement is separate from runtime UI availability. Use Playwright 1.58.1 with Chromium. The audit used Chromium build 1223 and a locally served Vite production preview.

```bash
yarn build
yarn workspace @galacticcouncil/main preview --host 127.0.0.1 --port 4173
```

In another shell at the checkout root, with Playwright installed in a tooling directory:

```bash
export AUDIT_PLAYWRIGHT_MODULE=/path/to/tooling/node_modules/playwright
export AUDIT_CHROMIUM_EXECUTABLE=/path/to/chromium/chrome
AUDIT_LABEL=browser-rerun AUDIT_WAIT_MS=35000 node audit/browser-faults.cjs
AUDIT_LABEL=browser-additional-rerun AUDIT_WAIT_MS=35000 node audit/browser-additional.cjs
```

The two environment variables make the copied scripts portable; all injection logic matches the recorded run. If Playwright is available from ordinary module resolution and its matching browser is installed, they can be omitted. The tooling needs permission to launch a browser, listen locally and connect to public Hydration RPCs.

The harness allows the local origin, configured Hydration WebSocket endpoints and their HTTPS probe origins. It blocks or holds other requests, and proxies real Hydration WebSocket traffic to establish that the chain is responding. The cached scenario first verifies editable native controls with no injected outage, then reloads that same browser context under the outage. Every observation window after navigation is 35 seconds; the cached case includes a separate 35-second warm-up. Browser cases use anonymous accounts and unsigned native quotes. Installed other-chain blocking rules do not establish that every other chain was queried.

## Verify source references

UI paths link to the pinned GitHub commit. Installed dependency paths link to the exact npm version. Evidence under `audit/*readable.mjs` and `audit/crosschain-sources/` uses formatted line numbers. `source-provenance.json` maps those locations to the published original and both hashes. Reinstall the lockfile, verify the original hash, and format with Prettier 3.3.3 and `{parser: "babel"}` to recreate the extracts. Generated extracts and dependency bundles are not duplicated here.

The main dependency data preserves each original detailed record as `auditDetail`, including exact test check names and resource-specific matrices. Dormant exports, outbound links, development diagnostics, build inputs, local persistence and primary Hydration transport have separate classifications.

## Update the reference

The presentation generator lives at `hydration-ui-resilience-audit/build_reference.py` in the garden repository. Running it rebuilds the two Markdown notes, chart JSON and standalone HTML from these saved slice records. It does not fetch newer code or perform a new audit. To assess a later release, repeat source/lockfile inspection and fault tests, update evidence and source provenance, then change the dated snapshot in the generator. Do not relabel these results as a newer release without rerunning the relevant checks.
