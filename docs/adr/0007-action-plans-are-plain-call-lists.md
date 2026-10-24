# An action plan is an ordered list of plain calls — no approvals, no permits

v1 carries a substantial approve-vs-permit state machine in
`useTransactionHandler.tsx`, plus an `ApprovedAmountService`, a
`walletApprovalMethodPreference` setting, and permit-signing helpers. Almost
none of it runs.

Three facts collapse it. **Approvals are not required on Hydration** — and the
production code already assumes this: `SupplyActions.tsx:84` hardcodes
`requiresApproval = false` with the real check commented out. **Permits are not
the builder's decision**: `isValidTxOptionsForPermit` gates on
`chainKey === HYDRATION_CHAIN_KEY && feeAssetId !== NATIVE_EVM_ASSET_ID`, so
paying gas in a non-native fee asset routes *any* EVM call through the permit
and substrate-dispatch path, whatever the builder produced. And **the app
already consumes call arrays**: `BorrowContextProvider.createTx` wraps each
element with `transformEvmCallToPapiTx` and hands the batch to
`useCreateBatchTx`.

So `money-market-v2` builds an **ordered list of plain EVM calls** and models
nothing else. No approval step, no allowance read, no permit concept, no step
kinds or prerequisite discriminants. Each call carries `to`, `data`, the viem
`Abi` item with its `functionName` and `args`, and optional per-action gas
hints. Because the calldata is produced by `encodeFunctionData`, the ABI is
known at construction — which retires v1's selector-sniffing
(`convertTx.ts:11`), where the ABI had to be recovered by matching method-hash
prefixes because ethers' `PopulatedTransaction` discarded it.

Amounts use Aave's `MAX_UINT_AMOUNT` sentinel for "max", passed through by
callers as the contracts expect, rather than being resolved to an exact balance
that would race with interest accrual between planning and submission.

## Consequences

**This assumes approvals are never required on any Hydration market.** The
assumption is the protocol team's, corroborated by the hardcoded
`requiresApproval = false` in shipping code. If a market ever needs an ERC-20
approval, this decision must be revisited deliberately — the plan shape supports
it (prepend a call) but nothing in v2 will detect the need, because no allowance
is ever read.

**Gas hints apply only at signing.** The app live-estimates for fee display via
`rpc.evm.estimateGas` and ignores the hint there; `EthereumSigner` uses it as an
override only when submitting. A hint of `0n` is falsy and already means
"absent".
