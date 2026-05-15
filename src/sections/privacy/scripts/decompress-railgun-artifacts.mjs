// Decompress the brotli-compressed RAILGUN circuit artifacts shipped in the
// `railgun-circuit-test-artifacts` npm package, and write the raw wasm + zkey
// blobs (plus the vkey.json) into
// `src/sections/privacy/assets/circuits/<NN>x<MM>/` so Vite can serve them as
// static assets. Run once after `yarn install` (or whenever you want to add
// more circuit shapes).
//
// Usage:
//   node src/sections/privacy/scripts/decompress-railgun-artifacts.mjs
//
// Source: the package is a transitive dep of @railgun-community/engine. We
// resolve it relative to this script and fall back to the sibling Phase 0
// contract repo (`../hydration-railgun-poc/contract/node_modules/...`) so the
// script works without bloating the UI's lockfile.
//
// Shapes shipped by default: 01x01 (unshield 1->1), 01x02 (send 1->1+change,
// most swaps), 02x02 (dust combine). Add more by appending to SHAPES below
// and re-running; then add a matching loader entry in
// `src/sections/privacy/utils/artifacts.ts`.

import { brotliDecompressSync } from "node:zlib"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// scripts/ lives at src/sections/privacy/scripts/, so the repo root is four
// levels up.
const repoRoot = resolve(__dirname, "..", "..", "..", "..")

// (n, m) tuples. Names get zero-padded to two digits to match the source
// package's directory naming (`01x01`, `01x02`, ...).
const SHAPES = [
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3],
]

function shapeName(n, m) {
  return `${String(n).padStart(2, "0")}x${String(m).padStart(2, "0")}`
}

// Try a few well-known locations for railgun-circuit-test-artifacts. We prefer
// the UI's own node_modules; if it's not there (the package may be hoisted or
// not pulled in as a direct dep), we fall back to the Phase 0 contract repo
// which has it as a direct dependency.
function findArtifactsPackage() {
  const candidates = [
    join(repoRoot, "node_modules", "railgun-circuit-test-artifacts"),
    join(
      repoRoot,
      "..",
      "hydration-railgun-poc",
      "contract",
      "node_modules",
      "railgun-circuit-test-artifacts",
    ),
  ]
  for (const c of candidates) {
    if (existsSync(join(c, "circuits"))) return c
  }
  throw new Error(
    "Could not locate railgun-circuit-test-artifacts. Checked:\n" +
      candidates.map((c) => `  ${c}`).join("\n"),
  )
}

const pkgDir = findArtifactsPackage()
const outRoot = join(
  repoRoot,
  "src",
  "sections",
  "privacy",
  "assets",
  "circuits",
)
mkdirSync(outRoot, { recursive: true })

console.log(`Source: ${pkgDir}`)
console.log(`Output: ${outRoot}\n`)

let totalBytes = 0
for (const [n, m] of SHAPES) {
  const name = shapeName(n, m)
  const srcDir = join(pkgDir, "circuits", name)
  const dstDir = join(outRoot, name)
  mkdirSync(dstDir, { recursive: true })

  const wasmBr = readFileSync(join(srcDir, "wasm.br"))
  const zkeyBr = readFileSync(join(srcDir, "zkey.br"))
  const vkey = readFileSync(join(srcDir, "vkey.json"))

  const wasm = brotliDecompressSync(wasmBr)
  const zkey = brotliDecompressSync(zkeyBr)

  // `.bin` extension keeps Vite's `?url` import path happy: extensionless
  // files don't resolve through TypeScript's node module resolution, and `.wasm`
  // would collide with vite-plugin-wasm's interception. `.bin` is just an
  // opaque blob both for TS and Vite.
  writeFileSync(join(dstDir, "wasm.bin"), wasm)
  writeFileSync(join(dstDir, "zkey.bin"), zkey)
  writeFileSync(join(dstDir, "vkey.json"), vkey)

  totalBytes += wasm.byteLength + zkey.byteLength + vkey.byteLength
  console.log(
    `  ${name}: wasm=${(wasm.byteLength / 1024).toFixed(1)}KB ` +
      `zkey=${(zkey.byteLength / 1024 / 1024).toFixed(2)}MB ` +
      `vkey=${vkey.byteLength}B`,
  )
}

console.log(
  `\nWrote ${SHAPES.length} circuit(s) ` +
    `(${(totalBytes / 1024 / 1024).toFixed(2)} MB total).`,
)
