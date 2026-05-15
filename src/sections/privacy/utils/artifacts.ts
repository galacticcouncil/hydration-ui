// Phase 5b — browser ArtifactGetter for the RAILGUN engine.
//
// The engine's `Prover` consumes an `ArtifactGetter` that maps a circuit shape
// (n nullifiers × m commitments-out) to a `{ wasm, zkey, vkey }` triple. The
// on-chain Verifier on the lark proxy was loaded with the vkeys from
// `railgun-circuit-test-artifacts`, so we feed the prover the matching
// wasm/zkey from that same package (decompressed at build time by
// `src/sections/privacy/scripts/decompress-railgun-artifacts.mjs`).
//
// Bundled shapes for v1:
//   1x1 — unshield (1 input -> 1 unshield note) and 1-to-1 self-rotate
//   1x2 — send (1 input -> 1 receiver + 1 change) and most swaps' inner
//         unshield
//   2x2 — dust combine (wallet holds 2 small notes, combines to 1)
//   2x3 — combine + change (2-in -> receiver + change + unshield)
//
// Bigger shapes (1x3, 1x4, 3xN, ...) can be added by appending to SHAPES in
// the decompress script, re-running it, and adding a loader entry below.
//
// Bundle cost: ~25 MB of raw wasm+zkey total across the four shipped shapes.
// Vite emits them as separate hashed asset files; the browser only fetches
// the ones used by an actual proof.

import type {
  ArtifactGetter,
  PublicInputsRailgun,
} from "@railgun-community/engine"
import type { Artifact } from "@railgun-community/shared-models"

import vkey1x1 from "sections/privacy/assets/circuits/01x01/vkey.json"
import vkey1x2 from "sections/privacy/assets/circuits/01x02/vkey.json"
import vkey2x2 from "sections/privacy/assets/circuits/02x02/vkey.json"
import vkey2x3 from "sections/privacy/assets/circuits/02x03/vkey.json"

// `?url` returns the deployed URL of the asset after Vite hashes + emits it
// (e.g. /assets/wasm-AbCdEf.bin). We fetch lazily so the user only pays the
// download cost when they actually generate a proof.
import wasm1x1Url from "sections/privacy/assets/circuits/01x01/wasm.bin?url"
import zkey1x1Url from "sections/privacy/assets/circuits/01x01/zkey.bin?url"
import wasm1x2Url from "sections/privacy/assets/circuits/01x02/wasm.bin?url"
import zkey1x2Url from "sections/privacy/assets/circuits/01x02/zkey.bin?url"
import wasm2x2Url from "sections/privacy/assets/circuits/02x02/wasm.bin?url"
import zkey2x2Url from "sections/privacy/assets/circuits/02x02/zkey.bin?url"
import wasm2x3Url from "sections/privacy/assets/circuits/02x03/wasm.bin?url"
import zkey2x3Url from "sections/privacy/assets/circuits/02x03/zkey.bin?url"

type ArtifactLoader = () => Promise<Artifact>

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `Failed to load RAILGUN artifact at ${url}: ${res.status} ${res.statusText}`,
    )
  }
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

// Cache the decoded artifacts so we don't refetch + reparse on every proof.
// Map key is `${n}x${m}` (no padding) — that's what the engine asks for.
const artifactCache = new Map<string, Promise<Artifact>>()

const makeLoader =
  (wasmUrl: string, zkeyUrl: string, vkey: object): ArtifactLoader =>
  async () => {
    const [wasm, zkey] = await Promise.all([
      fetchBytes(wasmUrl),
      fetchBytes(zkeyUrl),
    ])
    // `dat` is required by the `Artifact` shape but only consumed by the
    // RAILGUN native prover (mobile / electron). We're going through snarkjs
    // in the browser, which uses wasm+zkey directly — `undefined` is the
    // documented signal that no .dat is available.
    return { wasm, zkey, dat: undefined, vkey }
  }

// Map "<nullifiers>x<commitmentsOut>" -> loader. Add more entries here when
// vendoring new circuit shapes.
const LOADERS: Record<string, ArtifactLoader> = {
  "1x1": makeLoader(wasm1x1Url, zkey1x1Url, vkey1x1),
  "1x2": makeLoader(wasm1x2Url, zkey1x2Url, vkey1x2),
  "2x2": makeLoader(wasm2x2Url, zkey2x2Url, vkey2x2),
  "2x3": makeLoader(wasm2x3Url, zkey2x3Url, vkey2x3),
}

const shapeKey = (nullifiers: number, commitments: number) =>
  `${nullifiers}x${commitments}`

const notBundled = (n: number, m: number): Error =>
  new Error(
    `RAILGUN circuit ${n}x${m} is not bundled in this build. ` +
      `To add it: append [${n}, ${m}] to SHAPES in ` +
      `src/sections/privacy/scripts/decompress-railgun-artifacts.mjs, run ` +
      `the script, then add a loader entry in ` +
      `src/sections/privacy/utils/artifacts.ts. Available: ${Object.keys(
        LOADERS,
      ).join(", ")}.`,
  )

export const createBrowserArtifactGetter = (): ArtifactGetter => ({
  // Synchronous existence check the engine calls before attempting a proof.
  // Throwing here surfaces "circuit not bundled" early instead of in the
  // middle of proof generation.
  assertArtifactExists: (nullifiers: number, commitments: number) => {
    const key = shapeKey(nullifiers, commitments)
    if (!LOADERS[key]) throw notBundled(nullifiers, commitments)
  },

  getArtifacts: async (publicInputs: PublicInputsRailgun): Promise<Artifact> => {
    const n = publicInputs.nullifiers.length
    const m = publicInputs.commitmentsOut.length
    const key = shapeKey(n, m)
    const loader = LOADERS[key]
    if (!loader) throw notBundled(n, m)

    let cached = artifactCache.get(key)
    if (!cached) {
      cached = loader().catch((err) => {
        // Drop the failed promise so a retry can re-attempt the fetch.
        artifactCache.delete(key)
        throw err
      })
      artifactCache.set(key, cached)
    }
    return cached
  },

  // POI is bypassed on Hydration (chain.id 222222) via the always-valid
  // merkleroot validator in `engine.ts`. If something inside the engine ever
  // reaches this path, fail loudly instead of silently returning a stub.
  getArtifactsPOI: async (): Promise<Artifact> => {
    throw new Error("RAILGUN POI proofs are disabled on Hydration.")
  },
})
