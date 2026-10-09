# Fresh Lark-4 UI configuration and wallet validation

This update prepares [UI PR #3978](https://github.com/galacticcouncil/hydration-ui/pull/3978)
for the fresh Propeller contracts deployed on Lark-4 on October 5, 2026. It does
not change mainnet contracts. The contract workstream owns deployment, governance,
bootstrap, keeper operation and arbitrage bots.

The fresh native-wallet lifecycle passed on chain using the public test fixture:
binding, exact token approvals, both deposits, both withdrawal requests and both
claims produced eight finalized native extrinsics. Deposits added exactly
0.01 ETH and 0.0001 tBTC to pooled collateral awaiting deployment while each
vault's HOLLAR debt stayed zero. The keeper was deliberately off throughout this
rehearsal. This is actual chain execution, with injected test signing rather than
a real extension's approval screens.

## Deployment configuration

The deployment manifest supplied by that workstream identifies runtime 443 and
genesis `0xba82f5b6d812fd3e2a6c610969e395d3be1e558145a9f07148b8d1f269ab4fb2`.
Both `https://4.lark.hydration.cloud` and
`https://node4.lark.hydration.cloud` returned that genesis during preparation.
The deployment uses contract commit `9828ffd6257293fe40ef99da41e4a1b8d058e3c7`.

| Configuration | Fresh value |
| --- | --- |
| Source | `0x7016805f0f1ab369a1e308038db22eefe3d4b49f` |
| ETH vault (asset 34) | `0x40cca3da6cead6dada9e9ffc4c06e9039791876a` |
| tBTC vault (asset 1000765) | `0x5b153c8e24ca62436ef836a1f179dd8ade2d5acd` |
| First vault deployment / history start | `415383` |
| ETH Main ledger | `0x59ba6340a85e311f8f43071372de1d0f5fb90dc4` |
| tBTC Main ledger | `0xe0983cedd797b38090e6dcde54af88aa6eb22edc` |
| Controller | `0x7e7a0e795e14a11e62b20efaec48407003bfdc8f` |
| Harvester | `0xb7b759dbfe611c61d456f3d4c670a74b79853213` |

Only the source and two vault addresses are hardcoded in the UI. Main debt,
yield ownership and fee controllers are discovered from each vault. Keeper
controller and harvester addresses are not part of a user's deposit transaction.
The mirrored Pool, HOLLAR and PRIME addresses were independently verified by the
contract workstream and remain unchanged.

The intended preview is
[the edge PR preview](https://deploy-preview-3978--edge-hydra-app.netlify.app/strategies/propeller).
Its production provider list already selects `node4.lark`. The production default
RPC is now the same endpoint, so a failed initial provider probe does not fall
back to a mainnet RPC. The separate `testnet-hydra-app` preview uses the development
environment's Nice/Paseo providers and is not the Lark preview. Lark retains the
fork's mainnet asset IDs and metadata environment; that does not mean transactions
target mainnet. The actual endpoint and genesis identify the network.

On future redeployment, obtain a verified manifest first, then update
`SUBLOOP_ADDRESS` and `VAULT_DEPLOY_BLOCK` in `constants.ts` and both vault addresses
in `config/vaults.ts`. The history start is the earliest vault proxy deployment,
not the source implementation deployment. Refresh the browser after switching
deployments so previous session caches and wallet selections are discarded.

From `apps/main`, run the read-only configuration check before publishing:

```sh
node tests/propeller-deployment.mjs /path/to/verified-lark-manifest.json --require-ready
node tests/propeller-abi.mjs /path/to/money-market/propeller-vault/out-production
```

The deployment check compares genesis, configured addresses, runtime code
presence, collateral/source/pool/ledger/yield/fee bindings, capability and history
start. It pins vault reads to one block and requires bootstrap, funding, pause,
deleveraging and capacity conditions to permit deposits. Its initial run correctly
rejected the new vaults while `mainDebt` was still unset. Governance/bootstrap
readiness must be confirmed before this configuration is pushed to the preview.
The strict check passed at block 415678 after bootstrap. Temporary deployer admin
rights were revoked at block 415679 (referendum 425), and the contract workstream
confirmed readiness for this UI update.

## Wallet fixes and regression checks

The native transaction wrapper could prepend `bind_evm_address` to an approval
batch that Propeller had already prepared with binding. It now recognizes a
leading binding call and keeps that batch unchanged. Ordinary calls and batches
without binding still receive it exactly once. The regression reproduced the
duplicate before the fix.

The Ethereum signer previously switched its read client to the SDK's default
Hydration endpoint. That could read mainnet gas, nonces and receipts while the UI
was connected to Lark, and changing between forks with the same EVM chain ID did
not refresh the client. It now rebuilds the read client on the selected RPC for
each selection and restores the normal provider when there is no override.
Wallet network metadata offers only the selected RPC when one is specified;
mainnet defaults are not supplied as fallback endpoints for a selected fork.
The regressions reproduced both wrong-endpoint reads and the fallback list before
the fixes. User rejection of network selection still stops the flow.

The wallet package now runs its six regression tests in the ordinary workspace
test command, using the Vitest version already present in the lockfile. The main
application has three additional native transaction tests. These are deterministic
composition/provider tests; they are not evidence of a browser-wallet signature
or on-chain transaction.

## Actual wallet lifecycle rehearsal

Use dedicated funded test accounts. For an EVM wallet, confirm its selected RPC
is the same Lark endpoint; Lark and mainnet share an EVM chain ID, so the displayed
chain ID alone is insufficient. Record transaction hashes and contract balances
from the Lark RPC for each executed step.

| Step | Expected behavior and evidence |
| --- | --- |
| Open the fresh preview | ETH/tBTC addresses and genesis match the manifest; vaults expose `deferredDeployment() == true` and show funded assets separately from pending deployment. |
| Fresh native account approval | One wallet transaction contains exactly one binding followed by approval to the vault. Approval confirms before deposit simulation and does not close the deposit form. |
| Bound account / existing allowance | Binding is omitted for a bound account; sufficient allowance also skips approval. Cancelling approval stops the flow. |
| Funded deposit | The subsequent transaction calls `deposit(assets, owner)` directly. Shares and collateral increase without synchronous borrowing or swaps. Pooled `reinvestAssets` increases; no individual deployment queue is promised. |
| Keeper deployment | A later bounded keeper action changes debt/source exposure and reduces pending collateral as appropriate. Zero pending collateral does not claim the source's own ramp is complete. |
| Harvest and earnings claim | Source value awaiting conversion stays an estimate. Converted earnings are funded shares; claiming them adds shares to the holder's position. Earlier yield rights remain visible after ordinary shares are withdrawn. |
| Withdrawal before deployment | A funded position can enter the usual withdrawal queue even before strategy deployment. The configured cooldown still applies. |
| Withdrawal after deployment | The row progresses through cooldown, unwind, partial settlement and final settlement using current contract state. Claiming released collateral updates the position without implying that outstanding HOLLAR recovery has finished. |
| Later source recovery | A remaining Main-ledger surplus is claimable through `claimSurplus(requestId)` after the ordinary collateral withdrawal, when the contract reports a nonzero surplus. |
| Pauses, unavailable reads or changed capacity | Deposits remain disabled or simulation fails without sending a replacement swap/controller transaction. Existing approval does not imply deposit success. |

The read-only preflight, unit tests and browser rendering checks must be reported
separately from this actual signing/settlement rehearsal. Keeper/arb readiness and
economic performance are validated by the contract and operations workstreams.

### Dedicated public native-wallet fixture

`apps/main/tests/propeller-public-test-wallet.mjs` injects a PJS-compatible wallet
into a fresh local Playwright context. It uses only the public derivation
`//Alice//propeller-ui-20261005`, never a user wallet or a secret supplied by a user.
Its address is `7JhCD49j1XBtdh959n5vHHnXL1XzQzSEYnXwbH98bJR96gK4`, with EVM mapping
`0x3088c164994890ea0e444bf53623ccac3b307217`.
The account is public test infrastructure and must never hold valuable funds.

The fixture is outside `src`, is not imported by the product, and only injects
into `http://127.0.0.1:4178`. Signing requires the explicit
`--sign-lark-public-account` flag in the lifecycle runner. The signing bridge checks
the account, Lark genesis, allowed contract destinations, supported calls,
receivers, native HDX fee selection and a small per-run request limit. Raw message
signing is disabled. This exercises actual native transaction signatures through
the app but does not test a real extension's permission or confirmation screen.

Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` to a local Playwright installation and
Chromium executable. `POLKADOT_MODULE_ROOT` points to a separate test-tools
directory containing `@polkadot/api`, `@polkadot/keyring`, and
`@polkadot/util-crypto` (validated with versions 15.10.2, 13.5.9 and 13.5.9);
these are not added to product dependencies. Serve the
production build on port 4178, then run from the repository root:

```sh
node apps/main/tests/propeller-wallet-lifecycle.mjs connect
node apps/main/tests/propeller-wallet-lifecycle.mjs cancel-approval ETH 0.01 --sign-lark-public-account
node apps/main/tests/propeller-wallet-lifecycle.mjs cancel-deposit ETH 0.01 --sign-lark-public-account
node apps/main/tests/propeller-wallet-lifecycle.mjs deposit ETH 0.01 --sign-lark-public-account
node apps/main/tests/propeller-wallet-lifecycle.mjs deposit tBTC 0.0001 --sign-lark-public-account
node apps/main/tests/propeller-wallet-lifecycle.mjs withdraw ETH 0.001 --sign-lark-public-account
node apps/main/tests/propeller-wallet-lifecycle.mjs claim ETH --sign-lark-public-account
```

`REPORT_PATH` saves a JSON report with browser content, signing requests, pinned
before/after balances, signed extrinsics and their chain events. The deposit
scenario checks the deposited assets, minted shares and exact wallet debit while
keepers run. Add `--keeper-idle` only when keepers are held off; it also requires
unchanged debt and an exact increase in pooled pending collateral. Claims require
a settled withdrawal; a cooldown reaching zero alone does not make the claim
available. `withdraw ETH --max` or `withdraw tBTC --max` checks the full-exit
sentinel and zero remaining funded balance. The runner's default action is
read-only.

The current fixture targets Lark 0 and checks its genesis before signing. The
October 5 addresses and results below describe the earlier Lark 4 rehearsal.
For the current page check, `UI_URL` selects a local or deployed preview, and
`--require-ready` verifies both vault reads, the Lark 0 RPC, enabled deposits and
the desktop/mobile disclosure tooltips.

## Completed validation passes

1. Reproduced duplicate native binding before the fix, then passed all three
   composition regressions. The live fresh-account approval later emitted exactly
   one `evmAccounts.Bound` event.
2. Reproduced the EVM signer's wrong read endpoint and same-chain-ID refresh bugs,
   then passed six wallet regressions. A frozen-lockfile install succeeded without
   a lockfile change or a new product dependency.
3. Matched 45 functions and four events to the London production artifacts,
   installed the verified fresh addresses/history start, and checked deployment
   readiness against the actual Lark RPC. An incomplete ledger binding initially
   failed closed; the completed deployment passed.
4. Ran the actual browser cancellation, approval and deposit sequence. The first
   funding attempt correctly displayed insufficient spendable balance: Lark's
   circuit breaker had reserved the governance-minted test collateral. The
   contract workstream released exactly that fixture reserve at block 415735
   (referendum 426), preserving total funding and the normal safeguards. No product
   binding change was made to work around this fixture issue. Approval cancellation
   submitted nothing. Cancelling the next deposit preserved its completed exact
   allowance, and retrying used a single deposit call with no repeated approval or
   binding. Both collateral deposits left debt at zero.
5. Requested and claimed withdrawals from both vaults through the browser. Both
   requests had ID 0 and remained separate in the UI. A small-amount display issue
   found during this pass was fixed: collateral TVL/capacity use normal token
   precision rather than the two-decimal compact currency formatter, which had
   produced malformed tiny tBTC text. Withdraw/claim controls now include the asset
   in their accessible names. Production desktop/mobile checks, TypeScript, ESLint,
   Vite and the 75-test workspace suite passed.

The eight actual native extrinsics below finalized, with no failed EVM/system
events. Amounts in the claim rows are collateral base units (18 decimals).

| Action | Block | Native extrinsic hash |
| --- | --- | --- |
| Bind native account and approve 0.01 ETH | 415744 | `0x3a20251ca089ec62730ca7d76e2cf8464933e33727bc6da15f812f435f4c25d6` |
| Deposit 0.01 ETH using existing allowance | 415756 | `0xaf50eaa63affa2b76596563492ac1d0e4e9d073a26fd77f498eeef1fef324773` |
| Approve 0.0001 tBTC | 415764 | `0x37a86664c898264853ddb34294007ab2f7193fddc471ba326201498dc1824f6b` |
| Deposit 0.0001 tBTC | 415765 | `0x29c733e1b6a713e6a11605e3d473a3057a917262e018f785896fdcabd9f27592` |
| Request 0.001 pETH withdrawal, ETH request 0 | 415784 | `0x9852d15ceda1dd01845271b325ed1dc1489ec1a5d16f18e8bdf0e1ac7d960b34` |
| Request 0.00001 ptBTC withdrawal, tBTC request 0 | 415793 | `0x2b40f6b44c70daf796b8c66c12b6bea7385894735778698f66785afbf123fdf2` |
| Claim 1,000,000,035,601,841 wei ETH | 415810 | `0x6b0a15ae84f6d1964d9e49ac15265d60bcd2948bb0ef88415a49626766d4aff0` |
| Claim 10,000,000,013,655 wei tBTC | 415819 | `0xa48c78a713d79fe0a7a2f96059929306bbb6801b40f134a8342efecec33698b5` |

ETH deposited shares were `9999999769954880`; tBTC deposited shares were
`99999999906026`. Their slight difference from the input amounts reflects the
vault's then-current funded collateral exchange rate. Pending deployment increased
by exactly the asset inputs, and both Main debts stayed zero. Claim amounts exactly
matched the emitted `Claimed` events and the recipient's native/ERC20 balances.

The contract workstream started and settled the two withdrawals after the 60-second
test cooldown with strategy deployment disabled. These parent-workstream keeper
actions are separate from the eight browser-signed user extrinsics.

Evidence is archived under `docs/evidence/propeller-ui-lark-2026-10-05/` with source
and capture hashes. Browser rendering checks cover widths 1280 and 390, real reads
to both configured vaults, the Lark endpoint, zero runtime errors and no horizontal
overflow beyond a one-pixel desktop rounding difference. Existing large-chunk
warnings remain. The optional native bigint module fell back to its JavaScript
implementation in unit tests.

Real extension permission screens, a real EVM-wallet signature, funded yield
claims, partial/underfunded settlement and later HOLLAR recovery were not exercised
in this live rehearsal. Their deterministic UI/contract coverage is separate.
The EVM extension must use the selected Lark RPC; matching its chain ID alone is
insufficient. Keeper execution, arbitrage behavior and economic performance remain
the contract/operations workstream's evidence. No mainnet address or parameter was
activated by this UI update.

## Lark 0 verification — 9 October 2026

rechecked draft PR #4127 at `0f21548243e749851713b8211ac223235450d23d`
(`feat/juicer-next` → `master`) against the new Lark 0 deployment. both RPCs
reported genesis
`0x0be0149961bbb0a547d7cda66e0d973e9ef37a7dd4744041b52739d738778878`.
the manifest, deployment block 123, collateral assets, vault/source/debt bindings,
51 ABI functions and four events matched. both vaults accepted deposits; neither
was paused or under deficit stop at block 4680.

the direct `node0.lark` endpoint intermittently stopped and reinitialized its
`chainHead` subscriptions during startup. the asset registry then failed with
`AaveTradeExecutor.pools[pools] stalled at …`; retries kept using the old block.
the production provider list now selects `wss://0.lark.hydration.cloud`, whose
legacy RPC adapter avoided this failure. ten successive starts passed with the
final build: five clean sessions and five with the previous endpoint saved in
automatic mode. scripts continue using the direct RPC for independent reads.
manually pinned endpoints remain a user setting.

the browser runner now opens the actual desktop/mobile disclosure controls,
can require deposit readiness, checks Max calldata, and supports active keepers.
it collects transaction evidence after finality: the ETH Max transaction moved
from its initially observed block hash before finalization, but exists and
succeeded in the canonical block. its finalized event and calldata were checked
independently.

the public native-wallet fixture exercised cancelled approval, cancelled deposit
after exact approval, both collateral deposits, a partial tBTC withdrawal, and
Max exits from both vaults. the last Max exit used the proxy in the final build.
all seven submitted user extrinsics below finalized successfully.

| action | block | native extrinsic hash |
| --- | --- | --- |
| bind and approve 0.001 ETH; cancel deposit | 4536 | `0x60c396cd1468032c6cc3453d7dd8a08c538c8a00716915d5b2f617d9d202ecbe` |
| deposit 0.001 ETH using existing allowance | 4546 | `0xfff65a184fe526abc7212bf65c0d60e458e1fc859e2cb6ecfd807138b03a2d55` |
| Max ETH withdrawal, request 0 | 4575 | `0x1f3677531dde3560c35e52dd10db436b77b9b551cd64f0e4f00346cb7481ebbd` |
| approve 0.0001 tBTC | 4600 | `0x1542f9ea9dc2ccc3ef6b42168b919d13d50ec1dcd6aaa145ef8b9b02cae76870` |
| deposit 0.0001 tBTC | 4602 | `0xa8fda8e809ba6a173150e144ec6d0bb6a5d299db00048a171a87c0da127ba2fd` |
| partial tBTC withdrawal, request 0 | 4616 | `0xec0e321fe68e77eaf2099b1dc120bfd8755289f32a57f80f609b6e1cb083038e` |
| Max tBTC withdrawal, request 1 | 4677 | `0x828684ec5d0713c013b6f79b9fbd4e12408e9b0ee23ce06ffda31e2924f9f7f8` |

keepers settled and delivered the withdrawals. the first payouts were
`1000000001227829` wei ETH and `10000000346762` tBTC base units. a connected
browser also observed the last withdrawal change from Claim to Claimed during
its normal refresh. a separate manual-claim attempt submitted nothing because
keeper delivery had already removed the claim action. native/ERC20 collateral
balances and proxy/direct funded balances matched at the same finalized block.

final checks: 124 unit tests, workspace ESLint/TypeScript, production build,
desktop (1280) and mobile (390) live reads, enabled deposits and disclosure
checks passed. both viewports had zero uncaught page errors and no horizontal
page overflow. the running app was inspected visually at both widths. existing
bundle-size and persisted-store migration warnings remain.

evidence is in `docs/evidence/propeller-ui-lark-2026-10-09/`. the RPC selection
and runner fixes are included in this update. validation used the local
production build; the published edge preview was still on the original direct
endpoint during capture. this pass used an injected public native signer, not
real extension prompts or an EVM wallet. manual claiming and
deficit/partial-settlement recovery were not completed live in this pass;
keeper delivery remained enabled throughout.
