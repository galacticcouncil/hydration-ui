# Coding standards

How code is written in this repo. Most rules name a file that already follows them; compare the change against that file. `yarn lint` decides formatting and import order.

These standards describe new and changed code. Where older code differs, follow the standard. In review, fix what the change introduced and list older deviations in the same files separately.

## Files

- **One component per file, named after it.** Its siblings share the name and add a role suffix: `Name.styled.ts` for styled components, `Name.utils.ts` for helpers, `Name.form.ts` for the schema and form hook, `Name.columns.tsx` for table columns, `Name.test.ts` for tests, `NameSkeleton.tsx` for the loading placeholder. For any other role, reuse a suffix already present in the module (`apps/main/src/modules/trade/otc/place-order/`).
- **Features live in `apps/main/src/modules/<feature>/`.** The page component is `<Name>Page.tsx`, and its route file in `apps/main/src/routes/` only mounts it and sets the page meta (`apps/main/src/routes/staking/index.tsx`).
- **Shared code has a fixed home.** Chain, SDK and indexer access goes in `apps/main/src/api/`, components used by several modules in `apps/main/src/components/`, app-wide stores in `apps/main/src/states/`.
- **Imports.** `@/...` inside `apps/main`, the package name across workspaces (`@galacticcouncil/ui/components`), `./Name` for a file in the same directory.
- **A `packages/ui` component is a directory** with `<Name>.tsx`, `<Name>.styled.ts`, `<Name>.stories.tsx` and an `index.ts` that re-exports them (`packages/ui/src/components/Button/`). A new prop or variant comes with a story that shows it.

## Components

- **Shape.** `export const Name: FC<NameProps> = (props) => …`, a named export, with props declared as `type NameProps = { … }`.
- **Compose from `@galacticcouncil/ui/components`.** The `*.stories.tsx` beside each component in `packages/ui/src/components/` shows its props and variants. When the design needs something the library lacks, add the prop or variant to the library component and use it from there.
- **Loading.** A component that needs fetched data gets a wrapper that renders `<Name>Skeleton` until the data is ready, then renders the component with complete props (`AddStablepoolLiquidityWrapper` in `apps/main/src/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.tsx`).
- **Icons** come from `lucide-react` or `@galacticcouncil/ui/assets/icons`.

## Styling

- **Use the lowest rung that does the job.**
  1. A prop on the UI component: `<Flex direction="column" gap="m" align="center">`, `<Text fs="p4" fw={500}>`. `Box` carries the spacing, sizing, border and color props, and `Flex`, `Text` and `Grid` build on it; the full list is `BoxOwnProps` in `packages/ui/src/components/Box/Box.tsx`.
  2. An inline `sx` prop on the element, for one or two declarations beyond the component's props.
  3. A styled component in `<Name>.styled.ts` beside the component, for pseudo-selectors, child selectors, media queries and prop-driven variants. Its name starts with `S`: `SCard`, `SReferendaList`.
- **Precedence, weakest to strongest: component prop, styled CSS, `sx`.**
  - On `Box`, `Flex` and the other library components, set a property with the prop: `<Flex p="l" gap="m">`.
  - A styled component built on one of them (`styled(Box)`, `styled(Flex)`) keeps what its CSS declares: with `padding: 3px` in the CSS, `<SBox p="l">` still renders 3px. Props apply only to properties the CSS leaves unset.
  - To override a property the styled CSS declares, use `sx` at the call site: `<SBox sx={{ p: "l" }}>`. `sx` also works on `styled.div` and other plain styled elements, and it wins over a prop on the same element, so set each property one way.
