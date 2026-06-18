# XcSwap — Handoff

Cross-chain swap section under `trade/swap`.
The UI is built and navigable; everything behind it is **dummy
data and a no-op submit**. The job for the next session is to replace those seams
with real cross-chain data and a real transaction submission.

All paths below are relative to this directory unless noted.

## What's wired and working

**Provider** (`XcSwapProvider.tsx`) — this is the brain of the section:
- Creates `XcSwapContext`, wraps children in `<FormProvider {...form}>` from
  `useXcSwapForm()`.
- `useXcSwap()` exposes: `sourceChainAssetPairs`, `destChainAssetPairs`, `userData`
  (all from `data/mock.ts`), `alerts` (from `useXcSwapAlerts()`), `isLoading: false`
  (hardcoded), and `onSubmit`.
- **`onSubmit` is a stub:** `(values) => console.log(values)`. This is the main
  thing to replace.

**Architecture intent — keep all logic in the provider.** `XcSwapProvider` is
where business logic belongs: data fetching (chains/assets/balances), quote/route
queries, fee computation, alert derivation, the submit mutation, and any derived
state. The section components (`XcSwap`, `XcSwapFields`, `XcSwapSummary`,
`XcSwapAlerts`, `XcSwapSwitcher`) should stay **presentational** — they read
values out of `useXcSwap()` and `useFormContext()` and render. When you add real
behavior, add it to the provider and expose the result as a new field on
`XcSwapContextValue`, then consume it in the relevant component. Don't push
queries/mutations or cross-field computation down into the leaf components. The
form is shared via `FormProvider`, so any consumer can read/write fields with
`useFormContext<XcSwapFormValues>()` without prop-drilling.

**Form + validation** (`lib/useXcSwapForm.ts`):
- `useForm` with `mode: "onChange"`, `standardSchemaResolver(schema)`, `zod/v4`.
  `onChange` means the zod schema runs on every keystroke/field change, so
  `formState.isValid` and field errors stay live — that's what `XcSwap.tsx` reads
  to drive the submit button's enabled/label state.
- Fields: `srcChain`, `srcAsset`, `srcAmount`, `destChain`, `destAsset`,
  `destAmount`, `destAddress`. The chain/asset fields hold the full `XcChain` /
  `XcAsset` objects (or `null`), not ids; the amount/address fields are strings.
- Validation is a single zod object. Reusable rules come from
  `@/utils/validators`:
  - `requiredObject<T>()` — the four chain/asset fields; fails when `null`.
  - `positive` — `srcAmount` and `destAmount`; must be a positive numeric string.
  - `required` — `destAddress`; non-empty.
- **Cross-field rule via `.superRefine`:** `destAddress` is additionally validated
  against the *selected destination chain* — it calls
  `destChain.addressValidator(destAddress)` and attaches a custom error to
  `destAddress` on failure. This is the seam where per-chain address formats
  plug in. Today every `addressValidator` is
  `nonEmpty` (`addr.trim().length > 0`), so it only catches blanks. Use
  `.superRefine` (not per-field refinements) for any rule that depends on more
  than one field — e.g. "amount ≤ balance", "amount ≥ minimum bridge amount",
  "source ≠ destination".
- **Re-validation on dependency change:** because validity depends on cross-field
  state, when a field that another field's rule reads changes, call
  `form.trigger("dependentField")` so the error/`isValid` update immediately
  (e.g. after changing `destChain`, trigger `destAddress`). Wire these in the
  provider (e.g. a `watch` subscription or in the selection handler).

**Fields** (`XcSwapFields.tsx`):
- Two `XcChainAssetSelectFormField` rows (From / To) + an `AddressBookFormField`
  for `destAddress`.
- **From row** drives `srcChain`/`srcAsset`/`srcAmount`; `maxBalance` and a `$`
  display come from `userData`. Its `onAmountChange` currently mirrors the typed
  amount into `destAmount` (`setValue("destAmount", amount, …)`) — a placeholder
  standing in for a real quote.
- **To row** drives `destChain`/`destAsset`/`destAmount`; `disabledInput`,
  `hideMaxBalanceAction`, `maxBalance="0"` — i.e. the dest amount is not
  user-editable, it's whatever the (currently fake) quote sets.
