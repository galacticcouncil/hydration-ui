# Hydration UI per-dependency failure reference

This is the complete dependency-by-dependency companion to [the resilience audit](report.md). It records the current implementation at `19f54bf5bde2` on 1 October 2026. [Open the interactive chart](dependencies.html) for search and filtering. Browser proof, direct function proof and source-inferred UI scope are distinguished; recommendations are proposed changes. The repeated transport profiles are applied to each source so individual records remain usable on their own.

## Asset/chain metadata manifests

**Activation:** active. **Worst traced scope:** Cold application registry and root. **Evidence:** Browser + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Semantically optional decoration, currently mandatory inside cold assets query and root asset gate.

**Endpoints:** `https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master/assets-v2.json`; `https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master/chains-v2.json`; `https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master/metadata.json`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/utils 0.0.0`

**Deadline:** No fetch or body deadline. **Retry:** No scheduled warming retry after successful empty fallback; Infinity query cache. **Cancellation:** No AbortSignal passed to fetch. **Cache:** Same-genesis persisted registry bypasses cold suspense; cold path awaits all manifests.

**Failure and recovery behavior:**

- dns http: DNS rejection/HTTPnon2xx/JSON parse rejection becomes safe empty factory values.
- hang: No fetch or body deadline/cancel signal; one hanging resource leaves cold registry unresolved. Browser verified at35s with healthy RPC, not claimed as measured infinity.
- malformed stale: HTTP200 object with missing/non-array items throws outside fetchData catch and reaches root route error. Metadata payload itself also lacks schema validation. @master mutable resource has no version/age validation.
- recovery: Successful empty fallback is cached with staleTime Infinity and no window-focus refetch; no scheduled automatic warming retry. Warm persisted asset cache uses non-suspense query so current usable UI survives metadata query error/hang.

**Existing protections:** Empty defaults and catch for fetch/JSON parsing; cached registry avoids cold suspense on same genesis.

**Recommended change:** Decouple default registry construction from CDN warm/enrichment; deadline including body; validate resources; independently retry recovery and refresh stored icon URLs.

**Source:** [packages/utils/src/lib/AssetMetadataFactory.ts:56](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/lib/AssetMetadataFactory.ts#L56), [packages/utils/src/lib/AssetMetadataFactory.ts:70](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/lib/AssetMetadataFactory.ts#L70), [packages/utils/src/lib/AssetMetadataFactory.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/lib/AssetMetadataFactory.ts#L83), [apps/main/src/api/metadata.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/metadata.ts#L18), [apps/main/src/api/assets.ts:166](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/assets.ts#L166), [apps/main/src/providers/AssetRegistryGate.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/AssetRegistryGate.tsx#L25)

**Fault evidence:** [metadata-faults.results.json](evidence/metadata-faults.results.json), [browser-verified/metadata-hang.json](evidence/browser-verified/metadata-hang.json), [browser-verified/metadata-malformed.json](evidence/browser-verified/metadata-malformed.json), [Cached all-optional-hang browser verification](evidence/browser-additional/warm-all-external-hang.json)

## Multix multisig discovery

**Activation:** active. **Worst traced scope:** Malformed connected-account data reaches root provider. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Discovery of connected account multisigs and their pending transaction counts. Normal missing data still renders children. Global MultisigProvider throws during render when a connected account enables discovery. Actual GraphQL transport and exact provider memo body tested; browser error-boundary result is an inference.

**Endpoints:** `https://multix-graphql.lark.hydration.cloud/graphql`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@galacticcouncil/web3-connect 0.0.0 (workspace)`; `graphql-request 7.4.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`; `graphql 16.13.2`

**Deadline:** No whole-operation deadline. No deadline. **Retry:** Browser query default three retries after rejection; no retry while a request is pending. **Cancellation:** Generated SDK accepts optional signal, but query wrappers/clients do not supply it. **Cache:** Successful same-key discovery retained during refetch failure. Default staleTime 0; no upstream indexed-block freshness check.

**Failure and recovery behavior:**

- dns: Rejected and caught by query boundary.
- http404: GraphQLClient throws HTTP/client error on completed response.
- http429: Same; no application Retry-After policy.
- http5xx: Same.
- request Hang: No deadline.
- body Hang: No deadline.
- malformed Json: Rejected inside transport.
- malformed Business Data: GraphQL envelope accepted without runtime validation of typed business data; tested valid envelope with invalid values and invalid accounts shape.
- stale: No staleTime override or source indexed-block age check.
- warm: Successful same-key multisig data remains cached during refetch rejection.
- recovery: React Query stale focus/reconnect/remount; in-flight hang is never timed out.
- cold: Ordinary DNS or complete HTTP rejection leaves discovered multisigs unavailable; provider children still render.
- hang: Discovery loading remains pending indefinitely; provider still renders children.
- malformed: HTTP 200 GraphQL envelope {"data":{"accounts":{}}} passes transport, then .map throws in global provider. {"data":{"accounts":[null]}} similarly throws reading pubKey.

**Existing protections:** No network request is awaited as a global mount gate. Missing data returns an empty discovery list. Pending transactions of discovered multisigs come from Hydration.

**Recommended change:** Validate the full accounts array and member shape inside the query. Defend global provider with Array.isArray and valid members. Expose a local discovery error without throwing above MainLayout. Add deadline and cancellation.

