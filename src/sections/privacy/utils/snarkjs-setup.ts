// Phase 5b-snarkjs — install snarkjs as the engine's Groth16 backend.
//
// `RailgunEngine.initForWallet` builds a `Prover` that ships without a Groth16
// implementation; the prover's first `proveRailgun` call throws
// `Requires groth16 full prover implementation` until one is registered.
//
// The engine ships two ways to plug one in:
//   - `prover.setNativeProverGroth16(...)` — RAILGUN's mobile/electron native
//     bindings (.dat file, no wasm).
//   - `prover.setSnarkJSGroth16(...)` — wraps snarkjs's `groth16.fullProve` (and
//     `groth16.verify`). This is the only viable option in the browser.
//
// We feed it the npm `snarkjs` package's `groth16` object directly. Vite picks
// the package's `browser` export condition (`build/browser.esm.js`), which
// already bundles snarkjs's WebAssembly + worker glue — `groth16.fullProve`
// runs witness generation in a Web Worker against the wasm + zkey
// `Uint8Array`s our `createBrowserArtifactGetter` returns.
//
// `SnarkJSGroth16` is the engine's structural type for the subset it consumes
// (`fullProve` + optional `verify`). snarkjs's actual types are slightly
// looser, hence the `unknown` cast — at runtime the shape matches.
//
// Idempotent: if a Groth16 impl is already attached (HMR re-import, second
// `bootRailgunEngine` call) we skip re-registering.
//
// Reference (Phase 0, node): hydration-railgun-poc/contract/helpers/logic/
// prover.ts — `groth16.fullProve(inputs, artifact.wasm, artifact.zkey)`
// against the same vkeys deployed to the lark Verifier proxy.

import { Prover, type SnarkJSGroth16 } from "@railgun-community/engine"
import { groth16 } from "snarkjs"

export const installSnarkJsGroth16 = (prover: Prover): void => {
  if (prover.groth16) {
    // Already installed (likely a hot-reload of the engine module). Leave the
    // existing impl in place — `setSnarkJSGroth16` overwrites unconditionally
    // and we'd rather not churn live proof callbacks.
    return
  }

  prover.setSnarkJSGroth16(groth16 as unknown as SnarkJSGroth16)
}
