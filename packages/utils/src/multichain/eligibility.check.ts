/**
 * Self-check for MultichainBalanceService.getEligibleChains.
 *
 * A wrong answer here silently omits a chain from the portfolio — nobody
 * reports a section they never knew existed — so the matrix is asserted
 * explicitly rather than trusted.
 *
 * Run from the repo root (Node 22 per .nvmrc). Not wired into CI (which runs
 * Node 20) and not run by `yarn lint` — invoke it by hand after touching the
 * service or the chain allowlist:
 *
 *   node_modules/.bin/esbuild packages/utils/src/multichain/eligibility.check.ts \
 *     --bundle --platform=node --format=cjs \
 *     --external:@galacticcouncil/xc-cfg --external:@galacticcouncil/xc-core \
 *     --outfile=node_modules/.cache/eligibility.check.cjs \
 *   && node node_modules/.cache/eligibility.check.cjs
 *
 * The xc packages stay external because xc-cfg loads a .wasm relative to its
 * own directory; bundling it breaks that path. Exits non-zero on failure.
 */
import assert from "node:assert/strict"

import {
  assetsMap,
  chainsMap,
  HydrationConfigService,
  routesMap,
} from "@galacticcouncil/xc-cfg"

import { MultichainBalanceService } from "./MultichainBalanceService"

/** Every chain the negative cases need to be able to rule out. */
const CHAINS = [
  "hydration",
  "assethub",
  "polkadot",
  "ethereum",
  "base",
  "solana",
  "sui",
  "mythos",
] as const

const service = new MultichainBalanceService({
  configService: new HydrationConfigService({
    assets: assetsMap,
    chains: chainsMap,
    routes: routesMap,
  }),
  chains: CHAINS,
})

const cases: ReadonlyArray<{
  keyType: string
  address: string
  expected: string[]
  /**
   * Chains that must stay out — spelled out separately from `expected` because
   * these are exactly the omissions key derivation would silently undo.
   */
  forbidden: string[]
}> = [
  {
    keyType: "sr25519 SS58",
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    expected: ["hydration", "assethub", "polkadot"],
    forbidden: ["ethereum", "base", "solana", "sui", "mythos"],
  },
  {
    keyType: "H160",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    expected: ["hydration", "ethereum", "base", "mythos"],
    forbidden: ["assethub", "solana", "sui"],
  },
  {
    keyType: "Solana",
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    expected: ["solana"],
    forbidden: ["hydration", "assethub", "ethereum", "base", "sui"],
  },
  {
    keyType: "Sui",
    address:
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf",
    expected: ["sui"],
    forbidden: ["hydration", "assethub", "ethereum", "base", "solana"],
  },
]

for (const { keyType, address, expected, forbidden } of cases) {
  const actual = service.getEligibleChains(address).map((chain) => chain.key)
  assert.deepEqual(actual, expected, `${keyType}: ${address}`)

  for (const key of forbidden) {
    assert.ok(
      !actual.includes(key),
      `${keyType} must not be eligible on ${key}`,
    )
  }

  console.log(`ok  ${keyType} -> [${actual.join(", ")}]`)
}

console.log("ok  eligibility matrix")