- **Colors are theme tokens.** In props, `getToken("text.medium")` from `@galacticcouncil/ui/utils`, which is typed, so `tsc` checks the path. In a `.styled.ts` file, read the theme directly: `theme.surfaces.containers.high.primary`.
- **Spacing, radius and font size take scale keys**, the one closest to the design value: `gap="m"`, `p="l"`, `mt="-base"` for a negative margin, `borderRadius="m"`, `fs="p4"`. In a `.styled.ts` file the same scales are `theme.space.m`, `theme.radii.m` and `theme.containers.paddings.primary`. The keys and their values are `scales.paddings`, `scales.cornerRadius`, `containers.paddings`, `paragraphSize` and `headlineSize` in `packages/ui/src/theme/tokens/dark.json`, which `yarn workspace @galacticcouncil/ui theme` generates.
- **Font weight and line height are numeric**: `fw={500}`, `lh={1.3}` (a unitless ratio).
- **Sizes off the scale** (a fixed width, an icon box) go through `pxToRem(320)` from `@galacticcouncil/ui/utils`. Hairline borders stay `1px`.
- **Breakpoints** go through `mq("md")` from `@galacticcouncil/ui/theme`.

## Data

- **A query is a factory.** `nameQuery(context, args)` in `apps/main/src/api/` returns `queryOptions({ … })`; the component calls `useQuery(nameQuery(rpc, args))` with `rpc` from `useRpcProvider()` (`bestSellQuery` in `apps/main/src/api/trade.ts`).
- **Query keys are arrays that narrow left to right**: `["trade", "bestSell", assetIn, assetOut, amountIn]`. Data that changes every block starts its key with `QUERY_KEY_BLOCK_PREFIX` from `@galacticcouncil/utils`.
- **Asset metadata** comes from `useAssets()` in `@/providers/assetsProvider`.

## State

- **A Zustand store is a hook named `use<Name>Store`.** App-wide stores live in `apps/main/src/states/`, feature stores beside the feature (`apps/main/src/modules/onramp/store/useOnrampStore.ts`). State that survives a reload uses the `persist` middleware.
- **Select the fields you read** with `useShallow(pick(["a", "b"]))`, `pick` from `remeda` (`apps/main/src/components/AssetPrice/AssetPrice.tsx`).

## Forms

- **`<Name>.form.ts` exports the form hook**, built on `useForm` with `resolver: standardSchemaResolver(schema)` (`apps/main/src/modules/staking/Stake.form.ts`).
- **The schema is Zod** (`zod/v4`). When validation needs runtime values such as a balance, a function or hook builds the schema from them. Shared validators come from `@/utils/validators`.
- **Form value types are inferred**: `type StakeFormValues = z.infer<ReturnType<typeof getSchema>>`.
- **Validation messages are translations**, produced with `i18n.t(…)` inside the schema.
- **The parent creates the form and provides it** with `<FormProvider {...form}>`; fields read it from context.

## Transactions

- **Every transaction goes through `createTransaction`** from `useTransactionsStore` in `@/states/transactions`, which takes it through review, signing and status toasts. Its input type, `TransactionInput` in that file, lists every option.
- **Pass the extrinsic together with its toasts and the queries it changes** (`apps/main/src/modules/staking/ReferendaFooter.tsx`):
  - `tx`: the extrinsic.
  - `toasts`: translated `submitted` and `success` messages, plus `error` when the default needs replacing.
  - `invalidateQueries`: the keys of the queries the transaction changes, taken from their factories: `ongoingReferendaQuery(rpc).queryKey`.
- **Several extrinsics signed at once go through `useCreateBatchTx()`**, which takes `txs` and the same `toasts` and `invalidateQueries` under `transaction`.
- **A sequence of transactions the user signs one after another** is a single `createTransaction` call whose `tx` is an array of steps, each with a `stepTitle` (`apps/main/src/modules/liquidity/components/AddMoneyMarketLiquidity/AddMoneyMarketLiquidity.utils.tsx`).
- **When the UI shows pending or error state, wrap the call in `useMutation`** and call `createTransaction` or the batch function inside `mutationFn`, so the button reads `isPending` from the mutation (`apps/main/src/modules/staking/ClaimStaking.tx.ts`).

