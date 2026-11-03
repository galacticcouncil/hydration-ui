import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { inventory, validateManifest } from "../src/manifest.mjs"
import { sha256 } from "../src/util.mjs"

const [root, sha, output] = process.argv.slice(2)
if (!root || !/^[a-f0-9]{40}$/.test(sha || "") || !output)
  throw new Error("Usage: node scripts/manifest.mjs CHECKOUT SHA OUTPUT")
const files = await inventory(path.join(root, "apps/main/build"))
// Hosting control files are inputs to server configuration, not public assets.
// Record their hashes explicitly; routing is exercised by browser checks.
const deploymentFiles = {}
for (const p of ["/_redirects", "/_headers"]) {
  if (files[p]) {
    deploymentFiles[p] = files[p]
    delete files[p]
  }
}
const inputs = {}
for (const file of [
  "yarn.lock",
  ".nvmrc",
  "apps/main/.env.production",
  "packages/ui/style-dictionary/source.json",
]) {
  inputs[file] = sha256(await readFile(path.join(root, file)))
}
const routeTree = await readFile(
  path.join(root, "apps/main/src/routeTree.gen.ts"),
  "utf8",
)
const routeSection =
  routeTree
    .split("export interface FileRoutesByFullPath {")[1]
    ?.split("}")[0] || ""
const routes = [
  ...new Set([...routeSection.matchAll(/'([^']+)':/g)].map((m) => m[1])),
].sort()
const headers = JSON.parse(
  await readFile(
    path.join(root, "services/ui-watchdog/response-policy.json"),
    "utf8",
  ),
)
const manifest = validateManifest({
  version: 1,
  repo: "galacticcouncil/hydration-ui",
  branch: "production",
  sha,
  // The attesting job must compare the two clean builds before publishing this.
  reproducible: true,
  builder: {
    image:
      "node:25.9.0-bookworm@sha256:78839ac448c23517f8eab2e8f7943d9b4f73979eb7f8bed2c73dbf72ff869e7b",
    node: "25.9.0",
    yarn: "1.22.22",
    command: "services/ui-watchdog/scripts/build-reference.sh",
  },
  recipe: "ui-reference-v1",
  inputs,
  deploymentFiles,
  routes,
  headers,
  files,
})
await writeFile(output, JSON.stringify(manifest, null, 2) + "\n")
console.log(`${Object.keys(files).length} files inventoried`)
