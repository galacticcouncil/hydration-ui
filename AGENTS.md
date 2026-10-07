# Hydration UI

Web app for the Hydration parachain. `apps/main` is the one deployable (a React SPA on Netlify). Everything in `packages/` exists to serve it and is consumed as TypeScript source.

## Working here

- **Branch.** Create a branch off `master` (`feat/`, `fix/`, `chore/`, `refactor/`) before starting a feature or fix.
- **Stale build.** `apps/main` type-checks the packages through `packages/<name>/build/`, so after editing a package run `npx tsc --build` in it, then type-check the app. "has no exported member" or implicit-`any` errors in files you left untouched mean a stale build: rebuild the package they point at.
- **Checks.** `yarn lint` runs ESLint and `tsc` in every workspace; `yarn lint:fix` sorts imports and formats. `yarn test` runs Vitest, which covers pure logic in `apps/main/src/**/*.test.ts`.
- **UI changes are verified by eye.** Open the affected page in the running app, or the story in Storybook, and report which of the two you looked at.
  - App: `yarn workspace @galacticcouncil/main dev` runs against the test network; `dev:production` runs against mainnet. By default, run the mainnet dev server, unless told otherwise.
  - Storybook: `yarn workspace @galacticcouncil/ui dev`, port 6006.
- **Translations** are edited by hand in `apps/main/src/i18n/locales/en/*.json`; `yarn i18n` is a placeholder.
- **Design tokens come from upstream.** `yarn workspace @galacticcouncil/ui theme` downloads them from the `galacticcouncil/hydration-styles` repo and overwrites the local token files, so a token value changes there. How tokens are transformed is `packages/ui/style-dictionary/build.mjs`.

## Where things are

- **Entry.** `apps/main/src/index.tsx` → `App.tsx` → file-based routes in `apps/main/src/routes/` → page components in `apps/main/src/modules/<feature>/`.
- **Data.** Modules read chain, SDK and indexer data through `apps/main/src/api/`.
- **UI components.** `@galacticcouncil/ui`, source in `packages/ui/src/components/`, each with a `*.stories.tsx` showing its props. JSX compiles through `@galacticcouncil/ui/jsx`, so component files import only what they use.
- **Wallets.** `packages/web3-connect`, one connector per wallet in `src/wallets/`. Signing and submission live in `apps/main/src/modules/transactions/` and `modules/submit-transaction/`.
- **Lending.** `packages/money-market` (Aave integration), used by `apps/main/src/modules/borrow/`, `api/borrow/` and `api/aave.ts`.
- **Indexer and API clients.** `packages/indexer`, one client per backend under `src/`, imported by subpath (`@galacticcouncil/indexer/<backend>`).
- **Cross-chain.** The external `@galacticcouncil/xc*` packages, used by `apps/main/src/modules/xcm/` and `api/xcm.ts`.

## Read when

- Writing a kind of file that is new to you here (a query, a form, a translation), or reviewing a diff: `CODING_STANDARDS.md` shows how each is written, with an example file per rule.
- Needing protocol mechanics (Omnipool, products, tokenomics): fetch `https://raw.githubusercontent.com/galacticcouncil/hydration/main/CLAUDE.md`, an index of reference documents.