- Address field: real `@/form/AddressBookFormField` + a `Modal` containing the
  real `AddressBookModal` from `@galacticcouncil/web3-connect`; selecting a
  contact `setValue("destAddress", …)`. This is fully functional, not a stub.
- `ChainLabel` (local) renders the chain logo + name above each row using `XcLogo`.

**Selector** (two layers under `components/`):
- `XcChainAssetSelect/` — the RHF integration layer.
  - `XcChainAssetSelectFormField<TFormValues>` wires three `useController`s
    (chain/asset/amount) to field names passed by the parent, and forwards
    asset/amount errors. Generic over the form-values type via
    `FieldPathByValue`.
  - `XcChainAssetSelect` — presentational: wraps `@galacticcouncil/ui`'s
    `AssetInput` and opens `ChainAssetSelectDialog`. Shows the selected asset's
    `XcLogo` + symbol.
- `ChainAssetSelect/` — the dumb picker copied and stripped from the xcm module.
  - `ChainAssetSelectDialog` / `ChainAssetSelectContent` — left rail = chain list,
    right = asset list, with two local `useState` search filters (chains, assets).
    No "All Chains" row, no account/balance/SDK coupling. One chain is always
    selected (`pendingChain`). Asset balances are read straight off the static
    `XcAsset` fields.
  - `ChainList`, `AssetList`, `AssetListItem(.styled)`, `ChainAssetSelectButton(.styled)`,
    `XcLogo`, `index.ts` (barrel).

**Alerts** (`XcSwapAlerts.tsx` + `lib/useXcSwapAlerts.ts`):
- **Designed to grow.** `useXcSwapAlerts` returns `XcSwapAlert[]`
  (`{ key, message, severity: "error" | "warning" | "info" }`), and `XcSwapAlerts`
  just maps over them rendering one `Alert` each — so adding alerts is purely a
  matter of pushing more entries from the hook. Likely future ones: amount above
  balance, below the bridge minimum, destination chain temporarily unavailable,
  no route/quote found, network/RPC error. Note that `XcSwap.tsx` blocks submit on
  **any** alert (`!alerts.length`); if you want non-blocking `info`/`warning`
  alerts that still allow submit, change `canSubmit` to only block on
  `severity === "error"`.

**Switcher** (`XcSwapSwitcher.tsx`): the ↓ arrow is rendered `disabled` and shows
"Exchange rate not available". Static placeholder for now.

**Summary** (`XcSwapSummary.tsx`): a single `SummaryRow` "Total fees" with content
`"-"`. Static placeholder for now.

## Dummy data (`data/mock.ts`)

> **These shapes are placeholders, not a contract.** Everything in `mock.ts` —
> the `XcAsset`/`XcChain`/`XcChainAssetPair`/`XcUserData` types *and* the values —
> exists only so the UI renders something. They're loosely modelled on what a
> cross-chain swap probably needs, but nothing depends on them being final.
> When you wire real data, feel free to add/rename/drop fields (e.g. split
> `userData` into per-row balances, add `minAmount`/`feeEstimate`, carry a real
> chain id or ecosystem enum, attach the route/quote). The consuming components
> are few and local — update them alongside. Treat `mock.ts` as the one file to
> delete/replace, not a spec to preserve.

Current local types, deliberately decoupled from `@galacticcouncil/xc-core`:
- `XcAsset` = `key, symbol, name, decimals, logo, balance, balanceUsd`.
- `XcChain` = `key, name, logo, addressValidator: (addr) => boolean`.
- `XcChainAssetPair` = `{ chain, asset }`.
- `XcUserData` = `{ sourceBalance, sourceUsd }` (only two values today).

Exports: `sourceChainAssetPairs`, `destChainAssetPairs`, `userData`.
Logos are CDN URLs (jsdelivr asset-metadata for HDX,
coinmarketcap for the rest as placeholders, and should be solver differently).

## How to wire real submission (mutation + createTransaction)

The canonical pattern lives in `sections/Market/lib/useSubmitSwap.ts` — copy its
shape. The store at `@/states/transactions` owns signing, toast lifecycle, and
on-chain tracking; your job is only to **build the tx and hand it to
`createTransaction`**.

### Step 1 — add a new `XcSwap` transaction meta type

Don't reuse `TransactionXcmMeta`. A cross-chain swap is its own thing (it's a swap
*and* a bridge), and the transactions store branches on `meta.type` for toasts,
icons, tracking, and progress UI — so it needs its own discriminant. Add to
`apps/main/src/states/transactions.ts`:

