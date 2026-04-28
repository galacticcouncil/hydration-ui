# Project conventions for Claude

## After every task

**Run `yarn lint` after every task.** Fix any errors introduced by the change before considering the task complete. Pre-existing errors in unrelated files can be ignored but should be called out.

## Tech stack

- Monorepo with Turbo (`apps/*`, `packages/*`)
- React + TypeScript
- Emotion styled-components (NOT Tailwind) — use theme tokens from `@galacticcouncil/ui`
- React Hook Form with Zod resolvers
- TanStack Query + Router
- `Big.js` for decimal math
- `@galacticcouncil/ui` component library (Tooltip, Modal, DataTable, etc.)

## Styling conventions

- Use `theme.space.*`, `theme.radii.*`, `theme.text.*`, `theme.buttons.*` tokens — don't hardcode colors/spacing
- Styled components prefixed with `S` (e.g. `SLockPill`, `SEmphasis`)
- Prefer `Flex`, `Text`, `Icon` primitives from `@galacticcouncil/ui/components`

## Patterns to follow

- Queries with `QUERY_KEY_BLOCK_PREFIX` auto-refetch on new block — use for on-chain state
- `spotPriceQuery` for clean theoretical rates, `bestSellQuery` for trade quotes (with fees/impact)
- For new transactions, use `useTransactionsStore().createTransaction({ tx, toasts })` with i18n keys for submitted/success/error
- Buttons inside forms must have `type="button"` explicitly (otherwise they default to submit)
