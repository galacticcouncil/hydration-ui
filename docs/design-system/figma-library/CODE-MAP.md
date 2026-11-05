# Hydration library: implementation lookup

Verified against the local `deposit-wallet-v2` checkout on 2026-10-26. This is a **code/export map**. A similarly named Figma component is a candidate match, not a verified one-to-one equivalence; inspect its variants, styling and intended use before mapping it to code. Figma component IDs and keys belong in the Figma inventory.

## Package boundaries and imports

| Layer | Public import / source registry | Use |
|---|---|---|
| Shared UI | `@galacticcouncil/ui/components` → `packages/ui/src/components/index.ts` | Reusable visual primitives and composites |
| Theme | `@galacticcouncil/ui/theme` → `packages/ui/src/theme/index.ts` | Themes, theme types, provider and responsive helpers |
| UI helpers | `@galacticcouncil/ui/utils` → `packages/ui/src/utils/index.ts` | `getToken`, `createStyles`, `createVariants`, `pxToRem` |
| Wallet integration | `@galacticcouncil/web3-connect` → `packages/web3-connect/src/index.ts` | Wallet connection, account identities, sessions and address book |
| App patterns | `@/components/...` and `@/modules/...` in `apps/main/src` | Product-specific compositions and data-connected behavior |

The UI package has no `src/index.ts`. Its package exports resolve subpaths through `./src/*/index.ts`; do not invent imports from the bare package root. Typical use:

```tsx
import { AccountTile, Button, Modal, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
```

## Shared components

All source and story paths in this table are relative to `packages/ui/src/components/`. Names are verified exported code symbols. Stories demonstrate the implementation API; they are not evidence that Figma variants are identical.