**Source:** [packages/utils/src/helpers/multix.ts:4](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/helpers/multix.ts#L4), [packages/web3-connect/src/hooks/useAccountMultisigs.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/hooks/useAccountMultisigs.ts#L18), [packages/indexer/src/multix/accounts.ts:9](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/multix/accounts.ts#L9), [packages/indexer/src/multix/__generated__/sdk.ts:66](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/multix/__generated__/sdk.ts#L66), [apps/main/src/providers/MultisigProvider.tsx:39](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/MultisigProvider.tsx#L39), [apps/main/src/routes/__root.tsx:80](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L80)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## Reown AppKit config/limits/origin control APIs

**Activation:** conditional. **Worst traced scope:** Wallet readiness, all account selection and restore. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

WalletConnect readiness and restoration. A pending provider can hide healthy connected accounts and block later saved-wallet restoration. Main browsing and Hydration read UI remain available.

**Endpoints:** `https://api.web3modal.org/appkit/v1/config`; `https://api.web3modal.org/appkit/v1/project-limits`; `https://api.web3modal.org/projects/v1/origins`

**Packages:** `@reown/appkit 1.8.19`; `@reown/appkit-controllers 1.8.19`

**Deadline:** No bound for initial config/usage fetch and body. **Retry:** Rejection falls back; a pending readiness request must settle or restart. **Cancellation:** No UI deadline around ready()/enable(). **Cache:** Already initialized AppKit instance avoids the cold control-plane gate.

**Failure and recovery behavior:**

- DNS HTTP failure: Immediate configuration/usage failures are caught, as tested. Origin checks catch failures or display rate/server alerts. No fatal root failure was established.
- hang: Unbounded fetch/body reads hold AppKit ready. WalletConnect enable awaits it. The shared account selector hides all accounts while a provider is pending, and sequential restoration can stop at that provider.
- malformed: Configuration processing falls back to defaults; invalid usage data is caught. Malformed origins can cause an alert or a caught error. No immediate global crash was established.
- stale: Cloud configuration controls feature enablement. There is no local deadline/fallback for a request that never settles. A warm initialized instance has already passed this gate.
- cold warm recovery: Cold WalletConnect enable can hang. A warm, ready instance is not affected by later outages of these startup APIs. A pending request must settle or restart; the UI has no deadline.

**Existing protections:** Immediate failures have fallbacks. Native/injected wallets are independent. ConnectAll excludes WalletConnect.

**Recommended change:** Bound every readiness step and construct WalletConnect lazily. Keep healthy accounts visible while another provider is pending. Restore independent wallets in parallel and allow cancellation/retry of failed initialization.

**Source:** [packages/web3-connect/src/wallets/index.ts:89](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/index.ts#L89), [packages/web3-connect/src/wallets/ReownWalletConnect/AppKit.ts:12](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/ReownWalletConnect/AppKit.ts#L12), [node_modules/@reown/appkit/dist/esm/src/client/appkit-base-client.js:224](https://unpkg.com/@reown/appkit@1.8.19/dist/esm/src/client/appkit-base-client.js), [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ApiController.js:108](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/ApiController.js), [node_modules/@reown/appkit-controllers/dist/esm/src/utils/FetchUtil.js:18](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/utils/FetchUtil.js), [packages/web3-connect/src/hooks/useWeb3EagerEnable.ts:45](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/hooks/useWeb3EagerEnable.ts#L45), [packages/web3-connect/src/components/content/AccountSelectContent.tsx:153](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/components/content/AccountSelectContent.tsx#L153)

**Fault evidence:** [dependency-faults.json](evidence/dependency-faults.json)

## 1Click indicative and firm quotes

**Activation:** conditional. **Worst traced scope:** Pending XC submit can block native swap button. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Cross-chain quote and preparation. Ordinary Hydration quotes use a separate path. A pending cross-chain submission can leave the shared swap button busy after switching to Hydration until it settles or the provider unmounts.

**Endpoints:** `https://1click.chaindefuser.com/v0/quote`

**Packages:** `@galacticcouncil/xc-swap 0.9.0`; `@defuse-protocol/one-click-sdk-typescript 0.1.25`; `axios 1.13.6`

**Deadline:** Axios timeout 0; order deadline is not an HTTP deadline. **Retry:** Indicative quote refresh 15s; a pending request prevents completion. **Cancellation:** UI query and mutation do not cancel the underlying SDK request or invalidate late selection responses. **Cache:** Shared submission pending state can survive a destination switch.

**Failure and recovery behavior:**

- DNS HTTP failure: The quote path converts business/transport errors into a failed quote. A firm build rejection creates an initial-error transaction review and prevents signing.
- hang: API and response body reads are unbounded and ignore the query cancellation signal. A firm build can leave the mutation pending before a transaction modal exists. The shared pending flag can disable a subsequent Hydration swap within the same mounted provider.
- malformed: Missing depositAddress is explicitly rejected. Other amounts and API errors are mapped. Unexpected shapes can reject the local quote/build; there is no proof of a global crash.
- stale: Quotes refetch every 15 seconds. The default 30-minute business deadline is order expiry, not a network timeout. Late results have no selection-generation cancellation guard.
- cold warm recovery: Local quotes remain independent until the shared pending-submission case. Delayed API recovery can resume the old preparation after the user changes the form. Navigation/unmount resets the mutation UI but does not abort the network work.

**Existing protections:** Quote failures safely block the cross-chain trade. A firm quote must include a deposit address. Signing starts after the firm quote arrives. Onchain quotes use a separate path.

**Recommended change:** Add complete-request deadlines and cancellation. Cancel/reset pending cross-chain preparation when switching modes, and ignore outdated results. Expose service-specific quote errors.

**Source:** [audit/crosschain-sources/xc-swap.mjs:261](https://unpkg.com/@galacticcouncil/xc-swap@0.9.0/build/index.mjs), [audit/crosschain-sources/xc-swap.mjs:343](https://unpkg.com/@galacticcouncil/xc-swap@0.9.0/build/index.mjs), [node_modules/@defuse-protocol/one-click-sdk-typescript/dist/index.js:1031](https://unpkg.com/@defuse-protocol/one-click-sdk-typescript@0.1.25/dist/index.js), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts:85](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts#L85), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSubmit.ts:118](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSubmit.ts#L118)

**Fault evidence:** [oneclick-faults.json](evidence/oneclick-faults.json)

## Neckwork platform TVL and volume

**Activation:** active. **Worst traced scope:** Malformed totals disable liquidity route controls. **Evidence:** Browser + source; High: exact source query/math and production browser route injection both verified; global navigation survives.. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Liquidity statistics, pool detail TVL. Browser VERIFIED: liquidity route error screen, while header and navigation remain functional and Hydration remains healthy.

**Endpoints:** `https://hydration-api.neckwork.net/v1/stats/platform`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached totals can remain under ordinary refetch failure without freshness label. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached totals can remain under ordinary refetch failure without freshness label.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Normal reject yields no totals/placeholders; pool tables/actions chain-backed.
- hang: Headers loading indefinitely.
- malformed: HTTP 200 {"tvl":{},"volume24h":{}} returns undefined fields; AllPools Big(undefined).plus(...) throws. Production browser injection verified /liquidity route error screen, with navigation still present and 1224 Hydration messages received over about 35 seconds.

**Existing protections:** NO_TOTALS missing-result placeholders Isolated header can sum chain liquidity when health dead

**Recommended change:** Runtime schema with required finite nonnegative TVL/volume Compute stats inside query/select with catches Wrap optional headers in local error boundary

**Source:** [packages/indexer/src/neckwork/stats.ts:15](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/stats.ts#L15), [apps/main/src/modules/liquidity/components/PoolsHeader/AllPools.tsx:26](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/PoolsHeader/AllPools.tsx#L26), [apps/main/src/modules/liquidity/components/PoolsHeader/Omnipool.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/PoolsHeader/Omnipool.tsx#L25), [apps/main/src/modules/liquidity/components/PoolsHeader/Isolated.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/PoolsHeader/Isolated.tsx#L25), [apps/main/src/api/omnipool.ts:165](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/omnipool.ts#L165), [apps/main/src/modules/liquidity/components/PoolDetailsValues/PoolDetailsValues.tsx:115](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/PoolDetailsValues/PoolDetailsValues.tsx#L115)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json), [browser-additional/neckwork-malformed-stats.json](evidence/browser-additional/neckwork-malformed-stats.json), [Malformed statistics production browser test](evidence/browser-additional/neckwork-malformed-stats.json)

## Kamino PRIME APY

**Activation:** active. **Worst traced scope:** Malformed APY can break borrow provider calculations. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

PRIME external yield in shared money-market and liquidity APY calculations. Borrow provider and any liquidity APY consumers that include PRIME may throw during render; route boundary outcome not browser-tested in this slice.

**Endpoints:** `https://hydration-api.neckwork.net/proxy/kamino/yields/3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7/history?start=now-2h&end=now`

**Packages:** `@galacticcouncil/main 0.0.0 (workspace)`; `@galacticcouncil/money-market 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `bignumber.js 9.3.1`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`; `zustand 5.0.12`

**Deadline:** No whole-operation deadline. Same; unbounded response.json. **Retry:** Fetch/cache helper catches thrown errors and resolves cached number or null. React Query therefore sees success and does not retry; Kamino additionally retry=0. **Cancellation:** Bare fetch; no React Query signal passed. **Cache:** Within seven-day receipt age, fallback is used only after rejection; no stale marker. createdOn is neither parsed nor checked; old successful row resets receipt-based cache age.

**Failure and recovery behavior:**

- dns: Cold => null; warm <=7day receipt-age entry => last cached APY; older => null.
- http404: No HTTP status check; a valid shaped APY history body can be accepted on nonOK status.
- http429: Same; no Retry-After handling.
- http5xx: Same.
- request Hang: Cache fallback is attempted only after fetch rejects; a hung request never reaches it.
- body Hang: Same; unbounded response.json.
- malformed Json: Caught, uses TTL fallback/null.
- stale: createdOn is neither parsed nor checked; old successful row resets receipt-based cache age.
- warm: Within seven-day receipt age, fallback is used only after rejection; no stale marker.
- recovery: Queries resolve null/cached on errors; next stale focus/reconnect/remount can fetch again; no periodic interval. Cache expiry checked only on catch, not on mounted display.
- cold: Thrown error returns null to main APY calculation. PRIME supply modal independently displays static PRIME_APY=7.5%, not the live Kamino rate. A valid empty history also returns 7.5%.
- hang: One source keeps aggregate APYs loading; stored fallback is not consulted while request is pending.
- malformed: apy="not-a-number" passes string schema, returns and writes NaN into the live cache. Later Big(NaN) throws in shared borrow/liquidity APY calculations.
- Malformed business data: APY is validated only as a string, so a nonnumeric string becomes NaN and is cached before a later render calculation throws.

**Existing protections:** Seven-day persisted fallback on thrown errors. Main APY/net APY supports unknown null. Core reserve data and transactions use Hydration. PRIME supply modal uses static 7.5% regardless of live APY.

**Recommended change:** Validate finite decimal APY and sample timestamp before cache write. Add HTTP status check and fetch/body deadline. Return stored fallback immediately with freshness metadata. Handle optional APY failures locally. Display whether PRIME rate is static, live, stale or unavailable.

**Source:** [apps/main/src/states/externalApy.ts:27](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L27), [apps/main/src/states/externalApy.ts:41](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L41), [apps/main/src/states/externalApy.ts:61](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L61), [apps/main/src/api/external/kamino.ts:33](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kamino.ts#L33), [apps/main/src/api/external/kamino.ts:21](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kamino.ts#L21), [apps/main/src/api/external/kamino.ts:43](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kamino.ts#L43), [packages/money-market/src/ui-config/misc.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/ui-config/misc.ts#L18), [apps/main/src/api/borrow/hooks.ts:319](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/hooks.ts#L319), [apps/main/src/modules/borrow/hooks/useExternalApyData.ts:13](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/hooks/useExternalApyData.ts#L13), [apps/main/src/modules/borrow/context/ApyContext.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/context/ApyContext.tsx#L25), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:203](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L203), [apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx:466](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx#L466), [apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts:144](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts#L144), [packages/money-market/src/components/transactions/supply/SupplyModalContent.tsx:321](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/components/transactions/supply/SupplyModalContent.tsx#L321)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## Kraken NEAR/ZEC spot and historical USD

**Activation:** active. **Worst traced scope:** Malformed price can throw in portfolio valuation. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Foreign USD balance valuation and XC chart; Hydration trade remains available. Portfolio NEAR USD calculation can throw for a malformed successful close; route render impact follows source placement.

**Endpoints:** `https://api.kraken.com/0/public/OHLC?pair=NEARUSD&interval=...`; `https://api.kraken.com/0/public/OHLC?pair=ZECUSD&interval=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** Cached same-key candles remain; no source freshness badge. Last candle accepted as spot without an age check or periodic poll.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: Cached same-key candles remain; no source freshness badge.
- recovery: Query lifecycle only unless explicit interval noted.
- dns: Two retries then foreign USD unavailable; balance source remains separate.
- http404: NonOK rejects, retried twice.
- http429: Same; no Retry-After handling.
- http5xx: Same.
- hang: No request/body deadline; USD/chart request can remain pending indefinitely.
- malformed: Tuple validates OHLC fields as strings only. Number(bad) gives NaN; portfolio later evaluates Big("NaN") and throws.
- stale: Last candle accepted as spot without an age check or periodic poll.

**Existing protections:** Explicit NEAR/ZEC pair allowlist. Zod validates tuple/envelope shape. Two query retries after rejection. Undefined price permits balances without USD valuation.

**Recommended change:** Require finite positive OHLC and valid sample timestamp. Bound fetch and body. Keep balance usable while USD valuation is unknown or stale.

**Source:** [apps/main/src/api/external/kraken.ts:56](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kraken.ts#L56), [apps/main/src/api/external/kraken.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kraken.ts#L83), [apps/main/src/api/external/kraken.ts:93](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kraken.ts#L93), [apps/main/src/api/external/kraken.ts:120](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/kraken.ts#L120), [apps/main/src/api/portfolio/multichain.ts:185](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/multichain.ts#L185), [apps/main/src/api/portfolio/multichain.ts:225](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/multichain.ts#L225), [apps/main/src/modules/trade/swap/sections/XcSwap/XcSwapProvider.tsx:184](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/XcSwapProvider.tsx#L184), [apps/main/src/modules/trade/swap/components/XcSwapChart/XcSwapChart.data.ts:123](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/XcSwapChart/XcSwapChart.data.ts#L123)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## IndexedDB asset/account/portfolio persistence

**Activation:** active. **Worst traced scope:** Malformed assets can reach root render. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Storage is intended optional and restore is asynchronous/ungated. Malformed restored asset state is effectively trusted by required root provider.

**Endpoints:** `browser IndexedDB hydration-db version2: asset-registry/account-balances/portfolio-balances`

**Packages:** `@galacticcouncil/main 0.0.0`; `zustand 5.0.12`

**Deadline:** No open/blocked/transaction deadline. **Retry:** Singleton open promise caches pending or rejected state. **Cancellation:** No blocked/open cancellation or reset/reopen policy. **Cache:** Persisted assets not schema validated; portfolio persistence has separate validation.

**Failure and recovery behavior:**

- dns http: No network service. Open onerror resolvesnull and in-memory data can continue; thrown open produces rejected cached singleton.
- hang: No open/blocked/transaction deadline; missing onblocked handling. Initial in-memory fresh registry can still populate because app does not await store hydration. Cross-chain switch awaits cache clear and can be held by blocked/open transaction. Portfolio restore/save pipeline also stalls.
- malformed stale: Persisted records merged without schema or freshness validation; invalid assets type can reach root AssetsProvider.reduce and fail render. Matching-genesis stale registry may boot immediately and refetch background; unrelated-genesis cache rejected by gate. Late hydration may overwrite fresher in-memory state.
- recovery: Singleton caches successful/rejected/pending open forever; no reset/reopen on versionchange/close. Writes use async forEach so outer catch does not catch each rejected put; quota may cause unhandled rejections. Browser unhandled rejection alone is not proven to unmount React.

**Existing protections:** Open/read request onerror softer values; read JSON aggregation try/catch; same-genesis registry guard; in-memory Zustand defaults.

**Recommended change:** Treat storage as best-effort; validate restored asset schema; deadline/onblocked/versionchange close/reset; await Promise.allSettled writes; ensure old asynchronous restore cannot clobber current chain snapshot.

**Source:** [apps/main/src/utils/indexedDB.ts:31](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/indexedDB.ts#L31), [apps/main/src/utils/indexedDB.ts:46](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/indexedDB.ts#L46), [apps/main/src/utils/indexedDB.ts:169](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/indexedDB.ts#L169), [apps/main/src/utils/indexedDB.ts:200](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/indexedDB.ts#L200), [apps/main/src/states/assetRegistry.ts:28](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/assetRegistry.ts#L28), [apps/main/src/providers/assetsProvider.tsx:146](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/assetsProvider.tsx#L146), [apps/main/src/api/rpcClient.ts:149](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L149)

**Fault evidence:** [deep-startup-faults.results.json#idb_synchronous_open_failure](evidence/deep-startup-faults.results.json)

## LocalStorage preferences, RPC selection and price/trade state

**Activation:** active. **Worst traced scope:** RPC resolver and persisted preferences. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Intended optional persistence; currently provider-resolution writes are required to reach outer startup readiness flag.

**Endpoints:** `browser localStorage rpcUrl/rpcList/theme/trade-settings/hdx-display-asset/prices-* and other Zustand stores`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/utils 0.0.0`; `zustand 5.0.12`

**Deadline:** Synchronous local storage operations. **Retry:** Denied getter falls back to memory; throwing writes are not softened. **Cancellation:** Not an asynchronous transport. **Cache:** Unvalidated same-version data can merge; quota writes can throw before resolver readiness.

**Failure and recovery behavior:**

- dns http: No network service. Default createJSONStorage catches denied storage getter and gives memory fallback; hydration read errors caught by middleware. Available object whose setItem throws quota/security is not softened.
- hang: Browser localStorage synchronous operations; no async network timeout.
- malformed stale: Most default persist stores merge same-version payload without schema. Custom helper validates but returns original invalid JSON on schema mismatch; same-version invalid object is then merged. Head theme script removes invalid theme in normal supported execution.
- recovery: Writes propagate after in-memory state updated. Resolver setState throw occurs before setIsBestProviderFound(true), captured by useAsyncFn; component stays null outside router. This entire-boot blast radius is a source-path inference plus directly reproduced provider write exception, not yet full browser quota injection.

**Existing protections:** Default Zustand storage getter/hydration catches;inline theme/head probes catch;some store-specific validation/TTL.

**Recommended change:** Soft-fail all persistence writes and preserve in-memory state; always settle resolver readiness via explicit fallback; reject/reset invalid same-version stored values.

**Source:** [apps/main/src/states/provider.ts:74](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/provider.ts#L74), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:86](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L86), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:93](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L93), [node_modules/zustand/middleware.js:368](https://unpkg.com/zustand@5.0.12/middleware.js), [packages/utils/src/lib/zustandStorage.ts:57](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/lib/zustandStorage.ts#L57), [apps/main/src/utils/head.js:52](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/head.js#L52)

**Fault evidence:** [deep-startup-faults.results.json#provider_resolution_persist_write_failure](evidence/deep-startup-faults.results.json)

## TanStack Router and root render boundaries

**Activation:** active. **Worst traced scope:** Root versus nested error containment. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Required navigation; root-level failures affect all root children; nested route failures can retain surrounding layout.

**Endpoints:** `Same-origin code-split route chunks`

**Packages:** `@tanstack/react-router 1.170.10`; `@galacticcouncil/main 0.0.0`

**Deadline:** Root suspense keeps shell visible but unusable base content when required async dependencies pending. Service-only Suspense fallback:null hides TransactionManager/Web3ConnectModal while waiting. **Retry:** Current RouteError offers full page reload. No independent optional-service error boundary in root Services; Suspense handles pending only, not rejection. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Nested route fetch/import error may render RouteError inside current layout. Root provider/registry/lazy service failure can replace entire route root. Resolver failure sits outside RouterProvider and returns null, so router error UI cannot contain it.
- hang: Root suspense keeps shell visible but unusable base content when required async dependencies pending. Service-only Suspense fallback:null hides TransactionManager/Web3ConnectModal while waiting.
- malformed stale: Corrupted asset store errors in AssetsProvider can propagate to root boundary; exact final error fallback may itself lack provider context, so not guaranteed full error UI for every root failure.
- recovery: Current RouteError offers full page reload. No independent optional-service error boundary in root Services; Suspense handles pending only, not rejection.

**Existing protections:** Loading skeleton root pending; default route error UI; local lazy-service Suspense; cached assets branch ordinary query.

**Recommended change:** Place optional services behind their own error boundaries; keep shell/navigation mounted and providers/default state safe during root errors. Add explicit resolver fallback outside router.

**Source:** [apps/main/src/App.tsx:61](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L61), [apps/main/src/App.tsx:78](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L78), [apps/main/src/routes/__root.tsx:54](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L54), [apps/main/src/routes/__root.tsx:81](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L81), [apps/main/src/routes/__root.tsx:125](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L125), [apps/main/src/providers/rpcProvider.tsx:39](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/rpcProvider.tsx#L39)

## Application hosting and executable/static assets

**Activation:** active. **Worst traced scope:** First load or failed lazy chunks. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Mandatory for uncached first document/entry load. Already loaded UI should survive later host loss, but current lazy chunk handler can reload it.

**Endpoints:** `window.location.origin/index.html`; `window.location.origin/chunk-[hash].js`; `window.location.origin/assets/*`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/ui 0.0.0`

**Deadline:** Dynamic module fetch has no application deadline; Suspense can remain loading. **Retry:** vite:preloadError unconditionally requests full reload; persistent hosting outage can repeat failure and discard warm state. Loaded-vs-initial hosting distinction is explicit; no app can execute uncached code without its host. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Initial missing entry script prevents bootstrap. Warm cached/executed features continue until missing route/service/descriptor chunk is requested.
- hang: Dynamic module fetch has no application deadline; Suspense can remain loading.
- malformed stale: Old HTML referencing removed hash rejects imports; wrong MIME/HTML SPA fallback at a chunk URL also rejects imports.
- recovery: vite:preloadError unconditionally requests full reload; persistent hosting outage can repeat failure and discard warm state. Loaded-vs-initial hosting distinction is explicit; no app can execute uncached code without its host.

**Existing protections:** Local font assets use font-display:swap. Existing route error/pending components. Same-origin entry/static deployment; no third-party runtime CDN for framework JS.

**Recommended change:** Retain currently usable UI when a later chunk fails; show local retry/reload controls. Keep historical immutable chunks available during deploy overlap; consider preload/cache coverage for essential routes.

**Source:** [apps/main/index.html:10](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/index.html#L10), [apps/main/vite.config.ts:92](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/vite.config.ts#L92), [apps/main/src/App.tsx:97](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L97), [apps/main/src/routes/__root.tsx:28](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L28)

**Fault evidence:** [deep-startup-faults.results.json#preload_error_unconditionally_reloads](evidence/deep-startup-faults.results.json)

## Ping Web Worker and Comlink control channel

**Activation:** active. **Worst traced scope:** Automatic RPC selection before routing. **Evidence:** Source trace; medium. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Module constructs worker eagerly; resolver depends on its response in autoMode.

**Endpoints:** `window.location.origin/[bundled ping.worker asset]`

**Packages:** `@galacticcouncil/main 0.0.0`

**Deadline:** Worker crash/message-channel failure has no outer Comlink-call deadline in resolver, despite network probes having deadlines. **Retry:** No visible worker restart or inline-main-thread fallback at call sites. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Missing worker asset, CSP worker denial, or constructor exception may prevent loading imported module.
- hang: Worker crash/message-channel failure has no outer Comlink-call deadline in resolver, despite network probes having deadlines.
- malformed stale: Worker protocol/version mismatch after deployment can fail calls.
- recovery: No visible worker restart or inline-main-thread fallback at call sites.

**Existing protections:** Probe deadlines exist within worker. Inline head prewarm can bypass worker discovery if it has successful cached results.

**Recommended change:** Handle worker error/messageerror; add outer call deadline and main-thread/configured-endpoint fallback.

**Source:** [apps/main/src/workers/ping/index.ts:6](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/workers/ping/index.ts#L6), [apps/main/src/workers/ping/ping.worker.ts:190](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/workers/ping/ping.worker.ts#L190), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:66](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L66)

## Injected/Wallet Standard extensions and mobile deeplinks

**Activation:** conditional. **Worst traced scope:** Chosen provider can hold shared account selector. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Local injected wallet permission, account and signing APIs. The UI cannot enumerate private RPCs/backends inside a wallet extension.

**Endpoints:** `https://link.metamask.io/dapp/{host}`; `https://app.novawallet.io/open/dapp`; `https://phantom.app/ul/browse/{url}`; `https://solflare.com/ul/v1/browse/{url}`

**Packages:** `@galacticcouncil/web3-connect workspace`; `@mysten/wallet-standard 0.19.9`; `@solana/web3.js 1.98.4`; `viem 2.56.8`

**Deadline:** Any provider whose enable call never settles can hide healthy accounts in the shared selector. There is no call deadline. Extension backend dependencies cannot be inferred from this UI source. **Retry:** Previously connected account restoration depends on the chosen wallet. External watch-only accounts and local navigation remain available. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- provider reject: Enable mutations do not retry. Error handling disconnects the failed provider; that wallet becomes unavailable.
- provider hang: Any provider whose enable call never settles can hide healthy accounts in the shared selector. There is no call deadline. Extension backend dependencies cannot be inferred from this UI source.
- deeplink DNS HTTP failure: External URLs are opened only for chosen navigation or installation. DNS/HTTP failures affect that action; the UI does not fetch them during startup.
- stale cold warm recovery: Previously connected account restoration depends on the chosen wallet. External watch-only accounts and local navigation remain available.

**Existing protections:** Connectors are independent and have error handling. Injected wallet discovery is local. External watch-only accounts are supported.

**Recommended change:** Add per-provider deadlines and cancellation. Restore providers independently and show healthy accounts while others remain pending.

**Source:** [packages/web3-connect/src/wallets/index.ts:53](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/index.ts#L53), [packages/web3-connect/src/config/deeplinks.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/config/deeplinks.ts#L18), [packages/web3-connect/src/hooks/useWeb3EagerEnable.ts:64](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/hooks/useWeb3EagerEnable.ts#L64), [packages/web3-connect/src/components/content/AccountSelectContent.tsx:80](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/components/content/AccountSelectContent.tsx#L80)

## WalletConnect session relay

**Activation:** conditional. **Worst traced scope:** WalletConnect signing; shared pending account UI. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

WalletConnect pairing, sessions and signing. Native injected wallets do not require the relay.

**Endpoints:** `wss://relay.walletconnect.org`

**Packages:** `@walletconnect/core 2.23.7`; `@walletconnect/sign-client 2.23.7`; `@walletconnect/universal-provider 2.23.7`

**Deadline:** Each relay connection attempt has a 15-second bound. The UI enable/session promise has no overall deadline and ends on session change or modal close. A pending provider can hide all accounts. **Retry:** Core reconnect supports restoration. A native wallet can remain viable, but the shared pending-account selector needs correction. No alternative relay is configured. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS connection failure: Core has finite connection timeouts, reconnect logic and error handling. WalletConnect enable may fail or wait for a session/modal/user action.
- hang: Each relay connection attempt has a 15-second bound. The UI enable/session promise has no overall deadline and ends on session change or modal close. A pending provider can hide all accounts.
- malformed: Protocol messages are validated and invalid data is rejected. No root crash was established.
- stale: Session/request TTLs and heartbeat checks exist. A cached account does not make signing work while the relay is unavailable.
- cold warm recovery: Core reconnect supports restoration. A native wallet can remain viable, but the shared pending-account selector needs correction. No alternative relay is configured.

**Existing protections:** Core has a 15-second connect timeout, heartbeat and retries. Modal closure rejects the enable promise.

**Recommended change:** Add an overall connection deadline, cancellation and retry. Keep healthy accounts selectable and show relay-specific unavailability.

**Source:** [audit/crosschain-sources/walletconnect-core.js:133](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:2076](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:2377](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [packages/web3-connect/src/wallets/ReownWalletConnect/index.ts:70](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/ReownWalletConnect/index.ts#L70), [packages/web3-connect/src/wallets/ReownWalletConnect/utils.ts:50](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/ReownWalletConnect/utils.ts#L50)

## TanStack Query cache/retry/cancellation

**Activation:** active. **Worst traced scope:** Shared query policy; caller determines scope. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Required framework code; query dependencies optional or required according to consumer hook.

**Endpoints:** `No own service; wraps each configured query operation`

**Packages:** `@tanstack/react-query 5.101.4`; `@tanstack/query-core 5.101.4`

**Deadline:** Retries wait for rejection. No generic request deadline. Unused query abort signal does not cancel underlying fetch; useObservableQuery promise resolves first value only and no error/reject bridge. **Retry:** Depends on individual stale/refetch/enable policies; root suspense throws cold required query error. Mounted ordinary queries contain errors in result state. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Browser observed queries default3 retries with exponential1s/2s/4s delay; ensureQueryData/fetchQuery explicitly default retry:false. Global caches log errors only; ordinary useQuery does not throw unless configured.
- hang: Retries wait for rejection. No generic request deadline. Unused query abort signal does not cancel underlying fetch; useObservableQuery promise resolves first value only and no error/reject bridge.
- malformed stale: Data schemas are application responsibility. Cached success remains available through refetch errors. staleTimeInfinity removes routine refetch and may cache safe-empty outage outcomes indefinitely.
- recovery: Depends on individual stale/refetch/enable policies; root suspense throws cold required query error. Mounted ordinary queries contain errors in result state.

**Existing protections:** Retry/backoff/cache reuse; non-suspense result error containment; query gc/cancellation infrastructure.

**Recommended change:** Specify dependency-specific deadlines and propagate query signals to underlying work; document success-empty versus unavailable; localize suspense/error boundaries.

**Source:** [apps/main/src/App.tsx:27](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L27), [node_modules/@tanstack/query-core/src/retryer.ts:170](https://unpkg.com/@tanstack/query-core@5.101.4/src/retryer.ts), [node_modules/@tanstack/query-core/src/retryer.ts:50](https://unpkg.com/@tanstack/query-core@5.101.4/src/retryer.ts), [node_modules/@tanstack/query-core/src/queryClient.ts:358](https://unpkg.com/@tanstack/query-core@5.101.4/src/queryClient.ts), [apps/main/src/api/assets.ts:253](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/assets.ts#L253), [apps/main/src/hooks/useObservableQuery.ts:52](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/hooks/useObservableQuery.ts#L52)

## External EVM RPC providers

**Activation:** conditional. **Worst traced scope:** External chain balances, fees and transfer. **Evidence:** Functions + source; high; body test owned by startup agent. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Ethereum and Base default portfolio queries; Robinhood routes; selected source/destination balances, fees, allowances and transfer builds.

**Endpoints:** `https://stylish-quick-firefly.base-mainnet.quiknode.pro/`; `https://ethereum-rpc.publicnode.com`; `https://cosmopolitan-dimensional-diagram.quiknode.pro`; `https://rpc.mainnet.chain.robinhood.com`

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/xc-sdk 2.5.0`; `viem 2.56.8`

**Deadline:** Viem nominal HTTP timeout 10s bounds headers; a hanging body escapes it. **Retry:** Viem retries/fallback exist, but cannot run until a request settles. **Cancellation:** No whole-response deadline or UI query signal forwarding identified. **Cache:** Stale data retained while pending; aggregate success [] can overwrite balances.

**Failure and recovery behavior:**

- DNS HTTP failure: Chain.getBalances uses allSettled and drops failed assets. If every read fails, it can resolve [] and conceal the outage. Individual fee/call queries reject.
- hang: The viem HTTP fetch timeout defaults to 10 seconds, with retries and fallback. A response body that never finishes is outside that timeout. The UI does not forward a cancellation signal, so selected XCM loading or submission can remain pending.
- malformed: Invalid JSON, RPC responses or BigInt values reject. The balance aggregator can erase these failures as missing or empty data.
- stale: Portfolio balances become stale after 60 seconds; picker snapshots after 30 seconds. Late subscription errors preserve the previous balance. There is no explicit stale marker.
- cold warm recovery: A cold unavailable chain appears empty or loading. Warm cached portfolio data remains available during pending reads, but a successful empty result can overwrite it. Reopening or refetching retries settled failures; a hung request remains in flight.

**Existing protections:** Independent portfolio queries preserve Hydration and other chains. Ethereum uses PublicNode plus QuickNode fallback; Base and Robinhood each have one explicit RPC. Read and transaction build errors remain within their queries or mutations.

**Recommended change:** Bound the complete response body and decoding. Propagate cancellation. Report unavailable assets or chains instead of successful empty balances, and expose stale timestamps.

**Source:** [audit/crosschain-sources/xc-core.mjs:2176](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2224](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [apps/main/src/api/portfolio/multichain.ts:95](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/multichain.ts#L95), [node_modules/viem/_esm/utils/rpc/http.js:19](https://unpkg.com/viem@2.56.8/_esm/utils/rpc/http.js)

**Fault evidence:** [dependency-faults.json](evidence/dependency-faults.json), [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json), [deep-startup-faults.results.json](evidence/deep-startup-faults.results.json)

## NEAR RPC

**Activation:** conditional. **Worst traced scope:** NEAR balances; independent of 1Click output. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

NEAR portfolio balances. NEAR can be a 1Click destination and is not a Hydration readiness dependency.

**Endpoints:** `https://free.rpc.fastnear.com`

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`

**Deadline:** No fetch/body deadline. **Retry:** Settled asset errors swallowed by balance aggregation; polling can retry later. **Cancellation:** No signal forwarded; cleanup does not cancel in-flight read. **Cache:** Successful empty outage result can replace warm balance data.

**Failure and recovery behavior:**

- DNS HTTP failure: HTTP and RPC errors other than UNKNOWN_ACCOUNT reject internally. If every asset fails, the chain returns [] successfully; this was tested. UNKNOWN_ACCOUNT correctly becomes zero.
- hang: Fetch and response body reads are unbounded. The tested call stayed pending; only the affected chain query waits.
- malformed: JSON result data is unvalidated. Missing or invalid amount data can throw; an undefined account becomes zero. The aggregate swallows thrown errors.
- stale: The request asks for finality final, but has no age marker. Three-second polling retains previous balances on late errors and can overlap hung reads.
- cold warm recovery: The outage is contained to the chain data. A successful empty result can overwrite warm balances. Query retries do not run because the aggregate resolves successfully.

**Existing protections:** HTTP errors and known account errors are handled. Portfolio queries are independent. Subscription setup checks whether it was disposed.

**Recommended change:** Preserve outage errors or return explicit partial-result status. Bound and cancel the entire request. Prevent overlapping polls and add an independent provider.

**Source:** [audit/crosschain-sources/xc-cfg.mjs:2268](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2341](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2292](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:295](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs)

**Fault evidence:** [dependency-faults.json](evidence/dependency-faults.json)

## Other Substrate parachain/relay RPCs

**Activation:** conditional. **Worst traced scope:** External Substrate chains. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

AssetHub and Bifrost default portfolio queries; other configured Substrate routes when selected. Listing the configuration does not initiate a connection.

**Endpoints:** `wss://asset-hub-polkadot-rpc.n.dwellir.com`; `wss://polkadot-asset-hub-rpc.polkadot.io`; `wss://asset-hub-polkadot-rpc.n.dwellir.com`; `wss://polkadot-asset-hub-rpc.polkadot.io`; `wss://rpc.astar.network`; `wss://eu.bifrost-polkadot-rpc.liebi.com/ws`; `wss://hk.p.bifrost-rpc.liebi.com/ws`; `wss://bifrost-polkadot.dotters.network`; `wss://parachain-rpc.origin-trail.network`; `wss://mythos-rpc.dmarket.com`; `wss://rpc-pendulum.prd.pendulumchain.tech`; `wss://polkadot-rpc.n.dwellir.com`; `wss://ws.unique.network`; `wss://wnp-rpc.mainnet.energywebx.com`; `wss://asset-hub-kusama-rpc.n.dwellir.com`; `wss://basilisk-rpc.n.dwellir.com`

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/common 1.2.0`; `@galacticcouncil/descriptors 2.9.0`; `polkadot-api 2.2.2`

**Deadline:** Availability and subscriptions can wait for reconnection. The probe rotates a chain with multiple endpoints but imposes no caller deadline. A stream that never emits its first value prevents combineLatest from completing the selected batch. **Retry:** Warm cache remains available while a request is pending. A rejected chain-spec promise is cached by getSpec and is not reset; recovery may require recreating the client/context. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS connection failure: PAPI reconnects or rotates endpoints. Final asset/batch errors are dropped and can produce a successful empty balance result.
- hang: Availability and subscriptions can wait for reconnection. The probe rotates a chain with multiple endpoints but imposes no caller deadline. A stream that never emits its first value prevents combineLatest from completing the selected batch.
- malformed: Decoder failures remain local to a request or subscription. Asset streams retry three times with a one-second delay, then emit [].
- stale: The probe checks chain_getHeader progression and rotates after three stale/error observations. A chain with one endpoint has no alternate. Balances have no freshness marker.
- cold warm recovery: Warm cache remains available while a request is pending. A rejected chain-spec promise is cached by getSpec and is not reset; recovery may require recreating the client/context.

**Existing protections:** AssetHub has two providers; Bifrost has three endpoints. Network retries and health probes rotate endpoints. Independent portfolio queries contain outages. Subscription isolation retries three times, then emits [], so settled errors do not indefinitely hold combineLatest.

**Recommended change:** Set caller deadlines and first-emission timeouts. Expose unavailable balances rather than treating all failed reads as zero. Reset rejected chain-spec promises and validate probe header numbers.

**Source:** [audit/crosschain-sources/xc-core.mjs:2740](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2815](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/common.mjs:382](https://unpkg.com/@galacticcouncil/common@1.2.0/build/index.mjs), [audit/crosschain-sources/common.mjs:484](https://unpkg.com/@galacticcouncil/common@1.2.0/build/index.mjs), [apps/main/src/api/xcm.ts:218](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/xcm.ts#L218)

## Solana HTTP and WebSocket RPC

**Activation:** conditional. **Worst traced scope:** Solana balances and selected route. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Solana portfolio and account balances; selected bridge fee, call and claim reads.

**Endpoints:** `https://wispy-palpable-market.solana-mainnet.quiknode.pro`; `wss://wispy-palpable-market.solana-mainnet.quiknode.pro`

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/xc-sdk 2.5.0`; `@solana/web3.js 1.98.4`

**Deadline:** No whole HTTP/body deadline in inspected Connection transport. **Retry:** 429 backoff up to five attempts; subscription retry on settled errors. **Cancellation:** No signal/first-emission deadline. **Cache:** Independent chain cache; later subscription failures can retain stale amount.

**Failure and recovery behavior:**

- DNS HTTP failure: The balance aggregate can return [] after all reads fail. Individual native balance, claim and build queries reject locally. HTTP 429 is retried up to five attempts.
- hang: Fetch and response body reads lack deadlines. A pending initial balance read prevents the subscription from being installed. No cancellation signal is supplied; this was verified using a Connection fetch mock.
- malformed: Invalid RPC responses, decoded data or BigInt values reject, then can be swallowed by the balance aggregate.
- stale: A late balance refresh failure is logged and retains the last amount. WebSocket reconnection follows the library policy; the UI imposes no maximum age.
- cold warm recovery: Other chain queries continue. The initial balance stream retries settled errors three times, then emits an empty result. HTTP and WebSocket use the same QuickNode origin and have no configured alternate.

**Existing protections:** Independent portfolio queries contain the outage. SDK subscription disposal handles setup that completes late. The client retries HTTP 429 and reconnects WebSockets.

**Recommended change:** Add complete-request deadlines and cancellation. Add fallback from a different provider. Expose unavailable and stale balances.

**Source:** [audit/crosschain-sources/xc-cfg.mjs:2087](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2385](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [node_modules/@solana/web3.js/lib/index.cjs.js:5045](https://unpkg.com/@solana/web3.js@1.98.4/lib/index.cjs.js), [packages/web3-connect/src/hooks/useSolanaNativeBalance.ts:22](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/hooks/useSolanaNativeBalance.ts#L22)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## Sui JSON RPC

**Activation:** conditional. **Worst traced scope:** Sui balances and selected route. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Sui portfolio and account native balances; selected XCM limit, fee, build and claim reads.

**Endpoints:** `https://rpc-mainnet.suiscan.xyz`

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/xc-sdk 2.5.0`; `@mysten/sui 1.45.2`

**Deadline:** No fetch/body deadline. **Retry:** 3s polls and settled subscription errors retry; pending polls may overlap. **Cancellation:** No signal/whole-query cancellation. **Cache:** Independent chain cache; all-fail may become successful [].

**Failure and recovery behavior:**

- DNS HTTP failure: HTTP status and JSON-RPC errors reject internally. If all balance reads fail, the chain aggregate resolves [] successfully; this was tested.
- hang: Fetch and JSON body reads have no deadline. The tested balance call stayed pending without a cancellation signal.
- malformed: Malformed results or BigInt conversion failures reject, then can be swallowed by the aggregate.
- stale: Three-second polls can overlap when requests hang. Later errors retain the previous amount without an age marker.
- cold warm recovery: Independent chain queries contain the outage. The initial stream retries settled errors three times. Ongoing polls can recover when a later response arrives, but there is no cancellation or alternate provider.

**Existing protections:** HTTP status and JSON-RPC errors are checked. SDK disposal handles setup that completes late. Portfolio queries are independent.

**Recommended change:** Add response body deadlines and cancellation. Prevent overlapping polls. Add fallback and explicit unavailable states.

**Source:** [audit/crosschain-sources/xc-cfg.mjs:2145](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:2617](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-sources/xc-core.mjs:3047](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [node_modules/@mysten/sui/dist/esm/jsonRpc/http-transport.js:30](https://unpkg.com/@mysten/sui@1.45.2/dist/esm/jsonRpc/http-transport.js)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## p-wait-for polling deadlines

**Activation:** active. **Worst traced scope:** External transaction polls can outlive deadline. **Evidence:** Functions + source; High: exact installed package fault-tested; actual application blast radius is inferred from transaction consumers, not full browser injection.. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional external-chain transaction execution/tracking; library itself is bundled and has no independent cloud endpoint.

**Endpoints:** `RPC endpoints supplied to Solana Connection / external-chain allowance and transfer call builders`

**Packages:** `p-wait-for 6.0.0`; `@galacticcouncil/main 0.0.0`; `@galacticcouncil/web3-connect 0.0.0`

**Deadline:** An unresolved condition promise remains pending beyond configured timeout, observed at120ms with20ms bound. Source has no race around await condition. **Retry:** False settled conditions correctly timeout; hanging awaited RPC needs its own deadline/cancellation. No root UI crash established by this harness. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Condition rejection propagates immediately. Retry is implemented by condition return false, not general exception handling.
- hang: An unresolved condition promise remains pending beyond configured timeout, observed at120ms with20ms bound. Source has no race around await condition.
- malformed stale: A condition resolving success after deadline is accepted; tested70ms success with20ms timeout. Wrong condition return type throws.
- recovery: False settled conditions correctly timeout; hanging awaited RPC needs its own deadline/cancellation. No root UI crash established by this harness.

**Existing protections:** Consumers supply60s or3min polling timeout and intervals; timeout works when conditions settle false. Consumers use RPC providers selected by chain config; endpoint handling belongs to those transports.

**Recommended change:** Put a deadline around the complete underlying RPC/build call or race each condition against timeout and propagate AbortSignal to underlying transport. Keep timed out external transaction steps feature-local and reset pending state safely.

**Source:** [node_modules/p-wait-for/index.js:77](https://unpkg.com/p-wait-for@6.0.0/index.js), [node_modules/p-wait-for/index.js:95](https://unpkg.com/p-wait-for@6.0.0/index.js), [packages/web3-connect/src/signers/SolanaSigner.ts:34](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/signers/SolanaSigner.ts#L34), [packages/web3-connect/src/signers/SolanaSigner.ts:52](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/signers/SolanaSigner.ts#L52), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts:151](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts#L151), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts:161](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap.ts#L161), [apps/main/src/modules/xcm/transfer/utils/transfer.ts:227](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/transfer/utils/transfer.ts#L227)

**Fault evidence:** [wait-faults.cjs](evidence/wait-faults.cjs), [wait-faults.results.json](evidence/wait-faults.results.json)

## 1Click asset/token registry

**Activation:** active. **Worst traced scope:** XC destination selection and recovery. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Cross-chain swap output destinations. A Hydration destination can operate without this registry.

**Endpoints:** `https://1click.chaindefuser.com/v0/tokens`

**Packages:** `@galacticcouncil/xc-swap 0.9.0`; `@defuse-protocol/one-click-sdk-typescript 0.1.25`; `axios 1.13.6`

**Deadline:** Axios timeout 0, including body. **Retry:** UI retry:false; rejected client promise remains cached after recovery. **Cancellation:** SDK CancelablePromise exists, but the async helper removes the cancel handle; query signal unused. **Cache:** Client promise and successful query cached indefinitely.

**Failure and recovery behavior:**

- DNS HTTP failure: Registry query errors remain local. The same xc-swap client caches its rejected promise indefinitely, so refetching after service recovery cannot recover; this was tested.
- hang: The Axios SDK timeout is zero and the caller discards its cancelable request. On a cold cross-chain destination, selection and both pickers can remain loading/disabled.
- malformed: The SDK has no runtime response schema. An unexpected shape can throw during registry mapping in the local query. The raw successful promise remains cached.
- stale: Both the successful query and the client cache have no refresh deadline. Changed token support requires refreshing the client/session.
- cold warm recovery: A cold external destination can become stuck on a hang. Warm cached registry data can survive an outage. A rejected or hung client needs recreation or reload; surrounding navigation remains usable.

**Existing protections:** Onchain destination pairs are built independently. The registry is an ordinary query, not root Suspense. The SDK exposes cancellation, although the UI does not use it.

**Recommended change:** Cache successful values and clear failed/in-flight entries. Add a TTL, complete-request deadline and signal forwarding. Keep the Hydration picker available while cross-chain data loads.

**Source:** [node_modules/@defuse-protocol/one-click-sdk-typescript/dist/index.js:223](https://unpkg.com/@defuse-protocol/one-click-sdk-typescript@0.1.25/dist/index.js), [node_modules/@defuse-protocol/one-click-sdk-typescript/dist/index.js:1197](https://unpkg.com/@defuse-protocol/one-click-sdk-typescript@0.1.25/dist/index.js), [audit/crosschain-sources/xc-swap.mjs:506](https://unpkg.com/@galacticcouncil/xc-swap@0.9.0/build/index.mjs), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapDestinationAssetsQuery.ts:14](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapDestinationAssetsQuery.ts#L14), [apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSelection.ts:39](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/sections/XcSwap/hooks/useXcSwapSelection.ts#L39)

**Fault evidence:** [dependency-faults.json](evidence/dependency-faults.json), [oneclick-faults.json](evidence/oneclick-faults.json)

## Hydration intent relay fee quoter

**Activation:** conditional. **Worst traced scope:** Selected intent quote and preparation. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

A prerequisite for cross-chain swap quotes and builds. Ordinary Hydration swaps use a separate path.

**Endpoints:** `https://quoter-intent.play.hydration.cloud/relay-fee?chain=ethereum&marginBps={margin}`

**Packages:** `@galacticcouncil/xc-swap 0.9.0`

**Deadline:** Fetch, HTTP error text and success JSON reads have no deadline. The whole quote remains pending if any of them hangs. **Retry:** A cached quote may remain during a pending refetch. There is no alternative provider; recovery requires the original request to settle or a new query instance. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: A settled transport/HTTP error becomes a quote failure and prevents cross-chain preparation.
- hang: Fetch, HTTP error text and success JSON reads have no deadline. The whole quote remains pending if any of them hangs.
- malformed: Invalid JSON or feeRequested BigInt conversion becomes a quote error. There is no response schema or freshness validation.
- stale: The quoter has no independent TTL or fallback. The outer quote refetches every 15 seconds.
- cold warm recovery: A cached quote may remain during a pending refetch. There is no alternative provider; recovery requires the original request to settle or a new query instance.

**Existing protections:** HTTP status is checked. Failure is mapped to a local quote error.

**Recommended change:** Bound and cancel the complete request. Validate schema and fee freshness. Show quoter unavailability separately from an invalid trade.

**Source:** [audit/crosschain-sources/xc-swap.mjs:229](https://unpkg.com/@galacticcouncil/xc-swap@0.9.0/build/index.mjs), [audit/crosschain-sources/xc-swap.mjs:261](https://unpkg.com/@galacticcouncil/xc-swap@0.9.0/build/index.mjs)

## IntentScan settlement/order monitor

**Activation:** conditional. **Worst traced scope:** Intent outcome tracking after submission. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Final intent-outcome toasts. The sequence comes from the successful Hydration transaction. This monitor cannot by itself disable a new ordinary swap.

**Endpoints:** `https://explorer-intent.play.hydration.cloud/api/orders/{sequence}`; `https://explorer-intent.play.hydration.cloud/orders/{sequence}`

**Packages:** `@galacticcouncil/utils workspace`; `@galacticcouncil/xc-swap 0.9.0`

**Deadline:** Fetch and body reads have no deadline or signal. A hung in-flight query prevents subsequent polls. The six-hour expiry check runs only when processing starts again and cannot cancel the hung call. **Retry:** Existing submitted toasts remain visible. A later poll can recover from a settled error. A silent hang has no restart/fallback, and direct 1Click status is not used. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Network errors or non-success HTTP status return null and retain the submitted/unknown toast. JSON/schema failures become ordinary query errors.
- hang: Fetch and body reads have no deadline or signal. A hung in-flight query prevents subsequent polls. The six-hour expiry check runs only when processing starts again and cannot cancel the hung call.
- malformed: Zod rejects an invalid shape. An unknown state is not falsely treated as success.
- stale: updated_at supplies the toast date. No maximum age or requested-sequence equality is checked; the terminal backend state is trusted.
- cold warm recovery: Existing submitted toasts remain visible. A later poll can recover from a settled error. A silent hang has no restart/fallback, and direct 1Click status is not used.

**Existing protections:** Toast queries are independent. Unavailable or unknown outcomes are not marked successful. Zod validates the response shape and terminal states are explicitly mapped.

**Recommended change:** Add complete monitoring-request deadlines and stale/sequence checks. Show monitoring unavailability with retry. Consider an independent onchain/direct 1Click fallback where its outcome can be trusted.

**Source:** [packages/utils/src/helpers/intentscan.ts:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/helpers/intentscan.ts#L1), [apps/main/src/modules/transactions/utils/toasts/intents.ts:26](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/utils/toasts/intents.ts#L26), [apps/main/src/modules/transactions/utils/toasts/processors.ts:299](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/utils/toasts/processors.ts#L299), [apps/main/src/modules/transactions/hooks/useProcessTransactionToasts.ts:66](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/hooks/useProcessTransactionToasts.ts#L66)

## Ocelloids cross-chain history HTTP + SSE

**Activation:** conditional. **Worst traced scope:** Connected-account history and tracking. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Cross-chain history, claimability and transaction follow-up. The root starts the subscription for a connected account, but its async failure does not establish a root React crash.

**Endpoints:** `https://api.ocelloids.net/query/crosschain`; `https://api.ocelloids.net/sse/crosschain/default?address={address}`

**Packages:** `@galacticcouncil/xc-scan 0.5.0`

**Deadline:** Initial fetch and body reads have no deadline. A hang prevents SSE setup and leaves history unloaded. Cleanup does not abort the HTTP load; a late response can start an old-address SSE subscription after unsubscribe, as tested. **Retry:** Warm query cache remains until updates arrive; a cold load has no history. Reconnection starts SSE without a proven HTTP backfill. Initial HTTP failure needs remount/account change. A late old-address response can mutate the global store and start another SSE stream. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: An initial rejection becomes an unhandled promise rejection and prevents SSE setup. The onError callback is only used by SSE. There is no automatic initial-load retry.
- hang: Initial fetch and body reads have no deadline. A hang prevents SSE setup and leaves history unloaded. Cleanup does not abort the HTTP load; a late response can start an old-address SSE subscription after unsubscribe, as tested.
- malformed: Malformed items rejects initial loading. Invalid SSE JSON throws directly in the event listener, as tested. Valid JSON with the wrong shape can enter the cache and affect downstream transforms.
- stale: EventSource reconnects natively; a closed stream has a five-second explicit retry. There is no heartbeat/maximum-age check or HTTP resync to fill a reconnect gap. Cached history can remain stale.
- cold warm recovery: Warm query cache remains until updates arrive; a cold load has no history. Reconnection starts SSE without a proven HTTP backfill. Initial HTTP failure needs remount/account change. A late old-address response can mutate the global store and start another SSE stream.

**Existing protections:** SSE errors are held in local state and closed streams retry after five seconds. Unsubscribe closes the current stream. Optimistic/query cache is retained. Root readiness does not await the subscription.

**Recommended change:** Catch subscribe errors and retry initial loading. Bound/cancel HTTP loading and guard results by subscription generation. Validate journeys and SSE payloads, backfill on reconnect, and expose unavailable/stale history.

**Source:** [apps/main/src/modules/xcm/history/xcScanStore.ts:7](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/xcScanStore.ts#L7), [apps/main/src/routes/__root.tsx:114](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/routes/__root.tsx#L114), [apps/main/src/modules/xcm/history/useXcScan.ts:61](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/useXcScan.ts#L61), [audit/crosschain-sources/xc-scan.mjs:205](https://unpkg.com/@galacticcouncil/xc-scan@0.5.0/build/index.mjs), [audit/crosschain-sources/xc-scan.mjs:38](https://unpkg.com/@galacticcouncil/xc-scan@0.5.0/build/index.mjs)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## Wormhole executor quote service

**Activation:** conditional. **Worst traced scope:** Selected NTT executor fee and call. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Selected Wormhole/Basejump NTT executor transfer fees and call preparation. It is separate from scan/history and root readiness.

**Endpoints:** `https://executor.labsapis.com/v0/quote`

**Packages:** `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/xc-sdk 2.5.0`

**Deadline:** Fetch and body reads have no deadline or signal. The tested body hang leaves the route/build pending. **Retry:** A warm, valid cached quote can allow progress. A new or expiring quote needs the service. The selected route is affected; no app-wide crash was demonstrated. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: An HTTP failure rejects the selected fee/build path, so the transfer cannot be prepared.
- hang: Fetch and body reads have no deadline or signal. The tested body hang leaves the route/build pending.
- malformed: The client requires truthy signedQuote and estimatedCost, then converts cost to BigInt. It accepts a nonempty invalid signedQuote in the tested fetch path; later contract/build validation was outside the test. A failed expiry decode prevents cache reuse.
- stale: A cached quote is reused only when its signed expiry is more than five minutes away. There is no fallback after it expires and the service is unavailable.
- cold warm recovery: A warm, valid cached quote can allow progress. A new or expiring quote needs the service. The selected route is affected; no app-wide crash was demonstrated.

**Existing protections:** HTTP status and missing fields are checked. Successful quotes have an expiry-aware cache.

**Recommended change:** Add complete-request deadlines and cancellation. Validate quote shape, chain, gas and expiry. Show the selected route as unavailable and offer an independent bridge where valid.

**Source:** [audit/crosschain-sources/xc-cfg.mjs:2866](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-cfg.mjs:3487](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-cfg.mjs:3608](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [audit/crosschain-sources/xc-cfg.mjs:4795](https://unpkg.com/@galacticcouncil/xc-cfg@2.7.0/build/index.mjs), [apps/main/src/modules/xcm/transfer/hooks/useSubmitXcmTransfer.ts:96](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/transfer/hooks/useSubmitXcmTransfer.ts#L96)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## Grafana historical lending rate SQL

**Activation:** active. **Worst traced scope:** Historical lending rate charts. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Charts/legacy order enrichment only.

**Endpoints:** `https://grafana.hydradx.cloud/api/ds/query (POST rawSql; datasourceId10)`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, even awaiting error text. **Retry:** React Query browser default 3 after rejection. **Cancellation:** React Query signal is consumed by tradeChart, reserveRate, dcaAmounts queryFns and passed to fetch, so unmount cancellation is available. **Cache:** Same query data cached no freshness badge. Historical rate query 5min, no upstream sample-age validation.

**Failure and recovery behavior:**

- dns: Rejected at query boundary.
- http404: NonOK error awaits response.text then throws.
- http429: Same; no Retry-After.
- http5xx: Same.
- request Hang: No deadline while mounted.
- body Hang: No deadline, even awaiting error text.
- malformed Json: Rejected within query.
- malformed Business Data: Direct data.results[refId].frames[0].data.values indexing; no runtime schema/numeric checks.
- stale: Historical rate query 5min, no upstream sample-age validation.
- warm: Same query data cached no freshness badge.
- recovery: Query lifecycle/focus and chart range changes; signal can cancel old observers.
- cold: Local chart error; live supply/borrow rates still Hydration.
- hang: Only chart loading unbounded.
- malformed: Rate filtering drops <=0; NaN not caught by that test (source inference).

**Existing protections:** React Query cancellation signal forwarded Local chart error handling or missing-enrichment fallback

**Recommended change:** Deadline including body Schema finite rawSql results Local stale/degraded chart display

**Source:** [apps/main/.env.production:4](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/.env.production#L4), [apps/main/src/api/grafana/fetchGrafana.ts:8](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/fetchGrafana.ts#L8), [apps/main/src/api/grafana/reserveRate.ts:45](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/reserveRate.ts#L45), [apps/main/src/modules/borrow/reserve/components/SupplyApyChart.tsx:23](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/reserve/components/SupplyApyChart.tsx#L23), [apps/main/src/modules/borrow/reserve/components/BorrowApyChart.tsx:23](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/reserve/components/BorrowApyChart.tsx#L23)

## Grafana historical trade price SQL

**Activation:** active. **Worst traced scope:** Fallback historical trade charts. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Charts/legacy order enrichment only.

**Endpoints:** `https://grafana.hydradx.cloud/api/ds/query (POST rawSql; datasourceId10)`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, even awaiting error text. **Retry:** React Query browser default 3 after rejection. **Cancellation:** React Query signal is consumed by tradeChart, reserveRate, dcaAmounts queryFns and passed to fetch, so unmount cancellation is available. **Cache:** Same-key query cache retained. Default staleTime 0; no upstream sample-age guard.

**Failure and recovery behavior:**

- dns: Rejected at query boundary.
- http404: NonOK error awaits response.text then throws.
- http429: Same; no Retry-After.
- http5xx: Same.
- request Hang: No deadline while mounted.
- body Hang: No deadline, even awaiting error text.
- malformed Json: Rejected within query.
- malformed Business Data: Direct data.results[refId].frames[0].data.values indexing; no runtime schema/numeric checks.
- warm: Cached result retained but error flags may hide it.
- recovery: Query lifecycle/focus and chart range changes; signal can cancel old observers.
- cold: Explicit chart error after reject; chain trade form remains usable.
- hang: Mounted chart can load forever; unmount abort works.
- malformed: Unexpected frame shape rejects in fetch transform; nonfinite rates can pass and affect chart.
- stale: Default staleTime 0; no maximum upstream sample-age validation. Five-minute policy belongs to the reserve-rate query only.

**Existing protections:** React Query cancellation signal forwarded Local chart error handling or missing-enrichment fallback

**Recommended change:** Deadline including body Schema finite rawSql results Local stale/degraded chart display

**Source:** [apps/main/.env.production:4](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/.env.production#L4), [apps/main/src/api/grafana/fetchGrafana.ts:8](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/fetchGrafana.ts#L8), [apps/main/src/api/grafana/tradeChart.ts:21](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/tradeChart.ts#L21), [apps/main/src/api/grafana/TradeChartApi.ts:110](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/TradeChartApi.ts#L110), [apps/main/src/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana.tsx:60](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana.tsx#L60)

## Grafana legacy DCA amount SQL

**Activation:** active. **Worst traced scope:** Legacy order amount enrichment. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Charts/legacy order enrichment only.

**Endpoints:** `https://grafana.hydradx.cloud/api/ds/query (POST rawSql; datasourceId10)`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, even awaiting error text. **Retry:** React Query browser default 3 after rejection. **Cancellation:** React Query signal is consumed by tradeChart, reserveRate, dcaAmounts queryFns and passed to fetch, so unmount cancellation is available. **Cache:** Same-key query cache retained. Default staleTime 0; no upstream sample-age guard.

**Failure and recovery behavior:**

- dns: Rejected at query boundary.
- http404: NonOK error awaits response.text then throws.
- http429: Same; no Retry-After.
- http5xx: Same.
- request Hang: No deadline while mounted.
- body Hang: No deadline, even awaiting error text.
- malformed Json: Rejected within query.
- malformed Business Data: Direct data.results[refId].frames[0].data.values indexing; no runtime schema/numeric checks.
- warm: Old enrichment cached.
- recovery: Query lifecycle/focus and chart range changes; signal can cancel old observers.
- cold: Enrichment missing, chain openorder remains.
- hang: Enrichment request remainsloading, does not block core chain row.
- malformed: Raw numeric SQL vectors unchecked, may fail Big math downstream.
- stale: Default staleTime 0; no maximum upstream sample-age validation. Five-minute policy belongs to the reserve-rate query only.

**Existing protections:** React Query cancellation signal forwarded Local chart error handling or missing-enrichment fallback

**Recommended change:** Deadline including body Schema finite rawSql results Local stale/degraded chart display

**Source:** [apps/main/.env.production:4](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/.env.production#L4), [apps/main/src/api/grafana/fetchGrafana.ts:8](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/fetchGrafana.ts#L8), [apps/main/src/api/grafana/dcaAmounts.ts:21](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/grafana/dcaAmounts.ts#L21), [apps/main/src/modules/trade/orders/lib/useDcaGrafanaEnrichment.ts:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/lib/useDcaGrafanaEnrichment.ts#L1)

## Legacy Hydration explorer GraphQL

**Activation:** active. **Worst traced scope:** Legacy history and recovered transaction tracking. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Historical orders/trades, farm flags, OTC original amounts and staking APR. Restored transaction toasts await indexed extrinsics even when a healthy Hydration receipt is already available.

**Endpoints:** `https://explorer.hydradx.cloud/graphql`; `https://3-explorer.lark.hydration.cloud/graphql (node3 lark RPC override)`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `graphql-request 7.4.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`; `graphql 16.13.2`

**Deadline:** No whole-operation deadline. No deadline. **Retry:** Browser React Query default 3 after rejection except outer transaction-toast retry=false; no retry until hang settles. **Cancellation:** Generated SDK accepts optional signal, but query wrappers/clients do not supply it. **Cache:** Successful same-key data remains cached; OTC uses staleTime=Infinity and has no source freshness guard. No common source indexed-block or sample-age check.

**Failure and recovery behavior:**

- dns: Rejected and caught by query boundary.
- http404: GraphQLClient throws HTTP/client error on completed response.
- http429: Same; no application Retry-After policy.
- http5xx: Same.
- request Hang: No deadline.
- body Hang: No deadline.
- malformed Json: Rejected inside transport.
- malformed Business Data: GraphQL envelope accepted without runtime validation of typed business data; tested valid envelope with invalid values and invalid accounts shape.
- stale: No common source indexed-block or sample-age check.
- warm: Successful same-key data remains cached; OTC uses staleTime=Infinity and has no source freshness guard.
- recovery: React Query stale focus/reconnect/remount; in-flight hang is never timed out.
- cold: Errors stay feature-local under ordinary rejection. Several history consumers suppress isError and display empty records.
- hang: Historical panels, staking APR or an individual restored toast remain pending. Toast queries run independently, so one does not serially block all others.
- malformed: GraphQL does not validate business values. Invalid numeric strings can throw later Big/BigInt transformations; staking validates some argument shapes but not numeric semantics.

**Existing protections:** Chain-backed current open orders and pool actions independent Per-toast queries Some staking event args zod shape validation

**Recommended change:** Determine transaction outcome from Hydration receipts/events; enrich metadata from indexer optionally. Validate runtime response shape and numeric semantics. Add signal and request/body deadline to every SDK query. Expose unavailable and stale history states.

**Source:** [apps/main/.env.production:2](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/.env.production#L2), [apps/main/src/api/indexer.ts:7](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/indexer.ts#L7), [packages/indexer/src/indexer/index.ts:12](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/indexer/index.ts#L12), [packages/indexer/src/indexer/trade-orders.ts:8](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/indexer/trade-orders.ts#L8), [packages/indexer/src/indexer/otc.ts:11](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/indexer/otc.ts#L11), [apps/main/src/api/farms.ts:169](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/farms.ts#L169), [apps/main/src/modules/staking/DashboardStats.data.ts:75](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/staking/DashboardStats.data.ts#L75), [apps/main/src/modules/transactions/utils/toasts/processors.ts:164](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/utils/toasts/processors.ts#L164), [apps/main/src/modules/transactions/hooks/useProcessTransactionToasts.ts:132](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/hooks/useProcessTransactionToasts.ts#L132)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## Neckwork DCA fills

**Activation:** active. **Worst traced scope:** DCA past execution history. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Order past executions only.

**Endpoints:** `https://hydration-api.neckwork.net/v1/dca/schedules/{id}/executions`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous pages remain in query memory; no freshness metadata. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous pages remain in query memory; no freshness metadata.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: No fills/error exposed as empty history; settled errors stop next-page traversal.
- hang: Panel pending indefinitely.
- malformed: Structural failures generally occur during query mapping; numeric fields still typed-only.

**Existing protections:** Maximum5 empty pages Stops on isError Chain order/cancel data independent

**Recommended change:** Local retry/error UI Deadline and numeric schema

**Source:** [packages/indexer/src/neckwork/dca.ts:153](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/dca.ts#L153), [apps/main/src/modules/trade/orders/TradeOrders/lib/usePastExecutionsData.ts:36](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/usePastExecutionsData.ts#L36)

## Neckwork DCA schedules

**Activation:** active. **Worst traced scope:** DCA history and collateral consent warning. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

History/enrichment; current DCA open-order list has chain source. Open-budget-DCA collateral warning currently relies solely on Neckwork successful response.

**Endpoints:** `https://hydration-api.neckwork.net/v1/dca/schedules?owner=...&status=...&assets=...&limit=...&offset=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@galacticcouncil/money-market 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Warm schedules may stale after new orders; no source-indexed-block check. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Warm schedules may stale after new orders; no source-indexed-block check.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: History errors look like no orders; rejected/pending schedule data skips DCA collateral warning and consent.
- hang: History loading indefinitely; collateral action does not wait, warning absent.
- malformed: Numeric schedule fields can escape query and throw in render enrichment.

**Existing protections:** Chain-based current orders remain available normally Page limits200 in collateral query

**Recommended change:** Use Hydration schedule query for collateral risk checks; preserve unknown state until authoritative check Explicit history failure view Validate numeric fields before cache

**Source:** [packages/indexer/src/neckwork/dca.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/dca.ts#L83), [apps/main/src/modules/trade/orders/TradeOrders/lib/useHistoryData.ts:36](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useHistoryData.ts#L36), [apps/main/src/modules/trade/orders/TradeOrders/lib/useDcaEnrichment.ts:73](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useDcaEnrichment.ts#L73), [packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx:74](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx#L74), [packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx:85](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx#L85), [packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx:169](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/components/transactions/collateral/CollateralChangeModalContent.tsx#L169)

## Neckwork Market trades

**Activation:** active. **Worst traced scope:** Past market trades table. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Past trades table only.

**Endpoints:** `https://hydration-api.neckwork.net/v1/trades?assets=...&limit=...&offset=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous same-key trades remain; market query polls30s. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous same-key trades remain; market query polls30s.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Error looks like empty history.
- hang: No bounded pending state.
- malformed: Bad successful amount fields can throw in render-time numeric conversion.

**Existing protections:** Chain swaps remain available

**Recommended change:** Error source badge and retry Runtime amount validation before cache Body and request deadline

**Source:** [packages/indexer/src/neckwork/trades.ts:84](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/trades.ts#L84), [apps/main/src/modules/trade/orders/TradeOrders/lib/useMarketTradesData.ts:20](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useMarketTradesData.ts#L20), [apps/main/src/modules/trade/orders/TradeOrders/lib/useMarketTradesData.ts:40](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useMarketTradesData.ts#L40)

## Neckwork Omnipool 24h volume

**Activation:** active. **Worst traced scope:** Omnipool volume and fee displays. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Liquidity volume/fees only; core reserve data and add/remove actions from Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/omnipool/volumes?period=24h`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: No metric or placeholder; some combined volume uses??0 and valid empty vault feed interpreted0.
- hang: Metric loading indefinite but pool reserve loading independent.
- malformed: Bad numeric strings survive mapped fields and can fail render Big math; bad structure map fails within query.

**Existing protections:** Separate metric loading from reserves/transactions

**Recommended change:** Use unknown instead of invented0; validate finite values Local optional-widget boundary Bound body/network requests

**Source:** [packages/indexer/src/neckwork/pools.ts:11](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L11), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:269](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L269)

## Neckwork Omnipool 30d fee APR

**Activation:** active. **Worst traced scope:** Omnipool LP APY estimates. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

LP APY/table estimates; chain supply/borrow/add/remove remain available.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/omnipool/yield?window=30d`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Pool fee yield unknown; lending LP missing fee component passed0 so total can undercount.
- hang: Stablepool yield query contributes to isLoading for all borrow APYs; one hang hides every aggregate APY.
- malformed: Number(invalid feeApyPerc) becomesNaN and may reach downstream Big; bad shape rejects in query.

**Existing protections:** Pool table comments/null handling preserve unknown yield Financial actions use chain data

**Recommended change:** Propagate missing LP rate as unknown component Progressive independent APYs Finite validation and bounded deadlines

**Source:** [packages/indexer/src/neckwork/pools.ts:47](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L47), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:273](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L273), [apps/main/src/modules/liquidity/components/AddLiquidity/AddLiquidityYield.tsx:35](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/AddLiquidity/AddLiquidityYield.tsx#L35)

## Neckwork Routed account trades

**Activation:** active. **Worst traced scope:** Past routed trades table. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Past trades table only.

**Endpoints:** `https://hydration-api.neckwork.net/v1/trades/routed?participant=...&assets=...&limit=...&offset=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous same-key trades remain; market query polls30s. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous same-key trades remain; market query polls30s.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Error looks like empty history.
- hang: No bounded pending state.
- malformed: Bad successful amount fields can throw in render-time numeric conversion.

**Existing protections:** Chain swaps remain available

**Recommended change:** Error source badge and retry Runtime amount validation before cache Body and request deadline

**Source:** [packages/indexer/src/neckwork/trades.ts:42](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/trades.ts#L42), [apps/main/src/modules/trade/orders/TradeOrders/lib/useRoutedTradesData.ts:28](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useRoutedTradesData.ts#L28), [apps/main/src/modules/trade/orders/TradeOrders/lib/useRoutedTradesData.ts:49](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useRoutedTradesData.ts#L49)

## Neckwork Stablepool 24h volume

**Activation:** active. **Worst traced scope:** Stablepool volume and fee displays. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Liquidity volume/fees only; core reserve data and add/remove actions from Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/stableswap/volumes?period=24h`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: No metric or placeholder; some combined volume uses??0 and valid empty vault feed interpreted0.
- hang: Metric loading indefinite but pool reserve loading independent.
- malformed: Bad numeric strings survive mapped fields and can fail render Big math; bad structure map fails within query.

**Existing protections:** Separate metric loading from reserves/transactions

**Recommended change:** Use unknown instead of invented0; validate finite values Local optional-widget boundary Bound body/network requests

**Source:** [packages/indexer/src/neckwork/pools.ts:29](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L29), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:150](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L150)

## Neckwork Stablepool 30d fee APR/APY

**Activation:** active. **Worst traced scope:** Stablepool yield and money-market aggregate APYs. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

LP APY/table estimates; chain supply/borrow/add/remove remain available.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/stableswap/yield?window=30d`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Pool fee yield unknown; lending LP missing fee component passed0 so total can undercount.
- hang: Stablepool yield query contributes to isLoading for all borrow APYs; one hang hides every aggregate APY.
- malformed: Number(invalid feeApyPerc) becomesNaN and may reach downstream Big; bad shape rejects in query.

**Existing protections:** Pool table comments/null handling preserve unknown yield Financial actions use chain data

**Recommended change:** Propagate missing LP rate as unknown component Progressive independent APYs Finite validation and bounded deadlines

**Source:** [packages/indexer/src/neckwork/pools.ts:65](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L65), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:154](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L154), [apps/main/src/modules/liquidity/components/AddLiquidity/AddLiquidityYield.tsx:44](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/AddLiquidity/AddLiquidityYield.tsx#L44), [apps/main/src/api/borrow/hooks.ts:75](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/hooks.ts#L75), [apps/main/src/api/borrow/hooks.ts:150](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/hooks.ts#L150), [apps/main/src/modules/borrow/hooks/useExternalApyData.ts:13](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/hooks/useExternalApyData.ts#L13), [apps/main/src/modules/borrow/context/ApyContext.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/context/ApyContext.tsx#L25), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:203](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L203), [apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx:466](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx#L466), [apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts:144](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts#L144)

## Neckwork UniswapV3 24h volume and fees

**Activation:** active. **Worst traced scope:** V3 volume and fee displays. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Liquidity volume/fees only; core reserve data and add/remove actions from Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/uniswapv3/volumes?period=24h`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: No metric or placeholder; some combined volume uses??0 and valid empty vault feed interpreted0.
- hang: Metric loading indefinite but pool reserve loading independent.
- malformed: Bad numeric strings survive mapped fields and can fail render Big math; bad structure map fails within query.

**Existing protections:** Separate metric loading from reserves/transactions

**Recommended change:** Use unknown instead of invented0; validate finite values Local optional-widget boundary Bound body/network requests

**Source:** [packages/indexer/src/neckwork/pools.ts:104](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L104), [apps/main/src/modules/liquidity/Vaults.utils.ts:53](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Vaults.utils.ts#L53), [apps/main/src/modules/liquidity/Vaults.utils.ts:123](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Vaults.utils.ts#L123)

## Neckwork XYK 24h volume

**Activation:** active. **Worst traced scope:** XYK volume and fee displays. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Liquidity volume/fees only; core reserve data and add/remove actions from Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/v1/pools/xyk/volumes?period=24h`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached metrics remain, no source-age badge. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached metrics remain, no source-age badge.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: No metric or placeholder; some combined volume uses??0 and valid empty vault feed interpreted0.
- hang: Metric loading indefinite but pool reserve loading independent.
- malformed: Bad numeric strings survive mapped fields and can fail render Big math; bad structure map fails within query.

**Existing protections:** Separate metric loading from reserves/transactions

**Recommended change:** Use unknown instead of invented0; validate finite values Local optional-widget boundary Bound body/network requests

**Source:** [packages/indexer/src/neckwork/pools.ts:84](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/pools.ts#L84), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:494](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L494)

## Neckwork account USD balances

**Activation:** active. **Worst traced scope:** Wallet account USD values. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Wallet account valuation; portfolio live balances use chain sources separately. All batch valuations wait for slowest batch; wallet account rows do not wait.

**Endpoints:** `https://hydration-api.neckwork.net/v1/accounts/balances?accounts={comma-separated-public-keys}`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/web3-connect 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Effect can overwrite previously stored wallet USD balances with0 for missing failed batches. No indexed block-age check.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: No indexed block-age check.
- warm: Effect can overwrite previously stored wallet USD balances with0 for missing failed batches.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Rejected batches settle to zero in combined map; entire display loading while any hangs.
- malformed: Number of bad numeric strings becomesNaN (no finite guard); no global provider throw identified for this response.

**Existing protections:** Account rows and selection independent of balance loading Multisig chip uses undefined when no result

**Recommended change:** Represent unavailable as unknown; preserve individually successful batches Apply per-batch deadlines and timestamps Validate finite numeric conversions

**Source:** [packages/indexer/src/neckwork/accounts.ts:17](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/accounts.ts#L17), [packages/web3-connect/src/components/content/AccountSelectContent.utils.ts:78](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/components/content/AccountSelectContent.utils.ts#L78), [packages/web3-connect/src/components/content/AccountSelectContent.utils.ts:108](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/components/content/AccountSelectContent.utils.ts#L108), [packages/web3-connect/src/components/account/AccountMultisigOption.tsx:35](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/components/account/AccountMultisigOption.tsx#L35)

## Neckwork historical pair prices, reference and tail

**Activation:** active. **Worst traced scope:** Trade and cross-chain charts. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Trade/XC charts; swap route and chain quotes remain usable. Legacy Grafana only health dead/fork, not an individual route failure.

**Endpoints:** `https://hydration-api.neckwork.net/v1/prices/pair?assetIn=...&assetOut=...&bucket=...&from=...&to=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Chain spot can extend existing confirmed history; isError on history may hide chart; tail error is not included in same error flag. No source candle-age/block-lag validation; chain synthetic last-point coverage depends on retained history.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: No source candle-age/block-lag validation; chain synthetic last-point coverage depends on retained history.
- warm: Chain spot can extend existing confirmed history; isError on history may hide chart; tail error is not included in same error flag.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Primary history error shows chart error; healthy chain spot alone cannot seed first confirmed candle.
- hang: History remains loading; chart controls/form remain independent.
- malformed: NaN OHLC accepted as query data; some downstream math/charts may reject (inference).

**Existing protections:** Tail resampling/poll60s Chain spot guard catch Window-page cap and dedup merge Legacy Grafana when health dead/fork

**Recommended change:** Bound history and tail requests Per-resource fallback to legacy or honest chain spot seed Finite OHLC/time validation and source-age indicators

**Source:** [packages/indexer/src/neckwork/prices.ts:55](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/prices.ts#L55), [packages/indexer/src/neckwork/prices.ts:223](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/prices.ts#L223), [packages/indexer/src/neckwork/prices.ts:258](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/prices.ts#L258), [packages/indexer/src/neckwork/prices.ts:304](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/prices.ts#L304), [apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts:141](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts#L141), [apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts:167](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts#L167), [apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts:217](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries.ts#L217), [apps/main/src/modules/trade/swap/components/XcSwapChart/XcSwapChart.data.ts:111](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/components/XcSwapChart/XcSwapChart.data.ts#L111)

## Neckwork intent fill events

**Activation:** active. **Worst traced scope:** Past intent fill events. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Intent past executions only.

**Endpoints:** `https://hydration-api.neckwork.net/v1/intents/{id}/events`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Cached pages remain. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Cached pages remain.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Failure looks like no fills; initial error not exposed.
- hang: Panel remains loading.
- malformed: Typed-only amounts/timestamps can pass to downstream rows.

**Existing protections:** Max5 empty page traversal Stops following error

**Recommended change:** Explicit failure/retry state Deadline and finite/integer schema

**Source:** [packages/indexer/src/neckwork/intents.ts:186](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/intents.ts#L186), [apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentPastExecutionsData.ts:49](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentPastExecutionsData.ts#L49)

## Neckwork intent history and enrichment

**Activation:** active. **Worst traced scope:** Intent history and past fill enrichment. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Past intent history/fill enrichment, open order state chain-backed.

**Endpoints:** `https://hydration-api.neckwork.net/v1/intents?owner=...&status=...&kind=...&assets=...&limit=...&offset=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Same-key cached history remains. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Same-key cached history remains.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Settled failures appear as empty history/default enrichment.
- hang: History loading indefinitely.
- malformed: HTTP200 invalid integer strings cause render-time BigInt exception and trade page error boundary.

**Existing protections:** Normal query error does not throw into global provider

**Recommended change:** Validate int strings/ids before cache Keep failed enrichment local and chain row visible Explicit source error + deadline

**Source:** [packages/indexer/src/neckwork/intents.ts:101](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/intents.ts#L101), [apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentEnrichment.ts:35](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentEnrichment.ts#L35), [apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentEnrichment.ts:51](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/TradeOrders/lib/useIntentEnrichment.ts#L51), [apps/main/src/modules/trade/orders/lib/buildOrderRows.ts:625](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/orders/lib/buildOrderRows.ts#L625)

## Neckwork money-market history

**Activation:** active. **Worst traced scope:** Lending history can appear empty on failure. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Borrow history only; market financial data from Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/v1/accounts/{account}/money-market-events?events=...&search=...&limit=...&offset=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous page held while paging via keepPreviousData. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: Previous page held while paging via keepPreviousData.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Settled error gives undefined/empty history; no explicit failure state.
- hang: History loading indefinite.
- malformed: Invalid timestamp succeeds select, then toISOString RangeError in page render.

**Existing protections:** History separated from lending action data keepPreviousData

**Recommended change:** Validate finite valid date within query Expose error and locally isolate table Deadline

**Source:** [packages/indexer/src/neckwork/money-market.ts:39](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/money-market.ts#L39), [apps/main/src/api/borrow/moneyMarketEvents.ts:72](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/moneyMarketEvents.ts#L72), [apps/main/src/api/borrow/moneyMarketEvents.ts:51](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/moneyMarketEvents.ts#L51), [apps/main/src/modules/borrow/history/BorrowHistoryTable.utils.ts:23](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/history/BorrowHistoryTable.utils.ts#L23)

## Reown embedded auth and authentication APIs

**Activation:** conditional. **Worst traced scope:** Conditional embedded auth readiness. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

AppKit email/social login and optional ReownAuthentication SIWX. Activation depends on remote features; it does not automatically apply to native wallets or main browsing.

**Endpoints:** `https://secure.walletconnect.org/sdk`; `https://api.web3modal.org/auth/v1/nonce`; `https://api.web3modal.org/auth/v1/authenticate`; `https://api.web3modal.org/auth/v1/me`; `https://api.web3modal.org/auth/v1/otp`; `https://api.web3modal.org/auth/v1/account-metadata`

**Packages:** `@reown/appkit 1.8.19`; `@reown/appkit-wallet 1.8.19`; `@reown/appkit-controllers 1.8.19`

**Deadline:** The tested 20-second iframe load timer alerts and aborts its controller, but the await on frameLoadPromise remains pending. Selected auth requests also have 120-second alerts; complete promise cancellation needs separate verification. Authentication HTTP/body reads are unbounded. **Retry:** A frame that never emits READY remains pending after the 20-second alert. A real iframe error or READY event settles it. No global crash was established; shared account hiding applies if a WalletConnect flow waits for an affected operation. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Iframe onerror rejects loading. Authentication HTTP failures throw; getSessions catches and returns [].
- hang: The tested 20-second iframe load timer alerts and aborts its controller, but the await on frameLoadPromise remains pending. Selected auth requests also have 120-second alerts; complete promise cancellation needs separate verification. Authentication HTTP/body reads are unbounded.
- malformed: Frame events are checked with safeParse and ignored if invalid. Invalid JWT payloads can reject an authentication session.
- stale: Persisted sessions/tokens require a me check on restoration. Cloud feature settings control activation.
- cold warm recovery: A frame that never emits READY remains pending after the 20-second alert. A real iframe error or READY event settles it. No global crash was established; shared account hiding applies if a WalletConnect flow waits for an affected operation.

**Existing protections:** Iframe onerror rejects loading. Frame events have schema checks. Timeout alerts and authentication-session fallback exist.

**Recommended change:** Race/reject frameLoadPromise on the load deadline. Connect timeout cancellation to rejection of the actual pending promises. Bound complete HTTP requests and locally disable unused embedded authentication.

**Source:** [node_modules/@reown/appkit/dist/esm/src/client/appkit.js:265](https://unpkg.com/@reown/appkit@1.8.19/dist/esm/src/client/appkit.js), [node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrameConstants.js:1](https://unpkg.com/@reown/appkit-wallet@1.8.19/dist/esm/src/W3mFrameConstants.js), [node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrame.js:134](https://unpkg.com/@reown/appkit-wallet@1.8.19/dist/esm/src/W3mFrame.js), [node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrameProvider.js:525](https://unpkg.com/@reown/appkit-wallet@1.8.19/dist/esm/src/W3mFrameProvider.js), [node_modules/@reown/appkit-controllers/dist/esm/src/features/siwx/reown-authentication/ReownAuthentication.js:164](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/features/siwx/reown-authentication/ReownAuthentication.js)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## Reown hosted blockchain RPC/bundler

**Activation:** conditional. **Worst traced scope:** WalletConnect RPC and optional bundler. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

WalletConnect read providers and optional bundler flows. They are separate from XCM explicit EVM RPCs and the core Hydration transport.

**Endpoints:** `https://rpc.walletconnect.org/v1/?chainId={caip}&projectId={id}`; `https://rpc.walletconnect.org/v1/bundler`

**Packages:** `@reown/appkit-utils 1.8.19`; `@walletconnect/universal-provider 2.23.7`; `@walletconnect/jsonrpc-http-connection 1.0.8`

**Deadline:** HTTP registration ping, requests and body reads have no deadline/signal. A selected WalletConnect RPC operation can hang. **Retry:** A stored session still needs RPC reads. AppKit preserves the original chainDefault URL, but that does not provide automatic fallback for default.http. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: The HTTP transport catches failures and emits JSON-RPC errors. No main UI root failure was established.
- hang: HTTP registration ping, requests and body reads have no deadline/signal. A selected WalletConnect RPC operation can hang.
- malformed: The transport uses safe JSON handling but has no HTTP status guard. RPC result handling varies.
- stale: There is no block-progress/freshness guard. Supported EVM networks share the Reown provider.
- cold warm recovery: A stored session still needs RPC reads. AppKit preserves the original chainDefault URL, but that does not provide automatic fallback for default.http.

**Existing protections:** UniversalProvider supports an explicit RPC map override. AppKit preserves chainDefault metadata.

**Recommended change:** Provide an independent explicit RPC map and complete-request deadlines. Do not await optional WalletConnect RPC reads in the native account selector. Verify that configured fallback is actually used.

**Source:** [node_modules/@reown/appkit-utils/dist/esm/src/CaipNetworkUtil.js:128](https://unpkg.com/@reown/appkit-utils@1.8.19/dist/esm/src/CaipNetworkUtil.js), [audit/crosschain-sources/walletconnect-universal-provider.js:382](https://unpkg.com/@walletconnect/universal-provider@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-jsonrpc-http-connection.js:72](https://unpkg.com/@walletconnect/jsonrpc-http-connection@1.0.8/dist/index.es.js), [packages/web3-connect/src/wallets/ReownWalletConnect/utils.ts:17](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/ReownWalletConnect/utils.ts#L17)

## Reown optional swap/onramp/pay/exchange APIs

**Activation:** conditional. **Worst traced scope:** Conditional Reown commercial modal features. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional commercial flows in the Reown modal. Hydration swap products use SDK/1Click paths independently.

**Endpoints:** `https://rpc.walletconnect.org/v1/convert/{quotes,tokens,allowance,gas-price,build-transaction,build-approve}`; `https://rpc.walletconnect.org/v1/onramp/{options,quote}`; `https://rpc.walletconnect.org/v1/generators/onrampurl`; `https://rpc.walletconnect.org/v1/json-rpc`; `https://api.web3modal.org/appkit/v1/transfers/{quote,status,assets/exchanges/{id}}`; `https://meldcrypto.com`

**Packages:** `@reown/appkit 1.8.19`; `@reown/appkit-controllers 1.8.19`; `@reown/appkit-pay 1.8.19`

**Deadline:** Raw fetch and FetchUtil body reads have no deadline. Optional views can remain loading. Their payment quote/status APIs are separate from Hydration cross-chain 1Click. **Retry:** Remote configuration may enable these surfaces in the future. Conditional features should not be counted as unconditional current startup dependencies. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Feature controllers use local errors, snacks or defaults with varying policies. No fatal root failure was established.
- hang: Raw fetch and FetchUtil body reads have no deadline. Optional views can remain loading. Their payment quote/status APIs are separate from Hydration cross-chain 1Click.
- malformed: JSON-RPC errors are checked, but HTTP status/schema checks are incomplete. Wrong data can reject a local view.
- stale: Caching and polling vary by feature; there is no central freshness/deadline policy.
- cold warm recovery: Remote configuration may enable these surfaces in the future. Conditional features should not be counted as unconditional current startup dependencies.

**Existing protections:** UI imports are gated by features. Controllers use try/catch/finally. These flows require user choice.

**Recommended change:** Explicitly disable unused optional features locally. Add view error boundaries, request deadlines and cancellation. Do not share optional loading state with healthy wallet accounts.

**Source:** [node_modules/@reown/appkit/dist/esm/src/client/appkit.js:507](https://unpkg.com/@reown/appkit@1.8.19/dist/esm/src/client/appkit.js), [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/BlockchainApiController.js:196](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/BlockchainApiController.js), [node_modules/@reown/appkit-controllers/dist/esm/src/utils/ExchangeUtil.js:23](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/utils/ExchangeUtil.js), [node_modules/@reown/appkit-pay/dist/esm/src/utils/ApiUtil.js:35](https://unpkg.com/@reown/appkit-pay@1.8.19/dist/esm/src/utils/ApiUtil.js), [node_modules/@reown/appkit-controllers/dist/esm/src/utils/ConstantsUtil.js:10](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/utils/ConstantsUtil.js)

## WalletConnect verification/attestation

**Activation:** conditional. **Worst traced scope:** WalletConnect origin verification. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Conditional WalletConnect request/pairing origin verification. It is not a global UI readiness dependency.

**Endpoints:** `https://verify.walletconnect.org/attestation/{hash}?v2Supported=true`; `https://verify.walletconnect.org/v3/attestation`; `https://verify.walletconnect.org/v3/public-key`; `https://verify.walletconnect.com`

**Packages:** `@walletconnect/core 2.23.7`; `@walletconnect/sign-client 2.23.7`

**Deadline:** Header fetches have five/ten-second abort timers, but those timers are cleared before JSON body reads. A body can therefore hang. Higher protocol handlers contain many errors; no global outage was established. **Retry:** A cached key reduces the cold-start dependency. An outage can affect WalletConnect flows. The current UI has no explicit overall enable deadline. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Registration/public-key failures are caught or logged. An unverifiable attestation is not represented as verified.
- hang: Header fetches have five/ten-second abort timers, but those timers are cleared before JSON body reads. A body can therefore hang. Higher protocol handlers contain many errors; no global outage was established.
- malformed: Attestation JWT parsing/validation can fail, then warn or remain unverified. There is no shared Zod schema for all response bodies.
- stale: Cached public keys have expiry handling. Verification origin metadata is separate from trust in Hydration RPC.
- cold warm recovery: A cached key reduces the cold-start dependency. An outage can affect WalletConnect flows. The current UI has no explicit overall enable deadline.

**Existing protections:** Header abort timers exist. Verify URLs are restricted to trusted origins. Public keys are cached, and failures have catches/warnings.

**Recommended change:** Bound body consumption as well as headers. Keep an explicit unverified state and avoid blocking native-wallet account selection.

**Source:** [audit/crosschain-sources/walletconnect-core.js:214](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:3820](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:3891](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:3912](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js)

## DeFiLlama yield APYs

**Activation:** active. **Worst traced scope:** Aggregate yield and unknown-to-zero display. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

External yield components, APY displays and user net APY. Core Aave reserves/actions use Hydration. Any APY or stablepool-yield request still loading hides all aggregate APY results.

**Endpoints:** `https://hydration-api.neckwork.net/proxy/defillama/yields/chart/{poolId}`

**Packages:** `@galacticcouncil/main 0.0.0 (workspace)`; `@galacticcouncil/money-market 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `bignumber.js 9.3.1`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`; `zustand 5.0.12`

**Deadline:** No whole-operation deadline. Same; unbounded response.json. **Retry:** Fetch/cache helper catches thrown errors and resolves cached number or null. React Query therefore sees success and does not retry; Kamino additionally retry=0. **Cancellation:** Bare fetch; no React Query signal passed. **Cache:** Persisted value received within seven days is reused only after fetch rejects; no stale label. Last sample timestamp is not checked. A successful old sample resets receipt-based cache TTL.

**Failure and recovery behavior:**

- dns: Cold => null; warm <=7day receipt-age entry => last cached APY; older => null.
- http404: HTTP nonOK throws into cache fallback/null.
- http429: Same; no Retry-After handling.
- http5xx: Same.
- request Hang: Cache fallback is attempted only after fetch rejects; a hung request never reaches it.
- body Hang: Same; unbounded response.json.
- malformed Json: Caught, uses TTL fallback/null.
- stale: Last sample timestamp is not checked. A successful old sample resets receipt-based cache TTL.
- warm: Persisted value received within seven days is reused only after fetch rejects; no stale label.
- recovery: Queries resolve null/cached on errors; next stale focus/reconnect/remount can fetch again; no periodic interval. Cache expiry checked only on catch, not on mounted display.
- cold: Thrown outage returns null: main APY/net APY preserve unknown, but non-PRIME supply modal reserve selectors convert null to zero. A valid empty feed returns and caches zero.
- hang: One source can keep every aggregate external APY loading, even with a warm persisted fallback.
- malformed: Number/schema violations are caught and use cached fallback or null. Empty data is schema-valid and becomes zero.
- Malformed business data: APY fields require numbers; wrong shape/type rejects into cached fallback or null. Empty history is accepted as cached zero. No upstream sample-age validation.

**Existing protections:** Persistent fallback within seven days on thrown errors. Main APY table, breakdown and user net APY preserve null as unknown. Core lending contract reads and actions use Hydration.

**Recommended change:** Bound fetch and body; expose warm fallback immediately with its age. Render each asset APY independently. Validate source timestamp and distinguish empty from zero. Carry value/status/source timestamp metadata through modal selectors.

**Source:** [apps/main/src/states/externalApy.ts:27](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L27), [apps/main/src/states/externalApy.ts:41](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L41), [apps/main/src/states/externalApy.ts:61](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/externalApy.ts#L61), [apps/main/src/api/external/defillama.ts:29](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/defillama.ts#L29), [apps/main/src/api/external/defillama.ts:45](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/defillama.ts#L45), [apps/main/src/api/external/defillama.ts:54](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/defillama.ts#L54), [apps/main/src/api/borrow/queries.ts:977](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/queries.ts#L977), [apps/main/src/api/borrow/hooks.ts:107](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/hooks.ts#L107), [packages/money-market/src/store/poolSelectors.ts:201](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/store/poolSelectors.ts#L201), [apps/main/src/modules/borrow/hooks/useExternalApyData.ts:13](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/hooks/useExternalApyData.ts#L13), [apps/main/src/modules/borrow/context/ApyContext.tsx:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/context/ApyContext.tsx#L25), [apps/main/src/modules/liquidity/Liquidity.utils.tsx:203](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/Liquidity.utils.tsx#L203), [apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx:466](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx#L466), [apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts:144](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils.ts#L144)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## Hardcoded Neckwork GIGA APR

**Activation:** active. **Worst traced scope:** GIGA APR display. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

GIGA APR display only.

**Endpoints:** `https://hydration-api.neckwork.net/v1/staking/gigahdx/apr`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** React Query same-key cache retained; no freshness indicator unless noted. Query stale1h/gc1day, sample source freshness absent.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: React Query same-key cache retained; no freshness indicator unless noted.
- recovery: Query lifecycle only unless explicit interval noted.
- dns: Default browser retries then undefined APR/dash; no error surfaced by hook.
- http404: res.ok checked -> thrown then retries.
- http429: Same.
- http5xx: Same.
- hang: APR loading forever.
- malformed: JSON/schema reject in query; numeric string semantics not validated.
- stale: Query stale1h/gc1day, sample source freshness absent.

**Existing protections:** APR absent rendered dash GIGA chain actions independent

**Recommended change:** Use configured endpoint Finite APR schema Bound fetch+body and expose stale indicator

**Source:** [apps/main/src/api/gigaApr.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/gigaApr.ts#L18), [apps/main/src/api/gigaApr.ts:32](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/gigaApr.ts#L32), [apps/main/src/modules/staking/gigaStaking/GigaStakeTotalsHeader.tsx:47](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/staking/gigaStaking/GigaStakeTotalsHeader.tsx#L47)

## Subsquare account vote history proxy

**Activation:** active. **Worst traced scope:** Vote-dependent unlock and independent GIGA unlock. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Native unlock calculation when the account has an OpenGov lock; unrelated GIGA unlock calculation is sequenced after this same dependency. Historical removed-vote conviction locks require history. An empty-list fallback may overstate unlockable funds. Other governance, voting and GIGA staking actions use Hydration.

**Endpoints:** `https://hydration-api.neckwork.net/proxy/subsquare/users/{address}/referenda/votes?page_size=100&includes_title=1`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** Nested ensureQueryData can reuse cached vote history; no indexed-block freshness check. Only page_size=100 requested; there is no pagination or source-block age validation.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: Nested ensureQueryData can reuse cached vote history; no indexed-block freshness check.
- recovery: Query lifecycle only unless explicit interval noted.
- dns: Default retries then error; combined unlock hook returns default zero and empty lists without isError. Independent GIGA calculation is skipped.
- http404: No response.ok check. Error-shaped body rejects; a shaped votes body is accepted despite status.
- http429: Same; no Retry-After handling.
- http5xx: Same.
- hang: Combined unlock calculation stays pending without a deadline.
- malformed: Object shape is validated, but conviction uses z.custom without validation and balances are arbitrary strings. Invalid BigInt conversion rejects combined query.
- stale: Only page_size=100 requested; there is no pagination or source-block age validation.

**Existing protections:** Vote response object shape is validated. Voting and referendum reads/actions remain independently chain-backed.

**Recommended change:** Calculate independent GIGA unlocks even when historical vote source is unavailable. Expose unknown historical unlockability rather than silently returning zero or using empty votes. Add request/body deadline. Validate conviction, integer balances and source block; paginate if necessary.

**Source:** [apps/main/src/api/neckwork.ts:5](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/neckwork.ts#L5), [apps/main/src/api/external/subsquare.ts:7](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/subsquare.ts#L7), [apps/main/src/api/external/subsquare.ts:47](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/external/subsquare.ts#L47), [apps/main/src/api/democracy.ts:342](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/democracy.ts#L342), [apps/main/src/api/locks.ts:47](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/locks.ts#L47), [apps/main/src/api/locks.ts:127](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/locks.ts#L127)

## Bundled typed runtime descriptors and metadata cache

**Activation:** active. **Worst traced scope:** Typed Hydration runtime access. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Typed descriptor values required; known metadata-byte cache optional because getMetadata returns null on miss/import failure.

**Endpoints:** `same-origin descriptor/metadata split chunks`; `Hydration runtime metadata over shared RPC on cache miss`

**Packages:** `@galacticcouncil/descriptors 2.9.0`; `polkadot-api 2.2.2`; `@galacticcouncil/common 1.2.0`

**Deadline:** Imported module promise can remain pending on app-host hang; no application deadline. **Retry:** RPC metadata fallback for unknown/unavailable cached metadata; dynamic descriptor import failure retains same rejected module promise until document refresh; global preload handler may force reload. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: No independent remote descriptor registry at runtime. Bundler serves dynamic descriptor/metadata imports from application host. Unknown codeHash or cached-metadata import failure returns null for chain-fetch path.
- hang: Imported module promise can remain pending on app-host hang; no application deadline.
- malformed stale: Descriptor/runtime incompatibility can reject typed chain calls even with reachable node; byte caches keyed by codeHash avoid silently using wrong runtime.
- recovery: RPC metadata fallback for unknown/unavailable cached metadata; dynamic descriptor import failure retains same rejected module promise until document refresh; global preload handler may force reload.

**Existing protections:** Code-hash metadata lookup; cache exceptions return null. Separate hydration/current-next-ice descriptors.

**Recommended change:** Retain availability for optional incompatible runtime capabilities; handle essential split-chunk failures explicitly and serve deploy-overlap chunks.

**Source:** [node_modules/@galacticcouncil/descriptors/build/index.js:17](https://unpkg.com/@galacticcouncil/descriptors@2.9.0/build/index.js), [node_modules/@galacticcouncil/descriptors/build/index.js:23](https://unpkg.com/@galacticcouncil/descriptors@2.9.0/build/index.js), [node_modules/@galacticcouncil/descriptors/build/index.js:139](https://unpkg.com/@galacticcouncil/descriptors@2.9.0/build/index.js), [apps/main/src/api/rpcClient.ts:70](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L70)

## Gamma vault share filtering and V3 bootstrap

**Activation:** active. **Worst traced scope:** Gamma and V3 registry reads. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Symbol discovery is awaited inside required asset registry; read failures soften to null, hangs delay registry. Bootstrap V3 reads are feature-query work.

**Endpoints:** `Gamma contracts on Hydration EVM`

**Packages:** `@galacticcouncil/main 0.0.0`; `viem 2.56.8`

**Deadline:** No explicit deadline around symbol or bootstrap readContract; custom transport can wait. **Retry:** Initial assets staleTimeInfinity; endpoint-specific contract mapping. V3 query polls60s/stale30s. Symbols not independently retried after soft failure. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Contract method rejections swallowed for symbol filtering. Bootstrap rejection is local useV3Pools query error. Same Hydration evm transport, not Gamma-hosted HTTP API.
- hang: No explicit deadline around symbol or bootstrap readContract; custom transport can wait.
- malformed stale: Symbol non-string can throw during toLowerCase; wrong deployed address returns ABI/revert failures. Missing filter data can retain ERC20 vault share tokens that should be excluded.
- recovery: Initial assets staleTimeInfinity; endpoint-specific contract mapping. V3 query polls60s/stale30s. Symbols not independently retried after soft failure.

**Existing protections:** Per-symbol discovery catches contract rejection; zero-address ignored; configured mainnet/lark4 addresses.

**Recommended change:** Decouple vault-share enrichment from general registry; validate symbol strings and preserve conservative identification; bound contract calls.

**Source:** [apps/main/src/api/assets.ts:169](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/assets.ts#L169), [apps/main/src/api/assets.ts:119](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/assets.ts#L119), [apps/main/src/api/gamma/config.ts:11](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/gamma/config.ts#L11), [apps/main/src/api/pools.ts:149](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/pools.ts#L149), [apps/main/src/api/gamma/v3Bootstrap.ts:55](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/gamma/v3Bootstrap.ts#L55)

## Hydration EVM custom transport and contract data

**Activation:** active. **Worst traced scope:** Hydration EVM reads over shared papi. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Shared primary-chain dependency; contract failures are capability failures, not independent EVM service outages.

**Endpoints:** `shared Hydration WS _request eth_*`; `Hydration EthereumRuntimeRPCApi.call`

**Packages:** `viem 2.56.8`; `@galacticcouncil/sdk-next 2.3.2`; `@galacticcouncil/main 0.0.0`

**Deadline:** custom transport has no supplied timeout. Default retryCount3/retryDelay150ms concerns rejections, not never-settling requests. Pool QueryCache wraps many SDK calls15s; direct UI contract reads lack that wrapper. **Retry:** Custom request retries retryable errors; chain endpoint switching improves transport; local ordinary queries can refetch; boot aggregate contract errors can escalate. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: No third-party HTTP RPC is used for core custom transport; errors from shared client become query/contract failures.
- hang: custom transport has no supplied timeout. Default retryCount3/retryDelay150ms concerns rejections, not never-settling requests. Pool QueryCache wraps many SDK calls15s; direct UI contract reads lack that wrapper.
- malformed stale: ABI/type decoding failures reject per call. RPC provider identity does not validate each EVM contract capability.
- recovery: Custom request retries retryable errors; chain endpoint switching improves transport; local ordinary queries can refetch; boot aggregate contract errors can escalate.

**Existing protections:** Primary RPC pool; viem retries retryable errors; typed ABI decoding; many SDK scoped timeouts.

**Recommended change:** Use capability-specific unavailable states and full operation deadlines for direct optional contract calls; avoid silent financial defaults.

**Source:** [apps/main/src/api/rpcClient.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L83), [audit/sdk-next-readable.mjs:740](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:1273](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [node_modules/viem/_esm/clients/transports/createTransport.js:6](https://unpkg.com/viem@2.56.8/_esm/clients/transports/createTransport.js), [node_modules/viem/_esm/clients/transports/custom.js:11](https://unpkg.com/viem@2.56.8/_esm/clients/transports/custom.js)

**Fault evidence:** [deep-startup-faults.results.json#viem_custom_shared_papi_hang_has_no_deadline](evidence/deep-startup-faults.results.json)

## Hydration HTTP endpoint discovery

**Activation:** active. **Worst traced scope:** HTTP ranking currently gates WS boot. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Currently mandatory before any RouterProvider render when autoMode enabled; WS connectivity is not attempted if all probes fail.

**Endpoints:** `https://hydration-rpc.n.dwellir.com`; `https://hydration.rotko.net`; `https://subway.sin.hydration.cloud`; `https://subway.coke.hydration.cloud`; `https://subway.shellfish.hydration.cloud`; `https://rpc-catfish-1.catfish.hydration.cloud`; `https://rpc-catfish-2.catfish.hydration.cloud`; `https://rpc-catfish-3.catfish.hydration.cloud`; `https://rpc-catfish-4.catfish.hydration.cloud`

**Packages:** `@galacticcouncil/main 0.0.0`

**Deadline:** 5s worker race includes body; UI status probe 10s. **Retry:** No explicit cold retry after every ranking probe fails. **Cancellation:** Probe AbortController aborts the timed-out fetch. **Cache:** Previous successful status retained; early page-head results consumed once.

**Failure and recovery behavior:**

- dns http: Any healthy probe may permit startup; all rejected/HTTP error/malformed probes make getBestRpcs throw; useAsyncFn catches and resolver stays null. Healthy WS with unavailable HTTP counterparts is not sufficient.
- hang: Worker 5s default Promise.race bounds fetch and response body and aborts request; UI rpcStatus uses10s. Inline head probe also5s.
- malformed stale: Worker checks Array.isArray, finite blockNumber and timestamp extrinsic string. Genesis hash may be null. Ranked by timestamp; no independent chain-tip freshness/expected-genesis filter at startup. Status queries preserve previous successful result on current failure.
- recovery: Cold failure readiness flag remains false; no explicit retry timer after all probes fail. Head cache consumed once. Warm polling keeps last successful status.

**Existing protections:** Probe race includes body parsing; abort controller; malformed shape checks; rank top3; inline early top5 probe; cached previous status.

**Recommended change:** On total HTTP probe failure proceed to configured WS fallback and render shell; expose retry selection. Distinguish same-chain HTTP vs WS availability. This is primary-chain transport coupling, not a separate third-party outage.

**Source:** [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:66](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L66), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:93](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L93), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:109](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L109), [apps/main/src/workers/ping/ping.worker.ts:114](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/workers/ping/ping.worker.ts#L114), [apps/main/src/workers/ping/ping.worker.ts:183](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/workers/ping/ping.worker.ts#L183)

## Hydration shared WebSocket RPC

**Activation:** active. **Worst traced scope:** Primary chain data and execution. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Intentionally mandatory chain dependency; root provider suspense waits identity and SDK context.

**Endpoints:** `wss://hydration-rpc.n.dwellir.com`; `wss://hydration.rotko.net`; `wss://subway.sin.hydration.cloud`; `wss://subway.coke.hydration.cloud`; `wss://subway.shellfish.hydration.cloud`; `wss://rpc-catfish-1.catfish.hydration.cloud`; `wss://rpc-catfish-2.catfish.hydration.cloud`; `wss://rpc-catfish-3.catfish.hydration.cloud`; `wss://rpc-catfish-4.catfish.hydration.cloud`; `ENV.VITE_PROVIDER_URL`; `user configured endpoint`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/common 1.2.0`; `polkadot-api 2.2.2`

**Deadline:** Provider defaults bound socket connect 5s and inactivity 40s. They are transport watchdogs, not a deadline for every pending request; incoming irrelevant traffic can keep socket alive. App getProviderData has no enclosing deadline. **Retry:** Same-chain switch preserves query data. UI reloads on refocus if block subscription older than 3min, after2s grace. Common blockProbe is disabled here; SDK watcher uses health recovery. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: WS connection failure rotates configured endpoints. JSON-RPC method errors reject required provider/asset work; optional useQuery failures generally local.
- hang: Provider defaults bound socket connect 5s and inactivity 40s. They are transport watchdogs, not a deadline for every pending request; incoming irrelevant traffic can keep socket alive. App getProviderData has no enclosing deadline.
- malformed stale: Papi typed descriptors enforce runtime compatibility; malformed RPC messages may throw inside WS message callback. Cached same-genesis chain data survives endpoint switches, but fresh cross-chain switch reloads.
- recovery: Same-chain switch preserves query data. UI reloads on refocus if block subscription older than 3min, after2s grace. Common blockProbe is disabled here; SDK watcher uses health recovery.

**Existing protections:** Multiple primary RPC endpoints; 5s connect/40s inactivity; chain identity cache guard; same-chain query preservation; 3min block-stale reload on visibility.

**Recommended change:** No independent external service identified in this transport. Keep optional method/contract capabilities isolated from ordinary chain availability; make primary-RPC recovery state explicit.

**Source:** [apps/main/src/api/rpcClient.ts:77](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L77), [apps/main/src/api/rpcClient.ts:92](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L92), [apps/main/src/providers/rpcProvider.tsx:107](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/rpcProvider.tsx#L107), [node_modules/@polkadot-api/ws-provider/dist/provider.js:9](https://unpkg.com/@polkadot-api/ws-provider@0.9.1/dist/provider.js), [node_modules/@polkadot-api/ws-provider/dist/provider.js:10](https://unpkg.com/@polkadot-api/ws-provider@0.9.1/dist/provider.js), [apps/main/src/providers/rpcProvider.tsx:111](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/providers/rpcProvider.tsx#L111)

## Hydration spot-price and share-token display pricing

**Activation:** active. **Worst traced scope:** On-chain spot and share prices. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional display enrichment; quotes/transaction correctness continue to require route-specific chain data.

**Endpoints:** `Hydration SDK router pools`; `Hydration Aave contracts for SC_ASSETS816/1816`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/sdk-next 2.3.2`

**Deadline:** One never-settling spot-price read holds batch updates for all active display assets; no batch deadline. Previously stored prices persist. **Retry:** Subscribed per-asset query staleInfinity; aggregate displayPrices stale10s and updated through subscriptions/block-driven cache interactions. Individual null is isValid:false; missing price is isLoading:true. Same-asset price1 bypasses fetch. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Primary-chain failures yield null price via getSpotPrice catch; no CoinGecko/independent external price feed in inspected path.
- hang: One never-settling spot-price read holds batch updates for all active display assets; no batch deadline. Previously stored prices persist.
- malformed stale: Decimal conversion errors softened to null. Persisted values lack value schema; initial persisted cache5min age rule applies only during restore. Once loaded prices are not aged by render-time TTL; stalled refresh can keep stale values without freshness badge. store.updatedAt changes only when prices differ, so unchanged healthy prices appear old on disk.
- recovery: Subscribed per-asset query staleInfinity; aggregate displayPrices stale10s and updated through subscriptions/block-driven cache interactions. Individual null is isValid:false; missing price is isLoading:true. Same-asset price1 bypasses fetch.

**Existing protections:** Errors become null/invalid display value;5min restore TTL; separate query subscriptions; no global Suspense on display price subscriber.

**Recommended change:** Bound/reconcile per-asset price refresh independently; expose observedAt/status; age live cached prices and validate numeric finite values without inventing zero.

**Source:** [apps/main/src/api/spotPrice.ts:110](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/spotPrice.ts#L110), [apps/main/src/api/spotPrice.ts:131](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/spotPrice.ts#L131), [apps/main/src/api/spotPrice.ts:66](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/spotPrice.ts#L66), [apps/main/src/states/displayAsset.ts:13](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/displayAsset.ts#L13), [apps/main/src/states/displayAsset.ts:88](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/displayAsset.ts#L88), [apps/main/src/api/spotPrice.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/spotPrice.ts#L83)

## Money-market core Aave provider (Hydration EVM only)

**Activation:** active. **Worst traced scope:** Core lending uses Hydration transport. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Hydration RPC is the intentionally permitted hard dependency. Core money-market provider does not use a foreign Ethereum RPC in current configuration. Neckwork events/yields/DCA warning, DeFiLlama/Kamino APYs and Grafana history are separate optional dependency entries.

**Endpoints:** `Selected Hydration WebSocket RPC -> papiClient._request -> viem custom EIP-1193 transport (chainId222222 or333333)`

**Packages:** `@galacticcouncil/main 0.0.0 (workspace)`; `@galacticcouncil/money-market 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`; `@aave/contract-helpers 1.23.1`; `@aave/math-utils 1.23.1`; `ethers 5.7.0`

**Deadline:** No whole-operation deadline.  **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** Individual contract refresh failures retain previous data; no freshness/offline marker (Hydration failure is outside the prime directive).

**Failure and recovery behavior:**

- external All Down: Normal external-source failures do not prevent core lending contract reads. APY/history degrade.
- warm: Individual contract refresh failures retain previous data; no freshness/offline marker (Hydration failure is outside the prime directive).
- malformed External: Optional APY computation can throw in shared context before borrowing children render; see Kamino dependency.

**Existing protections:** Hydration transport reused for Aave contracts. Refresh results are written independently. Thrown refresh errors caught and logged.

**Recommended change:** Keep optional APY/history calculations outside required provider rendering. Expose source freshness when retaining previous values.

**Source:** [apps/main/src/modules/borrow/BorrowContextProvider.tsx:94](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/borrow/BorrowContextProvider.tsx#L94), [apps/main/src/api/rpcClient.ts:83](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L83), [apps/main/src/api/borrow/contracts.ts:26](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/borrow/contracts.ts#L26), [packages/money-market/src/utils/provider.ts:6](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/utils/provider.ts#L6), [packages/money-market/src/store/poolSlice.ts:263](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/store/poolSlice.ts#L263), [packages/money-market/src/hooks/app-data-provider/useAppDataProvider.tsx:184](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/money-market/src/hooks/app-data-provider/useAppDataProvider.tsx#L184)

## SDK Rust/WASM math modules

**Activation:** active. **Worst traced scope:** Packaged WASM quote math. **Evidence:** Source trace; medium. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Executable math required for affected quotes/rewards; no independent math HTTP API.

**Endpoints:** `same-origin packaged/inlined SDK math binaries`

**Packages:** `@galacticcouncil/sdk-next 2.3.2`

**Deadline:** Lazy binary initialization depends on bundled/built Vite WASM loading; enclosing math initialization deadline not visible here. **Retry:** Reload correct coherent deployment; keep loaded UI/error boundary for optional code failure. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Packaged binaries share app host/bundle requirement; no third-party API request for math.
- hang: Lazy binary initialization depends on bundled/built Vite WASM loading; enclosing math initialization deadline not visible here.
- malformed stale: Invalid/incompatible binary/build artifact can fail import/instantiate before affected calculation.
- recovery: Reload correct coherent deployment; keep loaded UI/error boundary for optional code failure.

**Existing protections:** Pinned yarn.lock math dependencies;bundled deployment.

**Recommended change:** Serve immutable coherent binary/code assets; verify quote math and isolate optional code loading.

**Source:** [apps/main/vite.config.ts:102](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/vite.config.ts#L102), [node_modules/@galacticcouncil/sdk-next/package.json:101](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/package.json), [apps/main/src/index.tsx:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/index.tsx#L1)

## SDK context and required DCA parameters

**Activation:** active. **Worst traced scope:** Required SDK initialization. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Mandatory in rpcProviderQuery before full root render; pure client construction except required chain constant reads.

**Endpoints:** `Hydration constants DCA.MinBudgetInNativeCurrency and DCA.MinimalPeriod`

**Packages:** `@galacticcouncil/sdk-next 2.3.2`; `polkadot-api 2.2.2`

**Deadline:** Required constant reads have no enclosing context deadline. **Retry:** rpcProviderQuery retry:false/staleTimeInfinity; failed fresh context escalates root error; reload/remount needed unless explicitly invalidated. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Uses supplied Hydration typed client; no external SDK HTTP service required for context creation.
- hang: Required constant reads have no enclosing context deadline.
- malformed stale: Unavailable/incompatible DCA constants reject global context even for UI features not requiring DCA; memoized per context.
- recovery: rpcProviderQuery retry:false/staleTimeInfinity; failed fresh context escalates root error; reload/remount needed unless explicitly invalidated.

**Existing protections:** Shared primary RPC fallback. Context returned only after required constants.

**Recommended change:** Separate scheduler parameter initialization from basic chain/client context if partial capability failures must be tolerated.

**Source:** [apps/main/src/api/rpcClient.ts:98](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/rpcClient.ts#L98), [audit/sdk-next-readable.mjs:9179](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:9183](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:1626](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs)

## SDK pool families and shared router readiness

**Activation:** active. **Worst traced scope:** Combined pool families and registry. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

All activated families currently required as a combined result for cold assets/tradable assets; Aave and V3 semantically separable.

**Endpoints:** `Hydration Omni/Stable/XYK/Aave/V3 runtime storage and EVM calls; optional HSM when VITE_HSM_ENABLED`

**Packages:** `@galacticcouncil/sdk-next 2.3.2`

**Deadline:** Scoped QueryCache reads have15s rejection deadline without cancelling underlying request; background whole seed has60s. Direct aggregate has no outer deadline; bestBlocks$ first emission in resolveBlock unbounded. Aggregate test mocks a family getPools that never settles and shows no partial result; this does not override real scoped-read deadlines. **Retry:** Rejected QueryCache promises evicted; loadAll finally clears pending; next call can recover. Live pool sync catches seed/sync errors and retries on future blocks, connection recovery, finality gaps and hourly reseed; still combined isReady waits each activated family. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: All reads inspected share Hydration client. A family error rejects combined pool result, including healthy families.
- hang: Scoped QueryCache reads have15s rejection deadline without cancelling underlying request; background whole seed has60s. Direct aggregate has no outer deadline; bestBlocks$ first emission in resolveBlock unbounded. Aggregate test mocks a family getPools that never settles and shows no partial result; this does not override real scoped-read deadlines.
- malformed stale: Bad contract data/runtime incompatibility can reject required family. V3 missing/zero factory is handled as [] when recognized unsupported parameter. Aave fallback initial reserve enumeration remains required, but individual reserve-pool fallback uses allSettled.
- recovery: Rejected QueryCache promises evicted; loadAll finally clears pending; next call can recover. Live pool sync catches seed/sync errors and retries on future blocks, connection recovery, finality gaps and hourly reseed; still combined isReady waits each activated family.

**Existing protections:** Scoped15s query rejection; seed60s; family reseed/watchdog; QueryCache eviction on reject; missing V3 factory tolerated; reserve fallback allSettled.

**Recommended change:** Track readiness/errors per family and retain healthy pools; do not require auxiliary family discovery to populate base asset registry. Bound first block emission and aggregate; propagate stale-family status into routing correctness.

**Source:** [audit/sdk-next-readable.mjs:9179](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:1817](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:7451](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:93](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [audit/sdk-next-readable.mjs:3263](https://unpkg.com/@galacticcouncil/sdk-next@2.3.2/build/index.mjs), [apps/main/src/api/assets.ts:163](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/assets.ts#L163), [apps/main/src/api/pools.ts:43](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/pools.ts#L43)

**Fault evidence:** [deep-startup-faults.results.json#sdk_pool_aggregate_v3_reject](evidence/deep-startup-faults.results.json)

## Validated portfolio query persistence

**Activation:** active. **Worst traced scope:** Optional cached portfolio data. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional initial paint cache; setup is called and returns without awaiting restore.

**Endpoints:** `browser IndexedDB portfolio-balances/balances`

**Packages:** `@galacticcouncil/main 0.0.0`; `@tanstack/query-persist-client-core 5.101.4`

**Deadline:** Underlying IndexedDB open/read can stall restore/save subscription setup, but not root render. **Retry:** Restore rejection caught then installs save subscription. A permanently hanging restore never reaches subscription; current portfolio fetch remains independent. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: No remote dependency. Failed local restore logs and ordinary queries fetch; write failure logs.
- hang: Underlying IndexedDB open/read can stall restore/save subscription setup, but not root render.
- malformed stale: Balances validated array and required fields including bigint, reconstructed as AssetAmount. Invalid cache discarded;24h maxAge/cache-buster; does not validate whole stale upstream financial truth.
- recovery: Restore rejection caught then installs save subscription. A permanently hanging restore never reaches subscription; current portfolio fetch remains independent.

**Existing protections:** Shape validation;24h maxAge;buster portfolio-v1;best-effort catches;non-blocking startup setup.

**Recommended change:** Add storage operation deadlines/recovery; keep unavailable vs zero and observation timestamps when cached data shown.

**Source:** [apps/main/src/App.tsx:40](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L40), [apps/main/src/api/portfolio/persistence.ts:70](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/persistence.ts#L70), [apps/main/src/api/portfolio/persistence.ts:88](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/persistence.ts#L88), [apps/main/src/api/portfolio/persistence.ts:141](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/portfolio/persistence.ts#L141), [apps/main/src/config/portfolio.ts:5](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/config/portfolio.ts#L5)

## Bundled English translations

**Activation:** active. **Worst traced scope:** Bundled translations. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Required local UI data with English fallback; network only application-code serving.

**Endpoints:** `Bundled module JSON; no runtime translation endpoint`

**Packages:** `@galacticcouncil/main 0.0.0`; `react-i18next 15.7.4`; `i18next 23.16.8`

**Deadline:** No runtime fetch awaits translations. **Retry:** Deterministic bundle version; English resources local. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: No runtime remote backend installed in initialization. Uncached translation-containing code still shares application host requirement.
- hang: No runtime fetch awaits translations.
- malformed stale: JSON bundled at build; translation-key issue stays text/local formatting concern.
- recovery: Deterministic bundle version; English resources local.

**Existing protections:** Bundled resources;fixed English fallback.

**Recommended change:** Keep core translation resources bundled; no runtime-service isolation change needed.

**Source:** [apps/main/src/i18n/index.ts:6](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/i18n/index.ts#L6), [apps/main/src/i18n/index.ts:37](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/i18n/index.ts#L37), [apps/main/src/i18n/index.ts:36](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/i18n/index.ts#L36)

## Bundled fonts and design assets

**Activation:** active. **Worst traced scope:** Typography. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional visual assets; CSS/code required to render structure.

**Endpoints:** `same-origin/assets/Geist*.woff2`; `same-origin/assets/Gazpacho*.woff2`

**Packages:** `@galacticcouncil/ui 0.0.0`

**Deadline:** font-display:swap permits text visibility while fetching. **Retry:** Browser cache/new bundle URLs; no root-await coupling. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Font load failure uses CSS fallback fonts; no independent Google Fonts service.
- hang: font-display:swap permits text visibility while fetching.
- malformed stale: Browser ignores invalid font bytes; appearance only.
- recovery: Browser cache/new bundle URLs; no root-await coupling.

**Existing protections:** Local packaged fonts;font-display swap.

**Recommended change:** Keep explicit fallback font families and avoid external required font fetches.

**Source:** [packages/ui/src/assets/fonts/fonts.css:6](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/src/assets/fonts/fonts.css#L6), [apps/main/vite.config.ts:31](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/vite.config.ts#L31), [apps/main/src/App.tsx:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/App.tsx#L1)

## Cross-chain context construction (local)

**Activation:** active. **Worst traced scope:** Local configuration; no external init await. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Cross-chain and multichain portfolio context. No external network await was found during construction.

**Endpoints:** No independent external endpoint.

**Packages:** `@galacticcouncil/xc 2.1.0`; `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`; `@galacticcouncil/xc-sdk 2.5.0`

**Deadline:** No external startup request was found in context creation. Its use of Suspense does not establish a root outage. **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP hang: No external startup request was found in context creation. Its use of Suspense does not establish a root outage.

**Existing protections:** The existing Hydration pool is passed explicitly; external clients connect lazily.

**Recommended change:** Keep construction local and keep future optional registrations out of root readiness.

**Source:** [apps/main/src/api/xcm.ts:37](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/xcm.ts#L37), [audit/crosschain-sources/xc.mjs:15](https://unpkg.com/@galacticcouncil/xc@2.1.0/build/index.mjs), [audit/crosschain-sources/xc.mjs:37](https://unpkg.com/@galacticcouncil/xc@2.1.0/build/index.mjs)

## Background app-version detection

**Activation:** active. **Worst traced scope:** Update notification. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional non-blocking background request and banner.

**Endpoints:** `window.location.origin/index.html`

**Packages:** `@galacticcouncil/main 0.0.0`

**Deadline:** Baseline/body/refresh fetch lack deadline; hangs remain background and do not gate App. Hung baseline holds every future check; repeated checks can accumulate waiting tasks. **Retry:** Hourly/refocus checks retry refreshed index but never recover absent/hung baseline, so update awareness remains disabled for tab lifetime. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Baseline rejection becomes null; checks catch network errors and never throw into UI.
- hang: Baseline/body/refresh fetch lack deadline; hangs remain background and do not gate App. Hung baseline holds every future check; repeated checks can accumulate waiting tasks.
- malformed stale: HTML compared byte-for-byte; transient HTTP200 content mismatch can trigger false banner. Baseline null after startup failure is never replaced.
- recovery: Hourly/refocus checks retry refreshed index but never recover absent/hung baseline, so update awareness remains disabled for tab lifetime.

**Existing protections:** Import side effect not awaited by App; catch; suppress banner while transactions/overlays/tutorials active; reload only on user click.

**Recommended change:** Add full-body deadline/inflight guard; reacquire baseline after initial failure; compare explicit build ID.

**Source:** [apps/main/src/utils/appUpdate.ts:20](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/appUpdate.ts#L20), [apps/main/src/utils/appUpdate.ts:27](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/appUpdate.ts#L27), [apps/main/src/utils/appUpdate.ts:33](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/appUpdate.ts#L33), [apps/main/src/utils/appUpdate.ts:48](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/utils/appUpdate.ts#L48), [apps/main/src/components/AppUpdateBanner/AppUpdateBanner.tsx:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/AppUpdateBanner/AppUpdateBanner.tsx#L18)

**Fault evidence:** [deep-startup-faults.results.json#app_update_baseline_rejection](evidence/deep-startup-faults.results.json)

## Neckwork fees and revenue charts

**Activation:** active. **Worst traced scope:** Per-stream analytics charts. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Analytics charts only.

**Endpoints:** `https://hydration-api.neckwork.net/api/v1/fees/charts?productType=...&streamType=...&feeDestination=...&startTime=...&endTime=...&bucketSize=...`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** Previous complete result displayed faded during pending new window; failing streams markedunknown. No upstream freshness check.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: No upstream freshness check.
- warm: Previous complete result displayed faded during pending new window; failing streams markedunknown.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Ordinary rejected one stream correctly displays partial values; all reject explicit chart error. One hanging stream hides all cold successes indefinitely behind loading.
- malformed: NaN dates/invalid values can survive typed response mapping and enter chart (boundary outcome inference).

**Existing protections:** Per-stream failures represented null Partial successful streams supported after every pending stream settles Warm lastLoadedRef

**Recommended change:** Render completed streams immediately Bound each request; mark pending/failure locally Finite timestamps/value schema

**Source:** [packages/indexer/src/neckwork/fees.ts:199](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/fees.ts#L199), [packages/indexer/src/neckwork/fees.ts:215](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/fees.ts#L215), [apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx:54](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx#L54), [apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx:77](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx#L77), [apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx:88](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.tsx#L88)

## Neckwork health and post-transaction index synchronization

**Activation:** active. **Worst traced scope:** Health fallback and post-transaction index sync. **Evidence:** Functions + source; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Health display, history/backend selection and data invalidation Hydration transactions do not await health probe.

**Endpoints:** `https://hydration-api.neckwork.net/v1/status`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** Health fetch separately bounded at 2000ms; ordinary status/sync query has no whole-operation deadline, including error body. **Retry:** Health probe retry:false; ordinary status/synchronization query browser default three retries after rejection. Pending requests cannot retry. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** React Query retains successful same-key cache during refetch/error; most consumers do not expose its freshness. Frozen blockHeight may keep old indexed account data; timeout no real timer and identical structurally-shared status may suppress needed render (inference).

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Frozen blockHeight may keep old indexed account data; timeout no real timer and identical structurally-shared status may suppress needed render (inference).
- warm: React Query retains successful same-key cache during refetch/error; most consumers do not expose its freshness.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- cold: Bounded health fetch can mark service dead and activate legacy fallback. Status2xx malformed/lagging body still marked alive.
- partial Outage: /v1/status success while /v1/prices/pair or schedules returns404/429/503 does not cause backend switch.
- hang: Health probe bounded; normal status query and armed synchronization are unbounded.

**Existing protections:** 2000ms health deadline No health retries Legacy GraphQL/Grafana backend fallback on dead health Disarms sync when disabled/fork; nominal 120s refresh escape

**Recommended change:** Bound every actual request including body Validate status and track last indexed block age Use per-resource circuit breaker for 404/429/5xx Give sync its own deadline timer independent of renders

**Source:** [apps/main/.env.production:3](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/.env.production#L3), [apps/main/src/components/DataProviderSelect/DataProviderResolver.utils.ts:26](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.utils.ts#L26), [apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx:24](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/components/DataProviderSelect/DataProviderResolver.tsx#L24), [apps/main/src/states/neckwork.ts:21](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/states/neckwork.ts#L21), [apps/main/src/modules/trade/swap/tradeDataSource.ts:18](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/trade/swap/tradeDataSource.ts#L18), [apps/main/src/api/neckworkSync.ts:39](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/neckworkSync.ts#L39)

**Fault evidence:** [deep-data-faults.json](evidence/deep-data-faults.json)

## Passive asset/chain image downloads

**Activation:** active. **Worst traced scope:** Logos and decoration. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Optional decoration after manifests; no registry await on image pixels.

**Endpoints:** `https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master/[data.path]/[items containing icon]`

**Packages:** `@galacticcouncil/main 0.0.0`; `@galacticcouncil/ui 0.0.0`; `@galacticcouncil/utils 0.0.0`

**Deadline:** Browser image loading can remain pending without application deadline, but not awaited by root. **Retry:** Image hasError local state; fallback shown if supplied; same component may not retry a once-failed URL automatically. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Broken icons/placeholder; normal balance/amount/trade controls remain available.
- hang: Browser image loading can remain pending without application deadline, but not awaited by root.
- malformed stale: Invalid URLs/image bytes fail img load; cached registry retains old icon URLs until remapped.
- recovery: Image hasError local state; fallback shown if supplied; same component may not retry a once-failed URL automatically.

**Existing protections:** Image onError and optional placeholder; lazy loading; bundled local UI illustrations/icons.

**Recommended change:** Ensure every logo has a local fallback; make retry/reset react to source changes.

**Source:** [packages/utils/src/lib/AssetMetadataFactory.ts:102](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/lib/AssetMetadataFactory.ts#L102), [packages/ui/src/components/Image/Image.tsx:23](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/src/components/Image/Image.tsx#L23), [packages/ui/src/components/Image/Image.tsx:27](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/src/components/Image/Image.tsx#L27)

## Reown hosted fonts

**Activation:** conditional. **Worst traced scope:** Modal typography. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Cosmetic typography in the AppKit modal.

**Endpoints:** `https://fonts.reown.com/KHTeka-Medium.woff2`; `https://fonts.reown.com/KHTeka-Regular.woff2`; `https://fonts.reown.com/KHTeka-Light.woff2`; `https://fonts.reown.com/KHTekaMono-Regular.woff2`; `https://fonts.reown.com/KHTeka-Light.woff`; `https://fonts.reown.com/KHTeka-Regular.woff`; `https://fonts.reown.com/KHTekaMono-Regular.woff`

**Packages:** `@reown/appkit-ui 1.8.19`

**Deadline:** Browser font loads can fail or remain pending safely. font-display: swap permits fallback, and no JavaScript await ties fonts to readiness. No functional outage was established. **Retry:** Browser cache can provide the font; fallback fonts keep content readable. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP hang malformed: Browser font loads can fail or remain pending safely. font-display: swap permits fallback, and no JavaScript await ties fonts to readiness. No functional outage was established.
- stale warm recovery: Browser cache can provide the font; fallback fonts keep content readable.

**Existing protections:** font-display: swap and a custom-font option are available.

**Recommended change:** Use the application/system font or self-host fonts to remove this optional origin.

**Source:** [node_modules/@reown/appkit-ui/dist/esm/src/utils/ThemeUtil.js:9](https://unpkg.com/@reown/appkit-ui@1.8.19/dist/esm/src/utils/ThemeUtil.js), [node_modules/@reown/appkit-ui/dist/esm/src/utils/ThemeUtil.js:40](https://unpkg.com/@reown/appkit-ui@1.8.19/dist/esm/src/utils/ThemeUtil.js), [node_modules/@reown/appkit-ui/dist/esm/src/utils/ThemeUtil.js:99](https://unpkg.com/@reown/appkit-ui@1.8.19/dist/esm/src/utils/ThemeUtil.js)

## Reown wallet registry/assets and optional account UX APIs

**Activation:** conditional. **Worst traced scope:** Wallet modal optional views and assets. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Reown modal icons, network images, ranking and optional account views. Main wallet account identities use Hydration PAPI independently.

**Endpoints:** `https://api.web3modal.org/getWallets`; `https://api.web3modal.org/getWalletImage/{id}`; `https://api.web3modal.org/public/getAssetImage/{id}`; `https://api.web3modal.org/public/getCurrencyImage/{code}`; `https://api.web3modal.org/public/getTokenImage/{symbol}`; `https://rpc.walletconnect.org/v1/identity/{address}`; `https://rpc.walletconnect.org/v1/account/{account}/history`; `https://rpc.walletconnect.org/v1/account/{address}/balance`; `https://rpc.walletconnect.org/v1/profile/{operation}`

**Packages:** `@reown/appkit 1.8.19`; `@reown/appkit-controllers 1.8.19`

**Deadline:** FetchUtil has no deadline. A pending blob/JSON/network request can stall an optional modal feature. No root-readiness await for image prefetch was established. **Retry:** Cached assets can survive an outage. An uncached optional view degrades. These services are not required for native/injected wallet signing. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Image batches use allSettled. Recommended-wallet failures are caught; handling differs among individual feature controllers.
- hang: FetchUtil has no deadline. A pending blob/JSON/network request can stall an optional modal feature. No root-readiness await for image prefetch was established.
- malformed: A wrong wallet data shape can reject registry loading. Prefetch catches vary by caller; no root-level fatal crash was established.
- stale: SDK caches exist for identity, history and images. Images have no shared age/error indicator.
- cold warm recovery: Cached assets can survive an outage. An uncached optional view degrades. These services are not required for native/injected wallet signing.

**Existing protections:** Image batches use allSettled. The wallet catalog is hidden. Hydration account identities use an independent placeholder/query path.

**Recommended change:** Bound complete requests and use cosmetic placeholders. Make prefetch best effort and add error boundaries for optional views.

**Source:** [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ApiController.js:69](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/ApiController.js), [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/BlockchainApiController.js:147](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/BlockchainApiController.js), [packages/web3-connect/src/wallets/ReownWalletConnect/AppKit.ts:20](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/web3-connect/src/wallets/ReownWalletConnect/AppKit.ts#L20)

## Reown/WalletConnect telemetry and notification registration

**Activation:** conditional. **Worst traced scope:** Best-effort telemetry and optional push. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Telemetry delivery and optional device notification registration.

**Endpoints:** `https://pulse.walletconnect.org/batch`; `https://echo.walletconnect.com/{projectId}/clients`

**Packages:** `@reown/appkit-controllers 1.8.19`; `@walletconnect/core 2.23.7`

**Deadline:** Telemetry fetch is unbounded but is outside the critical UI path. It can retain network resources; no root block was established. **Retry:** Telemetry loss or retry does not affect balances, quotes or signing. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Pulse errors are caught; events are discarded or retained for retry. No critical readiness await was established.
- hang: Telemetry fetch is unbounded but is outside the critical UI path. It can retain network resources; no root block was established.
- malformed: Pulse checks response status rather than consuming application domain entities.
- stale cold warm recovery: Telemetry loss or retry does not affect balances, quotes or signing.

**Existing protections:** sendBeacon does not await delivery. Telemetry errors are caught. Notification registration has no current UI caller.

**Recommended change:** Keep telemetry best effort and bounded. Avoid awaiting it during readiness.

**Source:** [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/EventsController.js:85](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/EventsController.js), [node_modules/@reown/appkit-controllers/dist/esm/src/controllers/EventsController.js:133](https://unpkg.com/@reown/appkit-controllers@1.8.19/dist/esm/src/controllers/EventsController.js), [audit/crosschain-sources/walletconnect-core.js:4179](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js), [audit/crosschain-sources/walletconnect-core.js:4009](https://unpkg.com/@walletconnect/core@2.23.7/dist/index.js)

## Subsquare referendum titles

**Activation:** active. **Worst traced scope:** Referendum title text. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Title text only; chain referendum/voting info unaffected.

**Endpoints:** `https://hydration-api.subsquare.io/gov2/referendums/{id}.json`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`; `zod 4.3.6 (where schema is used)`; `react 19.2.5`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** React Query same-key cache retained; no freshness indicator unless noted. No upstream timestamp check; default staleTime=0 allows focus/remount refresh.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: React Query same-key cache retained; no freshness indicator unless noted.
- recovery: Query lifecycle only unless explicit interval noted.
- dns: Default query retries after rejected fetch; no title on final failure.
- http404: Returns successful null without retries.
- http429: Returns successful null; no backoff or Retry-After handling.
- http5xx: Returns successful null without retries.
- hang: Title can remain loading indefinitely; chain referendum cards and voting data remain available.
- malformed: Zod rejects malformed body inside query; title unavailable.
- stale: No upstream timestamp check; default staleTime=0 allows focus/remount refresh.

**Existing protections:** NonOK => null Runtime title shape schema Chain referenda/actions separate

**Recommended change:** Bound request and body with cancellation. Display title source as unavailable when appropriate. Use a retry policy for transient 429/5xx errors.

**Source:** [apps/main/src/api/democracy.ts:255](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/democracy.ts#L255), [apps/main/src/api/democracy.ts:270](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/democracy.ts#L270), [apps/main/src/modules/staking/Referenda.tsx:46](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/staking/Referenda.tsx#L46)

## Build time Hydration style tokens

**Activation:** build. **Worst traced scope:** Fresh theme/build generation only. **Evidence:** Source trace; Source traced; ordinary workspace build succeeded. No build outage was injected.. UI blast radius is source-inferred unless a browser test explicitly verifies it.

UI workspace build and theme generation fetch the mutable style-token source before generating local theme JSON. The running deployed UI uses bundled generated tokens.

**Endpoints:** `https://raw.githubusercontent.com/galacticcouncil/hydration-styles/refs/heads/tertiary/tokens.json`

**Packages:** `@galacticcouncil/ui 0.0.0 (workspace)`; `style-dictionary 4.4.0`

**Deadline:** No application deadline around GitHub fetch or response.text(). **Retry:** Rerun the build after recovery; no automatic local-source fallback. **Cancellation:** No AbortSignal passed to fetch. **Cache:** Generated output is bundled; remote branch input is mutable.

**Failure and recovery behavior:**

- network: Rejected fetch prevents a fresh theme build. No application deadline is supplied for fetch or body parsing.
- malformed: HTTP status is not checked before parsing response text as JSON. Invalid JSON or incompatible token shape fails the build/generation step.
- stale: Branch URL is mutable and not pinned by yarn.lock. This affects build reproducibility, not the availability of a running bundle.
- recovery: Build can be rerun after recovery; the script does not select a local cached source on fetch failure.

**Existing protections:** Generated theme JSON is bundled for runtime; deployed rendering has no live style-token request.

**Recommended change:** Pin or vendor the style-token input and make local generation reproducible independently of public GitHub availability.

**Source:** [packages/ui/style-dictionary/build.mjs:37](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/style-dictionary/build.mjs#L37), [packages/ui/style-dictionary/build.mjs:51](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/style-dictionary/build.mjs#L51), [packages/ui/package.json:13](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/package.json#L13)

## Bundled runtime configuration validation

**Activation:** build. **Worst traced scope:** Module initialization with invalid build config. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Current global module initialization requires valid optional service URL literals too.

**Endpoints:** `import.meta.env literals; no endpoint to fetch config`

**Packages:** `@galacticcouncil/main 0.0.0`; `zod 4.3.6`

**Deadline:** Synchronous schema parsing; no fetch. **Retry:** Requires valid/rebuilt bundle; not an independent service outage. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- dns http: Service outage itself does not invalidate URL literal. Missing/malformed optional config values reject global module evaluation before boot.
- hang: Synchronous schema parsing; no fetch.
- malformed stale: Invalid environmental build config throws globally even if optional feature unused.
- recovery: Requires valid/rebuilt bundle; not an independent service outage.

**Existing protections:** Explicit URL/type/boolean validation catches misconfiguration.

**Recommended change:** Separate primary required config from optional integrations; disable unavailable optional feature when config absent.

**Source:** [apps/main/src/config/env.ts:7](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/config/env.ts#L7), [apps/main/src/config/env.ts:9](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/config/env.ts#L9), [apps/main/src/config/env.ts:21](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/config/env.ts#L21)

## Optional asset color generation inputs

**Activation:** build. **Worst traced scope:** Manual color generation only. **Evidence:** Source trace; Source traced; no generation outage injected.. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Explicit assets:colors generation command, separate from ordinary theme/build. Runtime consumes checked-in assetColors.json and does not generate colors by requesting icons.

**Endpoints:** `https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master/assets-v2.json`; `Icon resources resolved from the asset metadata repository`

**Packages:** `@galacticcouncil/ui 0.0.0 (workspace)`

**Deadline:** No application deadline around metadata or image fetch/body work. **Retry:** Rerun manual generation; ordinary deployed runtime does not await it. **Cancellation:** No AbortSignal passed to fetch. **Cache:** Existing generated color map remains bundled in the deployed UI.

**Failure and recovery behavior:**

- network: The manual generation command depends on repository metadata and downloaded image inputs. Fetch has no application deadline.
- malformed: JSON/image processing can reject the generation command or individual logo extraction; runtime colors already in the bundle are unaffected.
- recovery: Rerun manual generation with working inputs. Runtime does not await this command.

**Existing protections:** Checked-in generated color map; concurrency cap eight for generation work; fixed color overrides.

**Recommended change:** Pin input revisions and bound fetch/body/image work when regenerating colors.

**Source:** [packages/ui/scripts/generate-asset-colors.mjs:10](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/scripts/generate-asset-colors.mjs#L10), [packages/ui/scripts/generate-asset-colors.mjs:157](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/scripts/generate-asset-colors.mjs#L157), [packages/ui/scripts/generate-asset-colors.mjs:298](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/scripts/generate-asset-colors.mjs#L298), [packages/ui/package.json:20](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/ui/package.json#L20)

## Reown npm latest check (development only)

**Activation:** build. **Worst traced scope:** Development console diagnostic. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

A development-only package-version console warning; it does not gate production readiness.

**Endpoints:** `https://registry.npmjs.org/@reown/appkit/latest`

**Packages:** `@reown/appkit-utils 1.8.19`

**Deadline:** A request that never settles leaves only the diagnostic pending. **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: A rejected fetch chain can be unhandled because its surrounding try/catch is synchronous. Root rendering does not await it.
- hang: A request that never settles leaves only the diagnostic pending.
- malformed stale: Response data is used for version comparison/warnings and version caching, not a functionality gate.

**Existing protections:** It has a development gate and cached version data. Readiness does not await it.

**Recommended change:** Catch the asynchronous promise chain and give diagnostic requests a deadline.

**Source:** [node_modules/@reown/appkit-utils/dist/esm/src/SemVerUtils.js:17](https://unpkg.com/@reown/appkit-utils@1.8.19/dist/esm/src/SemVerUtils.js), [node_modules/@reown/appkit-utils/dist/esm/src/SemVerUtils.js:31](https://unpkg.com/@reown/appkit-utils@1.8.19/dist/esm/src/SemVerUtils.js)

## Zcash balance reader (not configured)

**Activation:** dormant. **Worst traced scope:** No configured balance transport. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Zcash can be a 1Click output destination. No external balance reader/indexer is configured.

**Endpoints:** No independent external endpoint.

**Packages:** `@galacticcouncil/xc-core 2.6.0`; `@galacticcouncil/xc-cfg 2.7.0`

**Deadline:** No reachable balance endpoint was identified. A balance call throws because the reader is missing; the aggregate can convert that failure into []. **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP hang: No reachable balance endpoint was identified. A balance call throws because the reader is missing; the aggregate can convert that failure into [].

**Existing protections:** No lightwallet/indexer dependency is assumed without evidence.

**Recommended change:** If adding balances, configure an explicit endpoint, deadline and unavailable state.

**Source:** [audit/crosschain-sources/xc-core.mjs:2675](https://unpkg.com/@galacticcouncil/xc-core@2.6.0/build/index.mjs), [audit/crosschain-rpc-inventory.json:1](evidence/crosschain-rpc-inventory.json)

## 1Click status API (unused by this UI)

**Activation:** dormant. **Worst traced scope:** No current UI caller. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

No UI or xc-swap caller was found. The current monitor has no direct 1Click status fallback.

**Endpoints:** `https://1click.chaindefuser.com/v0/status`

**Packages:** `@defuse-protocol/one-click-sdk-typescript 0.1.25`

**Deadline:** No separate remote request at this layer; see the consumer and failure details. **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- failure: This unused endpoint has no direct current UI effect. If wired, it would use the same unbounded Axios transport.

**Existing protections:** The current monitor uses the separate IntentScan service.

**Recommended change:** If adding a fallback, track the actual deposit address and use an independent deadline/provider policy.

**Source:** [node_modules/@defuse-protocol/one-click-sdk-typescript/dist/index.js:1238](https://unpkg.com/@defuse-protocol/one-click-sdk-typescript@0.1.25/dist/index.js), [apps/main/src/modules/transactions/utils/toasts/intents.ts:26](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/utils/toasts/intents.ts#L26)

## BasejumpScan transport (defined; uncalled)

**Activation:** dormant. **Worst traced scope:** Defined transports without UI caller. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

Only hook definitions and exports were found. The root uses Ocelloids. No application caller was found for the Basejump query, subscription or processing hook.

**Endpoints:** `https://bjscan-api.play.hydration.cloud/api/transfers?address={h160}`; `https://bjscan-api.play.hydration.cloud/api/events?address={h160}`

**Packages:** `@galacticcouncil/utils workspace`; `@galacticcouncil/xc-scan 0.5.0`

**Deadline:** If wired, fetch/body reads have no deadline. EventSource has native reconnect but no custom heartbeat or error state. **Retry:** If wired, the staleTime Infinity HTTP query does not refetch without invalidation; SSE updates the cache. There is no initial-load retry. The current snapshot has no direct transport dependency on this API. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: If wired, the ordinary query throws on an HTTP failure and disables retries.
- hang: If wired, fetch/body reads have no deadline. EventSource has native reconnect but no custom heartbeat or error state.
- malformed: HTTP data is validated with Zod. Invalid SSE JSON/schema is safely ignored.
- stale cold warm recovery: If wired, the staleTime Infinity HTTP query does not refetch without invalidation; SSE updates the cache. There is no initial-load retry. The current snapshot has no direct transport dependency on this API.

**Existing protections:** SSE payloads are guarded. Unsubscribe closes the stream. No active transport caller was found.

**Recommended change:** Either give the transport clear, scoped history ownership/recovery or remove it while unused. Add deadlines and freshness checks before activation.

**Source:** [packages/utils/src/helpers/basejumpscan.ts:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/helpers/basejumpscan.ts#L1), [apps/main/src/modules/xcm/history/useBasejumpScan.ts:25](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/useBasejumpScan.ts#L25), [apps/main/src/modules/xcm/history/useBasejumpScan.ts:67](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/useBasejumpScan.ts#L67), [apps/main/src/modules/xcm/history/lib/BasejumpScanSseClient.ts:31](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/lib/BasejumpScanSseClient.ts#L31), [apps/main/src/modules/transactions/utils/toasts/processors.ts:250](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/transactions/utils/toasts/processors.ts#L250)

## Wormhole Scan transport (SDK-defined; UI dormant)

**Activation:** dormant. **Worst traced scope:** SDK client without current UI calls. **Evidence:** Functions + source; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

The context constructs a Scan client, but no UI calls were found. Direct SDK WormholeTransfer history methods would require it.

**Endpoints:** `https://api.wormholescan.io/v1/signed_vaa/{id}`; `https://api.wormholescan.io/api/v1/vaas/{id}`; `https://api.wormholescan.io/api/v1/vaas/?txHash={hash}`; `https://api.wormholescan.io/api/v1/operations/`

**Packages:** `@galacticcouncil/xc-sdk 2.5.0`; `@galacticcouncil/xc 2.1.0`

**Deadline:** If called, methods remain pending on a hung fetch or body because they have no deadline/signal. **Retry:** The Scan class has no cache, freshness policy or fallback. It is outside the current active UI path. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP failure: Network failures reject. HTTP status is not checked: the tested 503 response with operations [] was accepted.
- hang: If called, methods remain pending on a hung fetch or body because they have no deadline/signal.
- malformed: Unvalidated data or operations can throw or cause downstream failures. History uses an all-or-nothing Promise.all.
- stale cold warm recovery: The Scan class has no cache, freshness policy or fallback. It is outside the current active UI path.

**Existing protections:** No live UI dependency was established, so this service is not classified as currently blocking the UI.

**Recommended change:** Before wiring Scan, add HTTP status/schema checks, deadlines, cancellation and an independent history fallback.

**Source:** [audit/crosschain-sources/xc-sdk.mjs:1859](https://unpkg.com/@galacticcouncil/xc-sdk@2.5.0/build/index.mjs), [audit/crosschain-sources/xc-sdk.mjs:1962](https://unpkg.com/@galacticcouncil/xc-sdk@2.5.0/build/index.mjs), [apps/main/src/modules/xcm/history/utils/claim.ts:162](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/xcm/history/utils/claim.ts#L162)

**Fault evidence:** [deep-crosschain-faults.json](evidence/deep-crosschain-faults.json)

## Subscan proxy helper (uncalled API builder)

**Activation:** dormant. **Worst traced scope:** Uncalled helper and outbound explorer links. **Evidence:** Source trace; high. UI blast radius is source-inferred unless a browser test explicitly verifies it.

No caller of subscan.api was found. Direct HDX supply and referenda APIs are covered by another audit slice.

**Endpoints:** `https://unified-main-aggr-indx.indexer.hydration.cloud/proxy/subscan/{path}`

**Packages:** `@galacticcouncil/utils workspace`; `@galacticcouncil/xc-cfg 2.7.0`

**Deadline:** No UI request to this helper URL was found. Failure of an external explorer only affects a link the user opens. **Retry:** Recovery follows the individual caller; see failure behavior. **Cancellation:** No general guarantee; the transport details and evidence below specify cancellation where inspected. **Cache:** See cold, warm, stale and recovery behavior below.

**Failure and recovery behavior:**

- DNS HTTP hang: No UI request to this helper URL was found. Failure of an external explorer only affects a link the user opens.

**Existing protections:** URL builders are not root network dependencies.

**Recommended change:** Before activating the API helper, give the feature explicit ownership, deadlines, schema validation and fallback.

**Source:** [packages/utils/src/helpers/subscan.ts:12](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/helpers/subscan.ts#L12), [packages/utils/src/helpers/subscan.ts:19](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/helpers/subscan.ts#L19)

## Dormant Neckwork count/single-intent exports

**Activation:** dormant. **Worst traced scope:** No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.

**Endpoints:** `https://hydration-api.neckwork.net/v1/dca/schedules/count`; `https://hydration-api.neckwork.net/v1/intents/count`; `https://hydration-api.neckwork.net/v1/intents/{id}`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `openapi-fetch 0.17.0`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`

**Deadline:** No whole-operation deadline. No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing. **Retry:** React Query browser default 3 retries after rejection unless consumer override; retry requires request to settle. **Cancellation:** Client/queryFns do not pass React Query AbortSignal. Optional HTTP health probe is separately bounded at 2000 ms. **Cache:** React Query retains successful same-key cache during refetch/error; most consumers do not expose its freshness. Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.

**Failure and recovery behavior:**

- dns: Fetch rejects; query boundary catches.
- http404: Middleware waits for cloned JSON error body, then throws NeckworkApiError.
- http429: Same; no Retry-After handling.
- http5xx: Same. Separate health probe marks >=500 dead only if /v1/status fails.
- request Hang: No deadline; query remains pending indefinitely.
- body Hang: No deadline, including HTTP error body: readErrorMessage awaits response.clone().json() before throwing.
- malformed Json: JSON parser rejects, query boundary catches.
- malformed Business Data: Generated OpenAPI types are compile-time only; no complete runtime/numeric schema; some transformation errors occur inside query, others downstream in render.
- stale: Most queries staleTime=60000; staleTime triggers fetching eligibility, not maximum upstream sample age. No common response block/timestamp lag guard.
- warm: React Query retains successful same-key cache during refetch/error; most consumers do not expose its freshness.
- recovery: New query, focus/reconnect/remount for stale queries and enabled refetch intervals; no recovery while original hung request remains in flight.
- outage: No effect on the current UI from this unused export/helper. Offsite explorer links may independently fail.

**Existing protections:**

**Recommended change:** Remove unused exports or document resilience requirements before activating them.

**Source:** [packages/indexer/src/neckwork/dca.ts:111](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/dca.ts#L111), [packages/indexer/src/neckwork/intents.ts:131](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/indexer/src/neckwork/intents.ts#L131)

## Dormant Subscan HDX supply API

**Activation:** dormant. **Worst traced scope:** No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.

**Endpoints:** `https://hydration.api.subscan.io/api/scan/token`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** React Query same-key cache retained; no freshness indicator unless noted.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: React Query same-key cache retained; no freshness indicator unless noted.
- recovery: Query lifecycle only unless explicit interval noted.
- outage: No effect on the current UI from this unused export/helper. Offsite explorer links may independently fail.

**Existing protections:** Noactivefetch

**Recommended change:** Remove unused exports or document resilience requirements before activating them.

**Source:** [packages/utils/src/constants/url.ts:1](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/packages/utils/src/constants/url.ts#L1), [apps/main/src/api/staking.ts:61](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/staking.ts#L61), [apps/main/src/modules/staking/DashboardStats.data.ts:34](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/modules/staking/DashboardStats.data.ts#L34)

## Dormant former metrics aggregator API

**Activation:** dormant. **Worst traced scope:** No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.. **Evidence:** Source trace; high for source facts; downstream boundary/display impacts are source inference unless testRef says exact source function. UI blast radius is source-inferred unless a browser test explicitly verifies it.

No active fetch consumer found in current source. Do not count as a mandatory runtime dependency.

**Endpoints:** `https://hydration-metrics-aggregator.indexer.hydration.cloud/api/v1/fees/charts`

**Packages:** `@galacticcouncil/indexer 0.0.0 (workspace)`; `@galacticcouncil/main 0.0.0 (workspace)`; `@tanstack/react-query 5.101.4`; `big.js 6.2.2`

**Deadline:** No whole-operation deadline. response.json may hang indefinitely. **Retry:** Consumer-specific React Query policy applies after rejection, never while hung. **Cancellation:** No AbortSignal supplied. **Cache:** React Query same-key cache retained; no freshness indicator unless noted.

**Failure and recovery behavior:**

- request Hang: Pending indefinitely.
- body Hang: response.json may hang indefinitely.
- warm: React Query same-key cache retained; no freshness indicator unless noted.
- recovery: Query lifecycle only unless explicit interval noted.
- outage: No effect on the current UI from this unused export/helper. Offsite explorer links may independently fail.

**Existing protections:** Newactivefeesquery isseparateNeckwork entry

**Recommended change:** Remove unused exports or document resilience requirements before activating them.

**Source:** [apps/main/src/api/stats.ts:31](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/stats.ts#L31), [apps/main/src/api/stats.ts:171](https://github.com/galacticcouncil/hydration-ui/blob/19f54bf5bde252a407e23e7ce3e4a8f6e3992182/apps/main/src/api/stats.ts#L171)

## Sources

- [Audit scope and browser verification](report.md).
- Hydration UI codebase and SDK codebase.
- [Exact source and artifact provenance](evidence/source-provenance.json).
