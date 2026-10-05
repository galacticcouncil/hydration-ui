// Test runner only. Never imported by the app or included in a production build.
// This derivation is public and MUST NEVER hold valuable funds.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { resolve } from "node:path"
import { decodeFunctionData, parseAbi } from "viem"

export const PUBLIC_TEST_SURI = "//Alice//propeller-ui-20261005"
export const PUBLIC_TEST_NAME = "PUBLIC TEST — Propeller Lark"
export const LARK_GENESIS =
  "0xba82f5b6d812fd3e2a6c610969e395d3be1e558145a9f07148b8d1f269ab4fb2"
export const LARK_RPC = "wss://node4.lark.hydration.cloud"
export const TEST_ORIGIN = "http://127.0.0.1:4178"

const allowedTargets = new Set([
  "0x40cca3da6cead6dada9e9ffc4c06e9039791876a",
  "0x5b153c8e24ca62436ef836a1f179dd8ade2d5acd",
  "0x59ba6340a85e311f8f43071372de1d0f5fb90dc4",
  "0xe0983cedd797b38090e6dcde54af88aa6eb22edc",
  "0x0000000000000000000000000000000100000022",
  "0x00000000000000000000000000000001000f453d",
])
const testCalls = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function requestRedeem(uint256 shares, address owner) returns (uint256)",
  "function claim(uint256 requestId, address receiver) returns (uint256)",
  "function claimYield(address receiver) returns (uint256)",
  "function claimSurplus(uint256 requestId) returns (uint256)",
])
const tokenVaults = {
  "0x0000000000000000000000000000000100000022":
    "0x40cca3da6cead6dada9e9ffc4c06e9039791876a",
  "0x00000000000000000000000000000001000f453d":
    "0x5b153c8e24ca62436ef836a1f179dd8ade2d5acd",
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
      if (decoded.functionName !== "claim")
        assert.ok(decoded.args[0] <= 100000000000000000n)
    } else if (decoded.functionName === "claimYield") {
      assert.equal(decoded.args[0].toLowerCase(), evm)
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
