# Hydration UI

Web app and supporting libraries for [Hydration](https://hydration.net) — a Polkadot-based DeFi platform (Omnipool, stableswaps, lending, cross-chain transfers).

The deployed artifact is the bundle in [`apps/main`](./apps/main); the rest of the workspaces support it.

## Prerequisites

- **Node** 22.13 (see [`.nvmrc`](./.nvmrc) — `nvm use` will pick it up)
- **Yarn** 1.x (`packageManager: yarn@1.22.22`)

## Install

```sh
yarn install
```

`auto-install-peers` is enabled in [`.npmrc`](./.npmrc), so peer deps are pulled in automatically.

## Run

All scripts are wired through [Turborepo](https://turbo.build/) at the root:

```sh
yarn dev          # Start the app (apps/main) in dev mode at http://localhost:5173
yarn build        # Type-check + bundle every workspace
yarn preview      # Serve the production build of apps/main
yarn lint         # ESLint + tsc --noEmit across all workspaces
yarn lint:fix     # Auto-fix lint issues
```

To target a single workspace, use Yarn workspaces:

```sh
yarn workspace @galacticcouncil/main dev          # Run only the app
yarn workspace @galacticcouncil/ui dev            # Run the UI Storybook (port 6006)
yarn workspace @galacticcouncil/ui build          # Build only the UI package
```

## Layout

```
apps/
  main/             # Hydration web app (React 19 + Vite + TanStack Router)

packages/
  ui/               # Component library + design tokens (Storybook)
  utils/            # Shared TS utilities
  web3-connect/     # Wallet connectors (Substrate, EVM, Solana, Sui)
  money-market/     # Aave-based lending integration
  indexer/          # GraphQL clients (indexer / squid / snowbridge / multix)
  eslint-config/    # Shared ESLint + Prettier config
  typescript-config/# Shared tsconfig presets
```

For more on architecture, conventions, and AI-agent guidance, see [`CLAUDE.md`](./CLAUDE.md).

## Contributing

Open a PR against `master`. CI (`.github/workflows/ci.yml`) runs `yarn build` and `yarn lint` — both must pass.

## Issue reporting

For bugs or unexpected behaviour, open an issue at <https://github.com/galacticcouncil/hydration-ui/issues>.
