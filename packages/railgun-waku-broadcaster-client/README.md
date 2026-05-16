# @galacticcouncil/railgun-waku-broadcaster-client

Vendored fork of
[`Railgun-Community/waku-broadcaster-client`](https://github.com/Railgun-Community/waku-broadcaster-client)
(MIT, upstream version `9.1.0`).

We vendor because:

1. The upstream package is **not published on npm** (the registry returns 404
   for `@railgun-community/waku-broadcaster-client`).
2. Even at source, the discovery loop in `@railgun-community/shared-models`
   gates broadcaster fee lookups on the `Network.relayAdaptHistory` array, and
   there is **no entry for Hydration** (chain id `222222`). We patch
   `networkForChain` locally via `./src/shared-models-shim.ts` so a chain id
   of `222222` on `ChainType.EVM` returns the Phase 0 RAILGUN deployment
   addresses (`networks.ts` in `sections/privacy/utils`).

## What is vendored

Only the discovery + Waku transport surface of the `web` build:

| Subdir | Purpose |
| --- | --- |
| `src/waku/` | Light-node + DNS/peer-exchange discovery (web build). |
| `src/fees/` | Broadcaster fee announcement cache (`BroadcasterFeeCache`). |
| `src/search/` | Find-best-broadcaster heuristics. |
| `src/status/` | Connection-status enum + helpers. |
| `src/filters/` | Address allow/block list. |
| `src/models/` | `BroadcasterConfig` + Waku shard/relay topic helpers. |
| `src/utils/` | Debug, conversion, util predicates. |

**What is intentionally NOT vendored:**

- `src/transact/broadcaster-transaction.ts` — depends on
  `@railgun-community/wallet` for `getRailgunWalletAddressData`,
  `encryptDataWithSharedKey`, `getCompletedTxidFromNullifiers`. We do not
  install that package today (we use `@railgun-community/engine` instead). The
  encrypted-transact path lands in a follow-up phase once we either depend on
  `@railgun-community/wallet` or re-implement the same ECIES + AES-GCM dance
  against `@railgun-community/engine`. Until then, when a broadcaster is
  selected, `BroadcasterProvider.broadcastTransaction()` falls back to
  self-relay with an inline note.

## Patches relative to upstream

1. `src/shared-models-shim.ts` — re-exports the real
   `@railgun-community/shared-models` but overrides `networkForChain` so that
   `{ type: ChainType.EVM, id: 222222 }` resolves to the Hydration Phase 0
   deployment (proxy/relayAdapt come from
   `sections/privacy/utils/networks.ts`).
2. All `from '@railgun-community/shared-models'` imports inside vendored
   sources are rewritten to `from './shared-models-shim.js'` (or the relative
   equivalent) so the patched `networkForChain` is used.
3. `setup` postinstall + `patch-package` postinstall stripped.

## Update flow

When upstream ships a new version:

```sh
cd /tmp && git clone --depth 1 https://github.com/Railgun-Community/waku-broadcaster-client.git
diff -ruN /tmp/waku-broadcaster-client/packages/common/src \
  /home/mrq/git/hydration-ui/packages/railgun-waku-broadcaster-client/src \
  | review
```

Then re-apply the shim rewrite (or update this README's patch list).