## Numbers and collections

- **On-chain amounts are `bigint`; decimal math uses `Big` from `big.js`.** Convert between raw and human units with `scale` and `scaleHuman` from `@/utils/formatting`.
- **Collection helpers come from `remeda`, date helpers from `date-fns`.**

## Translations

- **Every string a user sees is a translation**, including toasts, validation messages, empty states, placeholders, `aria-label`s, tooltips and table headers. Wallet, chain and product names stay literal, as do thrown `Error` messages and log output, which are for developers.
- **One JSON file per namespace** in `apps/main/src/i18n/locales/en/`, named after the feature. A string used by two or more features goes in `common.json`, the default namespace. A package with its own UI keeps its strings in its own `src/i18n/locales/`.
- **Declare namespaces at the hook.** The first one listed is the default; keys from the others carry a prefix.

  ```ts
  const { t } = useTranslation(["common", "staking"])
  t("number", { value })                       // common
  t("staking:gigaStake.header.totalStaked")    // staking
  ```

- **Keys are flat, dot-separated and camelCase**, starting with the section: `account.remove.confirm`, `account.searchPlaceholder`, `claim.toast.success`. Place a new key beside its siblings and give it their shape.
- **Formatting happens inside the translation string**, through the formatters defined in `packages/utils/src/helpers/interpolation.ts`: `"{{ value, number }} ms"`, `"{{ value, percent }} APY"`. Options go in parentheses, separated by semicolons, with string values in single quotes: `{{ value, date(format: 'HH:mm') }}`. Options passed to `t()` extend and override them.
- **A bare formatted value reuses a shared key from `common.json`**: `t("number", { value })`, `t("currency", { value })`, `t("date.time", { value })`. Search that file for the formatter name before adding a key.
- **Plurals use i18next suffixes** on the key, with a variable named `count`:

  ```json
  "rpc.status.blockHeightDiff_one": "{{ count, number }} block behind",
  "rpc.status.blockHeightDiff_other": "{{ count, number }} blocks behind"
  ```

  ```ts
  t("rpc.status.blockHeightDiff", { count: 3 })
  ```

- **Strings with inline markup use `<Trans>`.** Pass `t={t}`, the `i18nKey` with its namespace prefix, and `values`; the children supply the wrapper elements, matched to `<0>`, `<1>` in the string by position.

  ```json
  "history.table.emodeEnabled": "<0>{{ emode }}</0> <1>Enabled</1>"
  ```

  ```tsx
  <Trans t={t} i18nKey="borrow:history.table.emodeEnabled" values={{ emode }}>
    <strong />
    <em />
  </Trans>
  ```

## Comments

- **A comment says why**: a workaround, a library quirk, a unit, an ordering constraint, a link to the issue or spec. Public API documentation stays.
- **One or two lines, readable on their own** by someone who has only the repo.

## Types

- **Values of unknown shape are typed `unknown` and narrowed** before use.
- **Derive types from their source**: `z.infer` for form values, `ReturnType` and SDK types for query results.

## Tests

- **Pure logic gets a `<file>.test.ts` beside it**, written with `describe`, `it` and `expect` from `vitest` (`apps/main/src/modules/trade/swap/lib/quotedPrice.test.ts`).
- **Keep the unit isolated**: stub the hook and provider modules it imports with `vi.mock(…, () => ({}))` so only the function under test loads (`apps/main/src/modules/liquidity/Vaults.utils.test.ts`).

## Changes

- **Generated files change through their input**: edit the `.graphql` query or the route file, then run the workspace's `codegen:*` script or the dev server. The indexer codegen fetches the live schema, so review the `__generated__/` diff and commit only what your change explains.
- **Commit subjects follow `type(scope): description`**, in lowercase. The type is `feat`, `fix`, `refactor` or `chore`; the scope is the feature or package the change touches. Example: `feat(limit): anchor the market reference on spot price`.
