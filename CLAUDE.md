# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hydration UI is a DeFi frontend for the Hydration protocol (Polkadot ecosystem). It is a monorepo managed with Yarn workspaces and Turbo, containing one main app and several shared packages.

## Commands

All commands can be run from the repo root (via Turbo) or from within a specific workspace.

### Development
```bash
yarn dev                    # Start all dev servers (root, via Turbo)
cd apps/main && yarn dev    # Start only the main app dev server
```

### Build
```bash
yarn build                  # Build all packages (root)
cd apps/main && yarn build  # Build only the main app (runs tsc + vite build)
```

### Linting & Type Checking
```bash
yarn lint                   # ESLint + TypeScript across all packages
yarn lint:fix               # Auto-fix ESLint issues across all packages

cd apps/main && yarn lint         # ESLint + TypeScript for main app
cd apps/main && yarn lint:ts      # TypeScript type-check only (tsc --noEmit)
cd apps/main && yarn lint:eslint  # ESLint only
```

### Storybook (UI package)
```bash
cd packages/ui && yarn dev    # Start Storybook dev server
cd packages/ui && yarn build  # Build Storybook
```

### GraphQL Codegen (indexer package)
```bash
cd packages/indexer && yarn codegen
```

## Architecture

### Monorepo Structure

```
apps/
  main/               # Main Hydration UI application (Vite + React)
packages/
  ui/                 # Shared React component library (@galacticcouncil/ui)
  utils/              # Shared utility functions
  web3-connect/       # Multi-wallet connection (Polkadot, EVM, Solana, Turnkey)
  money-market/       # Aave/lending integration
  indexer/            # GraphQL clients for multiple indexers (indexer, squid, snowbridge)
  typescript-config/  # Shared tsconfig bases
  eslint-config/      # Shared ESLint config
```

### Main App (`apps/main/src/`)

- **Entry point:** `index.tsx` → `App.tsx`
- **Routing:** TanStack Router with file-based routes in `src/routes/`. The route tree is auto-generated at `src/routeTree.gen.ts` — do not edit manually.
- **Server state:** TanStack React Query. The `queryClient` is passed via router context (`RouterContext` in `App.tsx`).
- **Client state:** Zustand stores in `src/states/`
- **Styling:** Emotion (CSS-in-JS). JSX import source is `@galacticcouncil/ui/jsx` (set in `tsconfig.json`). Always import from `@galacticcouncil/ui` for themed components.
- **i18n:** i18next with translations in `src/i18n/locales/en/`. Namespace files: `common.json`, `trade.json`, `strategies.json`.
- **Path alias:** `@/*` maps to `src/*`

### Route Structure

Routes mirror feature modules. Each major feature has:
- A `route.tsx` (layout/wrapper)
- An `index.tsx` (default view)
- Optional nested routes for sub-pages

Key route groups: `trade/`, `liquidity/`, `borrow/`, `staking/`, `stats/`, `wallet/`, `cross-chain/`, `strategies/`

### Feature Modules (`src/modules/`)

Feature logic lives in `src/modules/<feature>/`. Each module typically contains:
- Components specific to that feature
- Hooks for data fetching (React Query)
- Sections/sub-components

The `src/api/` directory contains lower-level API integration code (blockchain calls, external APIs) that modules consume via hooks.

### Blockchain Integration

- **Polkadot API:** via `polkadot-api` (PAPI) — not the older `@polkadot/api`
- **Math libraries:** `@galacticcouncil/math-*` packages (xyk, stableswap, omnipool, etc.) for on-chain calculations
- **EVM:** ethers.js (used in money-market package)
- **WASM:** Supported via Vite WASM plugin; math libraries ship WASM

### Web3-Connect Package

Handles wallet connection for multiple ecosystems. Contains providers for Polkadot (substrate) wallets, EVM wallets, Solana, and Turnkey (email/OTP-based embedded wallet). The package exposes a `Web3ConnectModal` component and a query-based wallet state system.

### Indexer Package

Exports three sub-paths for different data sources:
- `@galacticcouncil/indexer/indexer` — main chain indexer
- `@galacticcouncil/indexer/squid` — Subsquid-based indexer
- `@galacticcouncil/indexer/snowbridge` — Snowbridge cross-chain data

GraphQL types are generated via codegen.
