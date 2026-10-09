import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createPublicClient, http, parseAbi, zeroAddress } from "viem"

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
assert.match(
  deployment.chainName ?? "",
  /lark/i,
  "Expected a Lark testnet deployment manifest",
)
const equalAddress = (actual, expected, label) =>
  assert.equal(actual.toLowerCase(), expected.toLowerCase(), label)
equalAddress(SUBLOOP_ADDRESS, deployment.addresses.source, "Configured source")
const prime = deployment.oracles?.find(({ name }) => name === "PRIME")
assert.ok(prime, "Missing PRIME in deployment manifest")
equalAddress(PRIME_ADDRESS, prime.asset, "Configured PRIME")

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
// history starts where the first vault proxy got its code
const hasCode = async (address, blockNumber) =>
  ((await client.getCode({ address, blockNumber })) ?? "0x") !== "0x"
const deployedAt = await Promise.all(
  PROPELLER_VAULTS.map(async ({ vaultAddress }) => [
    await hasCode(vaultAddress, VAULT_DEPLOY_BLOCK - 1n),
    await hasCode(vaultAddress, VAULT_DEPLOY_BLOCK),
  ]),
)
assert.ok(
  deployedAt.every(([before]) => !before) &&
    deployedAt.some(([, atBlock]) => atBlock),
  "History starts at first vault deployment",
)
const bindings = parseAbi([
  "function pool() view returns (address)",
  "function yieldSource() view returns (address)",
  "function hollar() view returns (address)",
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
      hollar,
      supply,
      total,
      cap,
      paused,
      depositsPaused,
      deficitStop,
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
      client.readContract({
        address: vault.vaultAddress,
        abi: bindings,
        functionName: "hollar",
        ...at,
      }),
      read("totalSupply"),
      read("totalAssets"),
      read("tvlCap"),
      read("paused"),
      read("depositsPaused"),
      read("deficitStop"),
      read("deleverTarget"),
      read("reinvestAssets"),
    ])
    assert.equal(supported, true, "Deferred-deployment capability")
    equalAddress(asset, expected.asset, "Collateral binding")
    // the manifest lists ledgers only on some deployments; the vault is authoritative
    for (const [actual, key, label] of [
      [mainDebt, "mainDebt", "Main ledger binding"],
      [yieldAccounting, "yieldAccounting", "Yield ownership binding"],
    ]) {
      assert.notEqual(actual, zeroAddress, label)
      if (expected[key]) equalAddress(actual, expected[key], label)
    }
    equalAddress(fees, deployment.addresses.fees, "Fee controller binding")
    equalAddress(pool, POOL_ADDRESS, "Pool binding")
    equalAddress(source, SUBLOOP_ADDRESS, "Source binding")
    equalAddress(hollar, HOLLAR_ADDRESS, "HOLLAR binding")
    const ready =
      supply > 0n &&
      !paused &&
      !depositsPaused &&
      !deficitStop &&
      deleverTarget === 0n &&
      cap > total
    return {
      assetId: vault.assetId,
      address: vault.vaultAddress,
      ready,
      mainDebt,
      yieldAccounting,
      bootstrapped: supply > 0n,
      paused,
      depositsPaused,
      deficitStop,
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
