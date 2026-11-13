# Hydration UI dependency resilience audit

**The directive is not met.** A hanging or malformed optional metadata response blocks cold startup with healthy Hydration RPC. Native swap quoting survives simultaneous immediate external failures, and a cached reload survives simultaneous optional hangs. Additional wallet, submission and malformed-data paths need isolation.

Audited latest upstream `master` at [19f54bf5bde2](https://github.com/galacticcouncil/hydration-ui/tree/19f54bf5bde252a407e23e7ce3e4a8f6e3992182), committed **1 October 2026 at 12:08 CEST** and rechecked against upstream after the deeper pass. This is a locally built production bundle using the exact frozen `yarn.lock`; it is not a claim about an unidentified live deployment. No application code was changed.

Open the [interactive dependency chart](dependencies.html), [complete dependency data](dependencies.json), [evidence and reproduction instructions](README.md), or [the per-dependency reference](dependency-details.md). The chart embeds its data and needs no external scripts, fonts or APIs.

## Requirement and audit scope

With one working Hydration RPC, the shell, navigation, native balances, quotes and transaction preparation should remain usable when any or all optional services fail. Losing an unavailable destination chain or its selected bridge feature is expected. Making unavailable balances or history look verified empty, blocking unrelated wallets, or waiting forever for decorative metadata violates graceful degradation.

The reference contains **86 dependency groups**, **20 configured XC chain entries**, and **97 declared production package/version records** across the root and eight workspaces. Groups include runtime services, browser persistence, bundled libraries and dormant integrations; these counts are not counts of active external APIs. Endpoint hosts and methods were traced into their actual UI consumers, including sdk-next, xc-core, xc-sdk, xc-cfg, `xc-swap`, 1Click, Reown and WalletConnect.

## Highest priority failure paths

| Dependency | Trigger and propagation | Scope and evidence | Recommended change |
|---|---|---|---|
| Asset metadata CDN | Manifest fetch or body hangs; successful JSON lacks items array. assetsQuery awaits metadata before synchronizing the registry; cold AssetRegistryGate suspends. | Entire cold root. Production browser and source-function faults confirmed; same-genesis warm cache survives. | Build chain registry immediately with defaults; enrich asynchronously, validate each manifest, bound fetch and body. |
| Multix GraphQL | Connected-account response has accounts:{}; global MultisigProvider calls accounts.map without validation. | Root wrapper for MainLayout, Services and Footer. Exact consumer expression/transport verified; connected-wallet browser blast radius source-inferred. | Validate GraphQL business data; catch/isolate multisig discovery; preserve already available accounts and root navigation. |
| Reown and pending wallet providers | Cloud readiness or extension enable never settles; any pending provider hides every account and sequential restore stops. | Wallet selection/restoration/signing; reading and navigation survive. Exact AppKit faults plus UI source trace. | Set provider deadlines; show healthy accounts; restore independently; make failed-provider retry explicit. |
| 1Click preparation | Firm quote/build waits without timeout; cross-chain submitting is ORed into the native swap button after destination changes. | Both swap modes in the same mounted provider. Exact HTTP helper faults; submission/button coupling source-inferred, no transaction signed. | Cancel on mode/selection change, bound preparation, isolate pending mutations by operation, discard late responses. |
| Neckwork platform statistics | HTTP200 {tvl:{},volume24h:{}} passes typed mapping; Big(undefined).plus throws in liquidity header. | Liquidity route error screen, navigation survives. Production browser verified with healthy RPC. | Runtime schema and finite numeric validation; isolate statistics tiles from on-chain liquidity controls. |
| Kamino and Kraken data | Numeric strings validate as strings but become NaN; later Big conversion can throw during yield or valuation rendering. | Borrow/portfolio consumer render paths. Exact source query and numeric expression faults; browser blast radius inferred. | Validate finite numeric values and timestamps before cache writes; contain optional display errors. |
| Local browser storage | localStorage quota write throws before outer resolver readiness; malformed IndexedDB assets reach assets.reduce. | Additional startup/root risks outside the remote-service directive. Exact adapters/stores reproduced; root effects source-inferred. | Best-effort persistence, validated rehydration, reset poisoned open promises and retain in-memory defaults. |

Each path has source links and fault artifacts in the detailed reference and chart. Broad impact does not mean every failure mode has broad impact: metadata DNS rejection is safe, while a hang or a malformed successful payload is not.

## SDK and 1Click conclusions

`sdk-next 2.3.2` uses the supplied Hydration clients for pool discovery. Hydration EVM and money-market reads use a viem custom transport over the same papi RPC; no independent Ethereum RPC is required for native lending. Descriptors and Rust/WASM math are bundled code, not remote math/metadata APIs. XC context creation is local and reuses the existing pool context. These are useful protections.

SDK cold discovery still combines activated pool families with Promise.all. A failed family can withhold healthy pools; actual scoped query reads have 15s rejection deadlines and background seeding has a 60s bound. The aggregate test with a mocked never-settling family proves lack of partial returns, not that every real SDK RPC read is unbounded. SDK rejected query promises are evicted and a later load can recover.

`xc-swap 0.9.0` caches the 1Click token-registry promise, including rejection. Refetch after service recovery still receives the original rejection until the client is recreated. The browser ESM path uses `@defuse-protocol/one-click-sdk-typescript 0.1.25` with Axios timeout 0. Direct SDK calls expose cancellation; the async quote helper drops that handle, and UI query signals do not bound the request. An order deadline governs swap validity, not HTTP duration. Current settlement monitoring uses **IntentScan**, not 1Click `/v0/status`; the latter is an unused SDK surface in this snapshot.

External balances remain independent by chain, but `xc-core` allSettled can convert total failure into successful []. NEAR, Sui and Solana reads can remain pending without a supplied cancellation signal. Viem 2.56.8 nominal HTTP timeout ends when headers arrive: a stalled successful body escapes it. WalletConnect relay connection attempts have their own deadlines, but they do not supply a complete UI enable deadline. The exact per-chain endpoints are in the chart data and [configured RPC inventory](evidence/crosschain-rpc-inventory.json).

## Remaining feature degradation and data integrity gaps

- Subsquare vote history, proxied through Neckwork, is awaited before independent GIGA unlock calculation. An outage can block a chain-only matured unlock. Calculate independent unlocks separately; unavailable vote history must not imply permission to unlock governance locks.
- Hanging DeFiLlama, Kamino or Neckwork enrichment suppresses aggregate APY rows. Warm yield cache is used after rejection, so it does not rescue an unfinished fetch. Display available yields separately and label cached age.
- Unknown external APY becomes 0% in the general non-PRIME supply-modal selector; DeFiLlama empty rows also become a cached zero. PRIME instead always shows the configured static 7.5% modal rate, regardless of live Kamino yield. Preserve unavailable values and explain rate provenance.
- Trade and lending history errors can look like no history. Health200 does not prove a particular history endpoint works or is fresh. Preserve error and stale states rather than erasing them.
- Neckwork DCA outage skips an indexer-dependent collateral-change warning. On-chain health-factor enforcement remains, but missing indexer data removes useful consent context.
- Intent relay fees and Wormhole executor quotes are prerequisites for their selected external route. Their fetch and body work need deadlines; these outages should disable only that route.
- IntentScan retains submitted/unknown outcomes on settled failures. A hanging query prevents later polling and cannot be interrupted by the six-hour check at the next processor entry. Ocelloids initial history failure prevents SSE setup; late account requests can start an obsolete subscription after cleanup.
- XCM subscription setup can finish after unmount without cancellation guards. Pending reads, stale streams, and asynchronous store errors need isolation and explicit recovery.
- p-wait-for 6.0.0 nominal 60s or three-minute polling bounds do not interrupt an awaited RPC condition that hangs. Bound each underlying read/build and propagate cancellation rather than relying only on the polling timeout.

## Verified browser matrix

| Scenario | Observed result | Evidence |
|---|---|---|
| Healthy baseline | Native swap fields editable and a live Hydration quote produced. | [JSON](evidence/browser-verified/baseline.json) · [Screenshot](evidence/browser-verified/baseline.png) |
| All optional requests reject | Native swap fields editable and a live quote produced; optional chart unavailable. | [JSON](evidence/browser-verified/all-external-reject.json) · [Screenshot](evidence/browser-verified/all-external-reject.png) |
| All optional requests hang on cold start | 40 skeletons and readonly swap fields at 35s; Hydration RPC continued returning data. | [JSON](evidence/browser-verified/all-external-hang.json) · [Screenshot](evidence/browser-verified/all-external-hang.png) |
| Metadata alone hangs on cold start | 40 skeletons and readonly swap fields at 35s despite healthy Hydration RPC. | [JSON](evidence/browser-verified/metadata-hang.json) · [Screenshot](evidence/browser-verified/metadata-hang.png) |
| Metadata returns malformed successful JSON | Root error screen despite healthy Hydration RPC. | [JSON](evidence/browser-verified/metadata-malformed.json) · [Screenshot](evidence/browser-verified/metadata-malformed.png) |
| Cached reload with all optional requests hanging | Warm baseline confirmed; native swap fields editable and a live quote produced after reload. Chart remained pending. | [JSON](evidence/browser-additional/warm-all-external-hang.json) · [Screenshot](evidence/browser-additional/warm-all-external-hang.png) |
| Neckwork returns malformed successful statistics | Liquidity route replaced by error UI; navigation remained visible and Hydration RPC stayed active. | [JSON](evidence/browser-additional/neckwork-malformed-stats.json) · [Screenshot](evidence/browser-additional/neckwork-malformed-stats.png) |

Each scenario permitted configured Hydration HTTPS ranking probes and WebSocket RPC. Browser traffic confirms healthy RPC responses. Cold scenarios used fresh contexts; the cached scenario first verified a working baseline in the same context, then reloaded with optional requests held open. Inputs were filled to obtain an unsigned native quote. Other-chain blocking rules were installed, but the anonymous native swap route does not necessarily call every configured RPC.

## Dependency index

Select any dependency in the chart for endpoints, consuming packages, deadlines, retry/cancellation, cache behavior, failure modes, source evidence and remediation. Full details also appear in [the per-dependency reference](dependency-details.md).

| Dependency | Activation | Worst traced scope | Evidence |
|---|---|---|---|
| [Asset/chain metadata manifests](dependencies.html#asset-metadata-cdn) | active | Cold application registry and root | Browser + source |
| [Multix multisig discovery](dependencies.html#multix-graphql) | active | Malformed connected-account data reaches root provider | Functions + source |
| [Reown AppKit config/limits/origin control APIs](dependencies.html#reown-control-plane) | conditional | Wallet readiness, all account selection and restore | Functions + source |
| [1Click indicative and firm quotes](dependencies.html#oneclick-quote-build) | conditional | Pending XC submit can block native swap button | Functions + source |
| [Neckwork platform TVL and volume](dependencies.html#neckwork-platform-stats) | active | Malformed totals disable liquidity route controls | Browser + source |
| [Kamino PRIME APY](dependencies.html#kamino-apy) | active | Malformed APY can break borrow provider calculations | Functions + source |
| [Kraken NEAR/ZEC spot and historical USD](dependencies.html#kraken-prices) | active | Malformed price can throw in portfolio valuation | Functions + source |
| [IndexedDB asset/account/portfolio persistence](dependencies.html#indexeddb) | active | Malformed assets can reach root render | Functions + source |
| [LocalStorage preferences, RPC selection and price/trade state](dependencies.html#local-storage) | active | RPC resolver and persisted preferences | Functions + source |
| [TanStack Router and root render boundaries](dependencies.html#router-boundaries) | active | Root versus nested error containment | Source trace |
| [Application hosting and executable/static assets](dependencies.html#hosting) | active | First load or failed lazy chunks | Functions + source |
| [Ping Web Worker and Comlink control channel](dependencies.html#rpc-ping-worker) | active | Automatic RPC selection before routing | Source trace |
| [Injected/Wallet Standard extensions and mobile deeplinks](dependencies.html#wallet-injected) | conditional | Chosen provider can hold shared account selector | Source trace |
| [WalletConnect session relay](dependencies.html#walletconnect-relay) | conditional | WalletConnect signing; shared pending account UI | Source trace |
| [TanStack Query cache/retry/cancellation](dependencies.html#query-framework) | active | Shared query policy; caller determines scope | Source trace |
| [External EVM RPC providers](dependencies.html#rpc-evm-external) | conditional | External chain balances, fees and transfer | Functions + source |
| [NEAR RPC](dependencies.html#rpc-near) | conditional | NEAR balances; independent of 1Click output | Functions + source |
| [Other Substrate parachain/relay RPCs](dependencies.html#rpc-substrate-external) | conditional | External Substrate chains | Source trace |
| [Solana HTTP and WebSocket RPC](dependencies.html#rpc-solana) | conditional | Solana balances and selected route | Functions + source |
| [Sui JSON RPC](dependencies.html#rpc-sui) | conditional | Sui balances and selected route | Functions + source |
| [p-wait-for polling deadlines](dependencies.html#polling-wait-deadlines) | active | External transaction polls can outlive deadline | Functions + source |
| [1Click asset/token registry](dependencies.html#oneclick-registry) | active | XC destination selection and recovery | Functions + source |
| [Hydration intent relay fee quoter](dependencies.html#intent-relay-fee) | conditional | Selected intent quote and preparation | Source trace |
| [IntentScan settlement/order monitor](dependencies.html#intentscan) | conditional | Intent outcome tracking after submission | Source trace |
| [Ocelloids cross-chain history HTTP + SSE](dependencies.html#ocelloids) | conditional | Connected-account history and tracking | Functions + source |
| [Wormhole executor quote service](dependencies.html#wormhole-executor) | conditional | Selected NTT executor fee and call | Functions + source |
| [Grafana historical lending rate SQL](dependencies.html#grafana-reserve-rate) | active | Historical lending rate charts | Source trace |
| [Grafana historical trade price SQL](dependencies.html#grafana-trade-price) | active | Fallback historical trade charts | Source trace |
| [Grafana legacy DCA amount SQL](dependencies.html#grafana-dca-amounts) | active | Legacy order amount enrichment | Source trace |
| [Legacy Hydration explorer GraphQL](dependencies.html#legacy-indexer-graphql) | active | Legacy history and recovered transaction tracking | Functions + source |
| [Neckwork DCA fills](dependencies.html#neckwork-dca-executions) | active | DCA past execution history | Source trace |
| [Neckwork DCA schedules](dependencies.html#neckwork-dca-schedules) | active | DCA history and collateral consent warning | Source trace |
| [Neckwork Market trades](dependencies.html#neckwork-market-trades) | active | Past market trades table | Source trace |
| [Neckwork Omnipool 24h volume](dependencies.html#neckwork-omnipool-volumes) | active | Omnipool volume and fee displays | Source trace |
| [Neckwork Omnipool 30d fee APR](dependencies.html#neckwork-omnipool-yield) | active | Omnipool LP APY estimates | Source trace |
| [Neckwork Routed account trades](dependencies.html#neckwork-routed-trades) | active | Past routed trades table | Source trace |
| [Neckwork Stablepool 24h volume](dependencies.html#neckwork-stableswap-volumes) | active | Stablepool volume and fee displays | Source trace |
| [Neckwork Stablepool 30d fee APR/APY](dependencies.html#neckwork-stableswap-yield) | active | Stablepool yield and money-market aggregate APYs | Source trace |
| [Neckwork UniswapV3 24h volume and fees](dependencies.html#neckwork-uniswapv3-volumes) | active | V3 volume and fee displays | Source trace |
| [Neckwork XYK 24h volume](dependencies.html#neckwork-xyk-volumes) | active | XYK volume and fee displays | Source trace |
| [Neckwork account USD balances](dependencies.html#neckwork-wallet-balances) | active | Wallet account USD values | Source trace |
| [Neckwork historical pair prices, reference and tail](dependencies.html#neckwork-pair-prices) | active | Trade and cross-chain charts | Source trace |
| [Neckwork intent fill events](dependencies.html#neckwork-intent-events) | active | Past intent fill events | Source trace |
| [Neckwork intent history and enrichment](dependencies.html#neckwork-intents) | active | Intent history and past fill enrichment | Source trace |
| [Neckwork money-market history](dependencies.html#neckwork-money-market-events) | active | Lending history can appear empty on failure | Source trace |
| [Reown embedded auth and authentication APIs](dependencies.html#reown-auth) | conditional | Conditional embedded auth readiness | Functions + source |
| [Reown hosted blockchain RPC/bundler](dependencies.html#reown-hosted-rpc) | conditional | WalletConnect RPC and optional bundler | Source trace |
| [Reown optional swap/onramp/pay/exchange APIs](dependencies.html#reown-extra-financial-features) | conditional | Conditional Reown commercial modal features | Source trace |
| [WalletConnect verification/attestation](dependencies.html#walletconnect-verification) | conditional | WalletConnect origin verification | Source trace |
| [DeFiLlama yield APYs](dependencies.html#defillama-apy) | active | Aggregate yield and unknown-to-zero display | Functions + source |
| [Hardcoded Neckwork GIGA APR](dependencies.html#neckwork-giga-apr) | active | GIGA APR display | Source trace |
| [Subsquare account vote history proxy](dependencies.html#subsquare-votes) | active | Vote-dependent unlock and independent GIGA unlock | Source trace |
| [Bundled typed runtime descriptors and metadata cache](dependencies.html#descriptors) | active | Typed Hydration runtime access | Source trace |
| [Gamma vault share filtering and V3 bootstrap](dependencies.html#gamma-symbol-filter) | active | Gamma and V3 registry reads | Source trace |
| [Hydration EVM custom transport and contract data](dependencies.html#hydration-evm) | active | Hydration EVM reads over shared papi | Functions + source |
| [Hydration HTTP endpoint discovery](dependencies.html#hydration-http-probes) | active | HTTP ranking currently gates WS boot | Source trace |
| [Hydration shared WebSocket RPC](dependencies.html#hydration-rpc) | active | Primary chain data and execution | Source trace |
| [Hydration spot-price and share-token display pricing](dependencies.html#chain-prices) | active | On-chain spot and share prices | Source trace |
| [Money-market core Aave provider (Hydration EVM only)](dependencies.html#money-market-hydration-evm) | active | Core lending uses Hydration transport | Source trace |
| [SDK Rust/WASM math modules](dependencies.html#bundled-sdk-math) | active | Packaged WASM quote math | Source trace |
| [SDK context and required DCA parameters](dependencies.html#sdk-context) | active | Required SDK initialization | Source trace |
| [SDK pool families and shared router readiness](dependencies.html#sdk-pool-context) | active | Combined pool families and registry | Functions + source |
| [Validated portfolio query persistence](dependencies.html#portfolio-cache) | active | Optional cached portfolio data | Source trace |
| [Bundled English translations](dependencies.html#bundled-i18n) | active | Bundled translations | Source trace |
| [Bundled fonts and design assets](dependencies.html#bundled-fonts) | active | Typography | Source trace |
| [Cross-chain context construction (local)](dependencies.html#xc-local-context) | active | Local configuration; no external init await | Source trace |
| [Background app-version detection](dependencies.html#app-update) | active | Update notification | Functions + source |
| [Neckwork fees and revenue charts](dependencies.html#neckwork-fees) | active | Per-stream analytics charts | Source trace |
| [Neckwork health and post-transaction index synchronization](dependencies.html#neckwork-status) | active | Health fallback and post-transaction index sync | Functions + source |
| [Passive asset/chain image downloads](dependencies.html#asset-icon-cdn) | active | Logos and decoration | Source trace |
| [Reown hosted fonts](dependencies.html#reown-fonts) | conditional | Modal typography | Source trace |
| [Reown wallet registry/assets and optional account UX APIs](dependencies.html#reown-wallet-assets) | conditional | Wallet modal optional views and assets | Source trace |
| [Reown/WalletConnect telemetry and notification registration](dependencies.html#reown-telemetry) | conditional | Best-effort telemetry and optional push | Source trace |
| [Subsquare referendum titles](dependencies.html#subsquare-titles) | active | Referendum title text | Source trace |
| [Build time Hydration style tokens](dependencies.html#build-style-tokens) | build | Fresh theme/build generation only | Source trace |
| [Bundled runtime configuration validation](dependencies.html#build-env) | build | Module initialization with invalid build config | Source trace |
| [Optional asset color generation inputs](dependencies.html#build-asset-colors) | build | Manual color generation only | Source trace |
| [Reown npm latest check (development only)](dependencies.html#reown-dev-version-check) | build | Development console diagnostic | Source trace |
| [Zcash balance reader (not configured)](dependencies.html#rpc-zcash) | dormant | No configured balance transport | Source trace |
| [1Click status API (unused by this UI)](dependencies.html#oneclick-status-unused) | dormant | No current UI caller | Source trace |
| [BasejumpScan transport (defined; uncalled)](dependencies.html#basejumpscan) | dormant | Defined transports without UI caller | Source trace |
| [Wormhole Scan transport (SDK-defined; UI dormant)](dependencies.html#wormhole-scan) | dormant | SDK client without current UI calls | Functions + source |
| [Subscan proxy helper (uncalled API builder)](dependencies.html#subscan-proxy-helper) | dormant | Uncalled helper and outbound explorer links | Source trace |
| [Dormant Neckwork count/single-intent exports](dependencies.html#dormant-neckwork-exports) | dormant | No active fetch consumer found in current source. Do not count as a mandatory runtime dependency. | Source trace |
| [Dormant Subscan HDX supply API](dependencies.html#dormant-subscan-supply) | dormant | No active fetch consumer found in current source. Do not count as a mandatory runtime dependency. | Source trace |
| [Dormant former metrics aggregator API](dependencies.html#dormant-old-metrics) | dormant | No active fetch consumer found in current source. Do not count as a mandatory runtime dependency. | Source trace |

## Recommended implementation order

1. Remove metadata enrichment from required registry readiness; ensure cold Hydration-only startup works with every optional request pending or malformed.
2. Validate optional provider data before it reaches root or financial render code, especially Multix, Neckwork, Kamino and Kraken. Add local error containment around optional root services and statistics tiles.
3. Isolate wallet pending state and cross-chain mutation state; cancel obsolete work on account/mode/selection changes.
4. Apply a whole-operation deadline that includes response body parsing and first subscription emission. A finite retry count alone does not bound a request that never settles.
5. Preserve unavailable/stale states, independent GIGA unlocks and cached values with age; never imply zero holdings, no history or zero APY from missing evidence.
6. Make persistence and later chunk-loading failures preserve usable in-memory UI, then add the acceptance checks below to future releases.

## Release acceptance checks

Run both cold and same-genesis cached contexts with a healthy Hydration RPC. Inject DNS/network rejection, HTTP429/500/503, stalled headers, stalled successful and error bodies, malformed JSON, valid JSON with wrong shape/non-finite numeric values, stale data, and recovery without a reload. Exercise each source alone and all optional sources together.

Check native swap quote and preparation, account selection with a healthy injected wallet while WalletConnect is pending, money-market chain reads/preparation, chain-only GIGA unlocks, current on-chain orders, navigation away from a broken optional route, and cross-chain-to-native mode recovery during a pending firm quote. Confirm errors do not become verified empty data, obsolete requests cannot update a new account or form, and healthy functions remain interactive. Submission tests still need a controlled signing environment; this audit did not sign or broadcast.

## Validation and limits

Frozen install, all six workspace build tasks, all eleven lint tasks and the existing five test files with 34 tests passed in the audited checkout. Passing ordinary checks does not verify resilience under outages. Additional scripts and their exact case results are retained in the evidence directory.

- Latest upstream master verified on the audit date, not an identified deployed website version.
- Each service/group in the traced current UI and transport surface is inventoried. Declared production packages are listed; this is not an exhaustive audit of every transitive library function or every remote wallet backend.
- Function mocks measure pending behavior for 100–250ms; source inspection establishes absent deadlines. Browser scenarios observe 35s after navigation, not measured infinite duration.
- SDK pool reads have scoped 15s deadlines; background seed is 60s. Aggregate mock hangs do not negate these bounds.
- Anonymous production browser scenarios; no live connected-wallet flows, signed transactions, or settlement execution.
- Configured external RPC interception does not prove each chain was called on every tested route.
- First document/code hosting and local browser storage are separately classified; uncached execution cannot survive loss of its own code host.

## Sources

- Hydration UI codebase and SDK codebase provide repository context; their older version notes are not the version basis for this audit.
- [Audited upstream source](https://github.com/galacticcouncil/hydration-ui/tree/19f54bf5bde252a407e23e7ce3e4a8f6e3992182) and [exact lockfile](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/yarn.lock).
- [Per-dependency source links](/wiki/note-hydration-ui-dependency-details/) point to the pinned UI commit or the exact published npm artifact. Formatted installed line numbers map through [source provenance](evidence/source-provenance.json).
- [All fault evidence and reproduction instructions](README.md).
