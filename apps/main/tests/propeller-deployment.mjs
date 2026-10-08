import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createPublicClient, http, parseAbi } from "viem"

import { VAULT_ABI } from "../src/modules/strategies/propeller/config/abi.ts"
import { PROPELLER_VAULTS } from "../src/modules/strategies/propeller/config/vaults.ts"
import {
  HOLLAR_ADDRESS,
  POOL_ADDRESS,
  PRIME_ADDRESS,
  SUBLOOP_ADDRESS,
  VAULT_DEPLOY_BLOCK,
} from "../src/modules/strategies/propeller/constants.ts"

const manifestPath = process.argv[2]
if (!manifestPath)
  throw new Error(
    "Usage: node tests/propeller-deployment.mjs /path/to/lark-manifest.json [--require-ready]",
  )
const deployment = JSON.parse(await readFile(manifestPath, "utf8"))
assert.equal(
  deployment.testnetOnly,
  true,
  "Expected a testnet-only deployment manifest",
)
const equalAddress = (actual, expected, label) =>
  assert.equal(actual.toLowerCase(), expected.toLowerCase(), label)
equalAddress(SUBLOOP_ADDRESS, deployment.addresses.source, "Configured source")
equalAddress(POOL_ADDRESS, deployment.market.pool, "Configured pool")
equalAddress(HOLLAR_ADDRESS, deployment.market.hollar, "Configured HOLLAR")
equalAddress(PRIME_ADDRESS, deployment.market.prime, "Configured PRIME")
const firstVaultBlock = deployment.deployments
  .filter(
    ({ label }) =>
      label.startsWith("CollateralVault.") && label.endsWith(".proxy"),
  )
  .map(({ block }) => BigInt(block))
  .reduce((earliest, block) => (block < earliest ? block : earliest))
assert.equal(
  VAULT_DEPLOY_BLOCK,
  firstVaultBlock,
  "History starts at first vault deployment",
)

const client = createPublicClient({ transport: http(deployment.rpc) })
const genesis = await client.request({
  method: "chain_getBlockHash",
  params: [0],
})
assert.equal(
  genesis,
  deployment.genesis,
  "Selected RPC must match deployment genesis",
)
const blockNumber = await client.getBlockNumber()
assert.ok(blockNumber >= VAULT_DEPLOY_BLOCK, "Deployment block must exist")
const at = { blockNumber }
const sourceCode = await client.getCode({ address: SUBLOOP_ADDRESS, ...at })
assert.ok(sourceCode && sourceCode !== "0x", "Source must have code")
const bindings = parseAbi([
  "function pool() view returns (address)",
  "function yieldSource() view returns (address)",
])
const vaults = await Promise.all(
  PROPELLER_VAULTS.map(async (vault) => {
    const expected = deployment.vaults.find(
      ({ assetId }) => String(assetId) === vault.assetId,
    )
    assert.ok(expected, `Missing ${vault.assetId} in deployment manifest`)
    equalAddress(vault.vaultAddress, expected.address, "Configured vault")
    const code = await client.getCode({ address: vault.vaultAddress, ...at })
    assert.ok(code && code !== "0x", "Vault must have code")
    const read = (functionName) =>
      client.readContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        functionName,
        ...at,
      })
    const [
      supported,
      asset,
      mainDebt,
      yieldAccounting,
      fees,
      pool,
      source,
      supply,
      total,
      cap,
      paused,
      depositsPaused,
      underfunded,
      deleverTarget,
      pending,
    ] = await Promise.all([
      read("deferredDeployment"),
      read("asset"),
      read("mainDebt"),
      read("yieldAccounting"),
      read("feeController"),
      client.readContract({
        address: vault.vaultAddress,
        abi: bindings,
        functionName: "pool",
        ...at,
      }),
      client.readContract({
        address: vault.vaultAddress,
        abi: bindings,
        functionName: "yieldSource",
        ...at,
      }),
      read("totalSupply"),
      read("totalAssets"),
      read("tvlCap"),
      read("paused"),
      read("depositsPaused"),
      read("isUnderfunded"),
      read("deleverTarget"),
      read("reinvestAssets"),
    ])
    assert.equal(supported, true, "Deferred-deployment capability")
    equalAddress(asset, expected.asset, "Collateral binding")
    equalAddress(mainDebt, expected.mainDebt, "Main ledger binding")
    equalAddress(
      yieldAccounting,
      expected.yieldAccounting,
      "Yield ownership binding",
    )
    equalAddress(fees, deployment.addresses.fees, "Fee controller binding")
    equalAddress(pool, POOL_ADDRESS, "Pool binding")
    equalAddress(source, SUBLOOP_ADDRESS, "Source binding")
    const ready =
      supply > 0n &&
      !paused &&
      !depositsPaused &&
      !underfunded &&
      deleverTarget === 0n &&
      cap > total
    return {
      assetId: vault.assetId,
      address: vault.vaultAddress,
      ready,
      bootstrapped: supply > 0n,
      paused,
      depositsPaused,
      underfunded,
      remainingCapacity: (cap > total ? cap - total : 0n).toString(),
      pendingDeployment: pending.toString(),
      totalAssets: total.toString(),
      totalSupply: supply.toString(),
    }
  }),
)
console.log(
  JSON.stringify(
    {
      rpc: deployment.rpc,
      genesis,
      blockNumber: blockNumber.toString(),
      evmChainId: await client.getChainId(),
      historyStart: VAULT_DEPLOY_BLOCK.toString(),
      source: SUBLOOP_ADDRESS,
      mode: "read-only; no wallet signatures or transactions",
      vaults,
    },
    null,
    2,
  ),
)
if (process.argv.includes("--require-ready"))
  assert.ok(
    vaults.every(({ ready }) => ready),
    "Governance/bootstrap must complete before enabling the preview",
  )
