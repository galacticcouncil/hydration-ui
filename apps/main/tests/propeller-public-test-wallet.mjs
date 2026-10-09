// Test runner only. Never imported by the app or included in a production build.
// This derivation is public and MUST NEVER hold valuable funds.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { resolve } from "node:path"
import { decodeFunctionData, maxUint256, parseAbi } from "viem"

export const PUBLIC_TEST_SURI = "//Alice//propeller-ui-20261005"
export const PUBLIC_TEST_NAME = "PUBLIC TEST — Juicer Lark 0"
export const LARK_GENESIS =
  "0x0be0149961bbb0a547d7cda66e0d973e9ef37a7dd4744041b52739d738778878"
export const LARK_RPC = "wss://node0.lark.hydration.cloud"
export const TEST_ORIGIN = "http://127.0.0.1:4178"

// lark 0: both vaults, their main debts (claimSurplus) and both collaterals
const allowedTargets = new Set([
  "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
  "0x2c66100c46d15d6b826ba2a89f2d31e3ca47a153",
  "0x7b200b8c8a5ffd7720a48b0cb5a7f9fc6a512578",
  "0x13ad8e687f7d9aab96025497ba5a96968175cc22",
  "0x0000000000000000000000000000000100000022",
  "0x00000000000000000000000000000001000f453d",
])
const testCalls = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function requestRedeem(uint256 shares, address owner) returns (uint256)",
  "function claim(uint256 requestId, address receiver) returns (uint256)",
  "function claimSurplus(uint256 requestId) returns (uint256)",
])
const tokenVaults = {
  "0x0000000000000000000000000000000100000022":
    "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
  "0x00000000000000000000000000000001000f453d":
    "0x2c66100c46d15d6b826ba2a89f2d31e3ca47a153",
}

export async function injectPublicTestWallet(
  context,
  { allowSigning = false } = {},
) {
  const require = process.env.POLKADOT_MODULE_ROOT
    ? createRequire(resolve(process.env.POLKADOT_MODULE_ROOT, "package.json"))
    : createRequire(import.meta.url)
  const { ApiPromise, WsProvider } = require("@polkadot/api")
  const { Keyring } = require("@polkadot/keyring")
  const { cryptoWaitReady, decodeAddress } = require("@polkadot/util-crypto")
  await cryptoWaitReady()
  const pair = new Keyring({ type: "sr25519", ss58Format: 63 }).addFromUri(
    PUBLIC_TEST_SURI,
  )
  const evm = `0x${Buffer.from(pair.publicKey.slice(0, 20)).toString("hex")}`
  const api = await ApiPromise.create({ provider: new WsProvider(LARK_RPC) })
  assert.equal(api.genesisHash.toHex(), LARK_GENESIS)
  const requests = []
  let rejectNext = false
  let rejectFunction = null

  function inspectCall(call) {
    const name = `${call.section}.${call.method}`
    if (name === "utility.batchAll") {
      return call.args[0].flatMap(inspectCall)
    }
    if (name === "evmAccounts.bindEvmAddress") return [{ name }]
    if (name === "multiTransactionPayment.setCurrency") {
      assert.equal(call.args[0].toString(), "0", "Fixture pays native HDX fees")
      return [{ name, asset: "0" }]
    }
    assert.equal(name, "evm.call", `Unexpected public-fixture call: ${name}`)
    const [source, target, input, value] = call.args
    assert.equal(source.toHex().toLowerCase(), evm)
    const to = target.toHex().toLowerCase()
    assert.ok(allowedTargets.has(to))
    assert.equal(value.toString(), "0")
    const decoded = decodeFunctionData({ abi: testCalls, data: input.toHex() })
    if (tokenVaults[to]) {
      assert.equal(decoded.functionName, "approve")
      assert.equal(decoded.args[0].toLowerCase(), tokenVaults[to])
      assert.ok(decoded.args[1] <= 100000000000000000n)
    } else if (
      ["deposit", "requestRedeem", "claim"].includes(decoded.functionName)
    ) {
      assert.equal(decoded.args[1].toLowerCase(), evm)
      // a max redeem only exits the fixture's own balance
      const isMaxRedeem =
        decoded.functionName === "requestRedeem" &&
        decoded.args[0] === maxUint256
      if (decoded.functionName !== "claim" && !isMaxRedeem)
        assert.ok(decoded.args[0] <= 100000000000000000n)
    } else assert.equal(decoded.functionName, "claimSurplus")
    return [
      {
        name,
        source: source.toHex(),
        target: target.toHex(),
        input: input.toHex(),
        function: decoded.functionName,
      },
    ]
  }

  await context.exposeBinding(
    "__propellerPublicTestSign",
    async (source, payload) => {
      assert.equal(new URL(source.page.url()).origin, TEST_ORIGIN)
      assert.equal(payload.genesisHash, LARK_GENESIS)
      assert.deepEqual(decodeAddress(payload.address), pair.publicKey)
      assert.equal(
        BigInt(payload.assetId ?? "0"),
        0n,
        "Fixture pays native HDX fees",
      )
      assert.ok(requests.length < 6, "Public fixture signing limit exceeded")
      const calls = inspectCall(api.createType("Call", payload.method))
      const request = {
        id: requests.length + 1,
        nonce: payload.nonce,
        calls,
        rejected: false,
      }
      requests.push(request)
      if (
        !allowSigning ||
        rejectNext ||
        calls.some((call) => call.function === rejectFunction)
      ) {
        rejectNext = false
        rejectFunction = null
        request.rejected = true
        throw new Error("Cancelled by the public test wallet fixture")
      }
      const result = api.registry
        .createType("ExtrinsicPayload", payload, { version: payload.version })
        .sign(pair)
      return { id: request.id, signature: result.signature }
    },
  )
  await context.addInitScript(
    ({ address, name, origin }) => {
      if (window.location.origin !== origin) return
      const accounts = [{ address, name, type: "sr25519" }]
      window.injectedWeb3 = {
        "polkadot-js": {
          version: "public-test-fixture-only",
          enable: async () => ({
            accounts: {
              get: async () => accounts,
              subscribe: (callback) => {
                callback(accounts)
                return () => {}
              },
            },
            signer: {
              signPayload: (payload) =>
                window.__propellerPublicTestSign(payload),
              signRaw: () =>
                Promise.reject(new Error("Raw signing disabled in fixture")),
            },
          }),
        },
      }
    },
    { address: pair.address, name: PUBLIC_TEST_NAME, origin: TEST_ORIGIN },
  )
  return {
    address: pair.address,
    evm,
    api,
    requests,
    rejectNext: () => {
      rejectNext = true
    },
    rejectNextFunction: (name) => {
      rejectFunction = name
    },
    dispose: () => api.disconnect(),
  }
}
