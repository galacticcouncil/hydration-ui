// Mirrors upstream `packages/common/src/types/index.d.ts`. The vendored
// sources rely on these two ambient generics. Keep them scoped to this
// package by not adding the package's `src/` to a global typeRoots — the
// types still resolve because Vite/TS picks up `.d.ts` files in any
// `include`d directory and ambient declarations leak per-project regardless.
//
// `Optional<T>` is also re-exported by `@railgun-community/shared-models`
// in some places — using the global avoids the named-import / global
// shadowing gotcha when both are pulled into the same file.
declare type Optional<T> = T | undefined
declare type MapType<T> = { [id: string]: T }