| Family / Figma search terms | Exported code symbols | Source | Story / useful states |
|---|---|---|---|
| Button / CTA / action | `Button`, `ButtonTransparent`, `LoadingButton` | `Button/Button.tsx` | `Button/Button.stories.tsx`: `Variants`, `Sizes`, `Content`, `Loading` |
| Text link | `TextButton`, `LinkTextButton` | `TextButton/TextButton.tsx` | `TextButton/TextButton.stories.tsx`: `Underline`, `UnderlineInternal`, `UnderlineExternal` |
| Modal / dialog / modal header | `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalTitle`, `ModalDescription`, `ModalContentDivider`, `ModalContent`, `ModalContainer`, `ModalRoot`, `ModalTrigger`, `ModalCloseTrigger`, `ModalClose`, `ModalOverlay`, `ModalPortal` | `Modal/Modal.tsx` | `Modal/Modal.stories.tsx`: `WithHeaderAndFooter`, `WithTopContent`, `WithBottomContent`, `WithCustomHeader`, `ForcedDrawerVariant`, `ForcedPopupVariant` |
| Text / numeric / search input | `Input`, `NumberInput`, `SearchInput` | `Input/Input.tsx`, `Input/NumberInput.tsx`, `Input/SearchInput.tsx` | `Input/Input.stories.tsx`: `WithIcons`, `Unit`, `CustomElements`, `Error`, `Disabled`, `Embedded`, `SearchField`, `Numeric` |
| Form field / label / error | `FormField`, `FormLabel`, `FormError` | `FormField/FormField.tsx` | No sibling story verified |
| Asset amount / currency selector | `AssetInput`, `AssetButton`, `PercentageButton` | `AssetInput/AssetInput.tsx`, `AssetInput/PercentageButton.tsx` | `AssetInput/AssetInput.stories.tsx`: `CurrencySelector`, `AmountError`, `AssetError`, `Loading`, `ReadOnly`, `Disabled`, `AmountHidden`, `AllStates` |
| Select / dropdown selector | `Select`, `SelectProps`, `SelectItem` | `Select/Select.tsx` | `Select/Select.stories.tsx`: `MultipleSelection`, `WithIcons`, `WithAssetIcons`, `FullWidth`, `Sizes`, `Variants`, `Disabled` |
| Asset logo / badges / chain decoration | `AssetLogo`, `MultipleAssetLogoWrapper` | `AssetLogo/AssetLogo.tsx` | `AssetLogo/AssetLogo.stories.tsx`: `WithChain`, `WithMultipleAssets`, `WithAtokenDecoration`, `WithYellowBadge`, `WithRedBadge`, `Placeholder` |
| Generic logo / chain | `Logo`, `LogoSkeleton`, `Chain` | `Logo/Logo.tsx`, `Logo/LogoSkeleton.tsx`, `Chain/Chain.tsx` | `Logo/Logo.stories.tsx`, `Chain/Chain.stories.tsx` |
| Account tile / wallet card | `AccountTile` | `AccountTile/AccountTile.tsx` | `AccountTile/AccountTile.stories.tsx`: `Default`, `Active` |
| Address input / contacts | `AccountInput` | `AccountInput/AccountInput.tsx` | `AccountInput/AccountInput.stories.tsx`: `WithValue`, `WithError`, `WithContacts`, `WithTrailingElement`, `Standalone` |
| Account avatar | `AccountAvatar` | `AccountAvatar/AccountAvatar.tsx` | `AccountAvatar/AccountAvatar.stories.tsx`: `Identican`, `Emoji`, `EmojiSmall`, `EmojiDegenGlyph`, `EmojiDegenImage` |
| Table / table actions | `Table`, `TableContainer`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`, `TableRowOverride`, `TableRowAction`, `TableRowDetailsExpand`, `ExpandedTableRowHorizontalSeparator` | `Table/Table.tsx` | `Table/Table.stories.tsx` |
| Data table / sort / pagination | `DataTable`, `DataTablePagination`, `DataTableExpandTrigger`, `useDataTable`, `updateTableSortWithPriority` | `DataTable/DataTable.tsx`, `DataTable/DataTable.utils.tsx` | `DataTable/DataTable.stories.tsx`: `WithSkeletons`, `WithSearch`, `WithExpandableRows`, `WithPagination`, `WithPinnedColumn` |
| Summary / transaction details / fee row | `Summary`, `SummaryRow`, `SummaryRowContent`, `SummaryRowValue`, `SummaryRowDisplayValue`, `SummaryRowLabel` | `Summary/Summary.tsx`, `Summary/SummaryRow.tsx` | `Summary/Summary.stories.tsx` |
| Stepper / progress steps | `Stepper`, `StepperProps`, `StepState`, `getStepState` | `Stepper/Stepper.tsx`, `Stepper/Stepper.utils.ts` | `Stepper/Stepper.stories.tsx`: `Compact`, `InteractiveCompact`, `CustomWidth` |
| Step trigger / accordion step | `StepTrigger` | `StepTrigger/StepTrigger.tsx` | `StepTrigger/StepTrigger.stories.tsx`: `Active`, `Done`, `Todo`, `AllStates`, `LongDescription` |
| Inline alert | `Alert`, `AlertProps`, `AlertVariant` | `Alert/Alert.tsx`, `Alert/Alert.styled.ts` | `Alert/Alert.stories.tsx`: `Info`, `Error`, `Success`, `Warning` |
| Toast / notification | `Notification`, `ToastVariant` | `Notification/Notification.tsx` | `Notification/Notification.stories.tsx`: `Success`, `Pending`, `Info`, `Error`, `Warning`, `Submitted`, `Unknown` |
| Chip / status label | `Chip`, `ChipVariant` | `Chip/Chip.tsx`, `Chip/Chip.styled.tsx` | `Chip/Chip.stories.tsx`: semantic and named-color variants |
| Typography / truncation | `Text`, `TextMiddleTruncate` | `Text/Text.tsx` | `Text/Text.stories.tsx`: primary/secondary families and weights, `Responsive`, `Colors`, `MiddleTruncate` |
| Section title | `SectionHeader` | `SectionHeader/SectionHeader.tsx` | No sibling story verified |
| Layout / surface / separator | `Box`, `Flex`, `Grid`, `Stack`, `Paper`, `Separator`, `ScrollArea`, `ResponsiveScope` | Matching family directory | Matching `*.stories.tsx`; `Paper`: `Plain`, `Hoverable`; `Separator`: `Horizontal`, `Vertical` |
| Option card / choice tile | `OptionCard` | `OptionCard/OptionCard.tsx` | `OptionCard/OptionCard.stories.tsx`: `Active`, `WithIcon`, `Disabled`, `Group` |
| Metric / stat | `ValueStats`, `ValueStatsLabel`, `ValueStatsValue`, `ValueStatsBottomValue` | `ValueStats/ValueStats.tsx` | `ValueStats/ValueStats.stories.tsx`: `Small`, `Medium`, `Large`, `BottomLabel`, `SecondaryFont` |
| Hint / coachmark | `Hint` | `Hint/Hint.tsx` | `Hint/Hint.stories.tsx`: position, short/long copy, single/multiple steps, badges |

Other public families are discoverable in `packages/ui/src/components/index.ts`, including charts, toggles, tabs, dropdown menus, drawers, sheets, tooltips, progress, skeletons, images and virtualized lists. Do not infer their exact property API from a Figma name; open the family source and its story.

## Important API differences and reuse points

- **Button size labels:** code uses `micro | small | medium | large`. Figma sizes such as `sm` or `lg` are not valid code values and are not an automatic exact-size mapping. Button variants likewise use code labels (`primary`, `secondary`, `tertiary`, `muted`, semantic and named colors), rather than assuming a Figma `emphasis` property translates directly.
- `Button` supports `outline`, `uppercase`, `icon`, `iconStart`, and `iconEnd`. `icon` produces an icon-only square control; a leading icon with text uses `iconStart`.
- `AccountTile` supports `active`, `action`, `label`, `walletLogoSrc`, `shortenAddress` and `onClick`. Put the Change action in its `action` slot rather than constructing a second account-card layout.
- `AssetInput` supports a custom `assetSelector`, `label`, `labelAdornment`, balance/max/percentage controls, errors, disabled/read-only and loading states. The `CurrencySelector` story demonstrates fiat-style reuse.
- `Modal` supports `variant="auto" | "drawer" | "popup"`; `auto` switches responsively. Use its header/body/footer and content divider rather than reproducing their borders independently.
- `Stepper` takes `steps`, `activeStepIndex`, `compact="auto" | boolean`, and optional `onStepClick`. Auto is compact on mobile or for at least five steps.
- `DataTable` has an `emptyState` slot and owns sort, pagination and expandable/pinned-row behavior. Keep product empty states in that slot.

## App-level compositions and wallet integration

These names are not exports of `@galacticcouncil/ui`:

| Pattern | Verified source / boundary |
|---|---|
| `EmptyState`, `EmptyStateAction` | `apps/main/src/components/EmptyState/EmptyState.tsx` |
| `SearchEmptyState` | `apps/main/src/components/EmptyState/SearchEmptyState.tsx` |
| `AssetSelect` | `apps/main/src/components/AssetSelect/AssetSelect.tsx` |
| `AssetSelectModal`, `AssetSelectModalContent` | `apps/main/src/components/AssetSelectModal/AssetSelectModal.tsx` |
| `AccountIdentity` | `apps/main/src/components/AccountIdentity/AccountIdentity.tsx` |
| `XcmSummary` | `apps/main/src/modules/xcm/transfer/XcmSummary.tsx` |

`EmptyState` standardizes `gap="xl"`, `py="xxxl"`, an image at size `3xl`, a primary/Gazpacho `h7` title, a description and an optional action. It accepts `image` or `icon` and defaults to Flamingo; `EmptyStateAction` uses the secondary button.

`XcmSummary` composes `Summary`, `SummaryRow`, `Separator` and collapsibles. It accepts `hideUnavailable`; use this actual implementation when matching available fee/timing rows rather than inventing placeholder values.

The public wallet package registry `packages/web3-connect/src/index.ts` exports `Web3ConnectButton`, `Web3ConnectModal`, `Web3ConnectPage`, `Web3ConnectSession`, `Web3ConnectAccountIdentity`, `AccountWalletAvatar`, `Web3ConnectModalPage`, and `useWeb3ConnectModal`, as well as hooks, utilities and address-book exports. Internal account/provider layouts live in `packages/web3-connect/src/components/account/`, `content/`, `external/` and `address-book/`. For example, internal `AccountOption` is not a public package export.

For translated product copy, the app's English dictionaries are under `apps/main/src/i18n/locales/en/`; wallet-package dictionaries are under `packages/web3-connect/src/i18n/`. Keep domain copy in its owning app or wallet layer rather than adding product text to shared UI primitives.

## Tokens, typography and assets

| Purpose | Source |
|---|---|
| Upstream download and transformation | `packages/ui/style-dictionary/build.mjs` |
| Token source URL currently used by that script | `https://raw.githubusercontent.com/galacticcouncil/hydration-styles/refs/heads/tertiary/tokens.json` |
| Generated token values consumed by the UI | `packages/ui/src/theme/tokens/dark.json`, `light.json` |
| Token types and registry | `packages/ui/src/theme/tokens/index.ts` |
| Theme assembly, types and exports | `packages/ui/src/theme/index.ts` |
| Theme provider | `packages/ui/src/theme/provider.tsx` |
| Token/style helpers | `packages/ui/src/utils/index.ts` |
| Responsive breakpoints and UI scaling | `packages/ui/src/styles/media.ts` |
| Font files / declarations | `packages/ui/src/assets/fonts/fonts.css` |
| Asset palette | `packages/ui/src/theme/assets/assetColors.json`, `assetColors.utils.ts`, `AssetColors.stories.tsx` |
| Vector icon exports | `packages/ui/src/assets/icons/index.ts` |
| 3D / empty-state illustrations | `packages/ui/src/assets/images/` |

`Text font="primary"` is **Gazpacho**, `secondary` is **Geist**, and `mono` is **GeistMono**. Use `theme.space`, `theme.radii`, `theme.fontSizes` and `theme.lineHeights`. The old `scales.paddings`, `scales.cornerRadius`, `headlineSize`, `paragraphSize` and `lineHeight` fields are explicitly deprecated compatibility APIs.

**Generated token caveat:** project instructions identify upstream `hydration-styles` as the source of truth. `yarn workspace @galacticcouncil/ui theme` downloads tokens and overwrites local token files. Do not edit generated dark/light JSON as a durable token change, and do not run regeneration merely to inspect a value.

## Storybook and verification

Configuration: `packages/ui/.storybook/main.ts`, scanning `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`. Inspect story files directly for names and props. The local command is `yarn workspace @galacticcouncil/ui dev` on port 6006; it also runs token generation and a package TypeScript build. A story path is a verified lookup location, not proof that Storybook is currently running or that a particular hosted URL exists.

This audit read source and project `AGENTS.md`; it did not launch Storybook, alter UI code, or assert visual equivalence between the entire Figma library and the implementation.
