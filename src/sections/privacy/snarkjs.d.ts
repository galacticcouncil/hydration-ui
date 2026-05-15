// Phase 5b-snarkjs — ambient declaration for the `snarkjs` package.
//
// snarkjs ships no .d.ts (npm package, v0.7.6). We only consume the
// `groth16` namespace and pass it straight through to the RAILGUN engine's
// `Prover.setSnarkJSGroth16(...)`, so the shape here just needs to be
// compatible with the engine's `SnarkJSGroth16` structural type. The actual
// runtime values come from `snarkjs/build/browser.esm.js`.
declare module "snarkjs" {
  export const groth16: {
    fullProve: (
      input: unknown,
      wasm: unknown,
      zkey: unknown,
      logger?: unknown,
    ) => Promise<{ proof: unknown; publicSignals: string[] }>
    verify: (
      vkey: object,
      publicSignals: unknown,
      proof: unknown,
      logger?: unknown,
    ) => Promise<boolean>
  }
}