1. Extend the enum (`transactions.ts:25`):
   ```ts
   export enum TransactionType {
     Onchain = "Onchain",
     Xcm = "Xcm",
     EvmApprove = "EvmApprove",
     XcSwap = "XcSwap",            // new
   }
   ```
2. Add the meta type next to `TransactionXcmMeta` (`transactions.ts:101`). Start
   from the XCM meta and add the swap-specific props — these are the **new meta
   props associated with XcSwap** (subject to change), refine as the real flow firms up:
   ```ts
   export type TransactionXcSwapMeta = TransactionMetaCommon & {
     type: TransactionType.XcSwap
     // source (Hydration) side
     srcChainKey: string          // inherited from TransactionMetaCommon
     srcAssetSymbol: string
     srcAmount: string
     srcChainFee: string
     srcChainFeeSymbol: string
     // destination (cross-chain) side
     dstChainKey: string
     dstAssetSymbol: string
     dstAmount: string            // quoted out-amount
     dstAddress: string           // recipient on the destination chain
     dstChainFee?: string
     dstChainFeeSymbol?: string
     // routing/provider info for tracking + tags
     tags: XcmTags
   }
   ```
3. Add it to the `TransactionMeta` union (`transactions.ts:115`):
   ```ts
   export type TransactionMeta =
     | TransactionOnchainMeta
     | TransactionXcmMeta
     | TransactionErc20ApproveMeta
     | TransactionXcSwapMeta       // new
   ```

### Step 2 — the submit mutation

Add `lib/useSubmitXcSwap.ts`:
```ts
export const useSubmitXcSwap = () => {
  const { sdk } = useRpcProvider()              // @/providers/rpcProvider
  const { account } = useAccount()              // @galacticcouncil/web3-connect
  const { createTransaction } = useTransactionsStore() // @/states/transactions
  const { t } = useTranslation([...])

  return useMutation({
    mutationFn: async (values: XcSwapFormValues) => {
      // build the cross-chain swap tx from values + sdk
      await createTransaction({
        tx: builtTx.get(),
        meta: {
          type: TransactionType.XcSwap,           // the new meta
          srcChainKey, srcAssetSymbol, srcAmount, srcChainFee, srcChainFeeSymbol,
          dstChainKey, dstAssetSymbol, dstAmount, dstAddress,
          dstChainFee, dstChainFeeSymbol,
          tags,
        },                                        // TransactionXcSwapMeta
        toasts: { submitted, success, error },
        alerts: [],
      })
    },
  })
}
```
- `createTransaction(transaction, options?)` — store impl at
  `apps/main/src/states/transactions.ts:191` / `:207`.
- Single-tx input shape = `SingleTransactionInput` (`tx` is a required
  `AnyTransaction`; `.get()` on a built SDK tx yields it — see Market).
- `XcmTags` / `BRIDGE_PROVIDER_TAGS` are defined in `transactions.ts` if you need
  bridge tags for tracking.

### Step 3 — wire it into the provider

In `XcSwapProvider.tsx`: call `useSubmitXcSwap()`, set
`onSubmit = (values) => mutation.mutate(values)`, and replace the hardcoded
`isLoading: false` with `mutation.isPending`. The context type already has both
slots — no signature change. Keep this here (not in the components) per the
"all logic in the provider" intent above.

### Step 4 — UI

`XcSwap.tsx` needs no change for submit itself, but you'll likely want to feed
`isLoading` into the button (`disabled`/spinner). See `Market.tsx` for how
`useSubmitSwap`'s pending state drives the UI.

## Seams to replace (dummy → real), in order of impact

1. **`onSubmit` stub** → `useSubmitXcSwap` (above). Highest priority.
2. **`data/mock.ts`** → real chain/asset registry + live balances. Keep the local
   type boundary or widen it deliberately; the whole section depends on these
   shapes.
3. **`destAmount` mirror** in `XcSwapFields.tsx` `onAmountChange` → a real
   quote/route query that sets the destination amount and fees.
4. **`XcSwapSummary`** "Total fees: -" and **`XcSwapSwitcher`** "Exchange rate not
   available" → real fee/rate data.
5. **`XcChain.addressValidator`** (`nonEmpty`) → real per-chain address
   validation.

## Validate

After changes:
```
yarn lint
```
