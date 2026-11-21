#!/usr/bin/env node
const { outputDir, checkoutHead } = require("./output.cjs")
// Run: node resilience-audit/dependency-faults.cjs
// Tests exact installed dependencies with in-process network fault injection.
// No live external service calls or application source changes are made.
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { pathToFileURL } = require("node:url")

const root = path.resolve(__dirname, "..")
const output = path.join(outputDir, "dependency-faults.json")
const observationMs = 100
const results = {
  createdAt: new Date().toISOString(),
  kind: "dependency-level fault injection; no browser assertions",
  observationMs,
  versions: {},
  checks: [],
  warnings: [],
}

for (const name of [
  "@galacticcouncil/xc",
  "@galacticcouncil/xc-core",
  "@galacticcouncil/xc-cfg",
  "@galacticcouncil/xc-sdk",
  "@galacticcouncil/xc-swap",
  "@reown/appkit",
  "@reown/appkit-controllers",
  "@defuse-protocol/one-click-sdk-typescript",
]) {
  results.versions[name] = JSON.parse(
    fs.readFileSync(
      path.join(root, "node_modules", name, "package.json"),
      "utf8",
    ),
  ).version
}

async function observePending(promise) {
  let timer
  try {
    return await Promise.race([
      Promise.resolve(promise).then(
        () => "resolved",
        () => "rejected",
      ),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve("pending"), observationMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

function record(name, observations, implication) {
  results.checks.push({ name, confirmed: true, observations, implication })
}

async function main() {
  const originalFetch = globalThis.fetch
  const originalWarn = console.warn
  const originalError = console.error
  console.warn = (...args) => results.warnings.push(args.map(String).join(" "))
  console.error = (...args) => results.warnings.push(args.map(String).join(" "))
  try {
    const { ConfigUtil } = await import(
      pathToFileURL(
        path.join(
          root,
          "node_modules/@reown/appkit/dist/esm/src/utils/ConfigUtil.js",
        ),
      )
    )
    const { ApiController } = await import(
      pathToFileURL(
        path.join(
          root,
          "node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ApiController.js",
        ),
      )
    )

    const reownCalls = []
    globalThis.fetch = async (url, init) => {
      reownCalls.push({
        url: String(url),
        hasAbortSignal: Boolean(init?.signal),
      })
      throw new Error("simulated Reown service outage")
    }
    const config = await ConfigUtil.fetchRemoteFeatures({
      showWallets: false,
      allWallets: "HIDE",
    })
    await ApiController.fetchUsage()
    assert.equal(typeof config, "object")
    assert.equal(reownCalls.length, 2)
    assert(reownCalls.every((request) => !request.hasAbortSignal))
    record(
      "appkit-config-and-usage-immediate-rejection",
      {
        configResolvedWithFallback: true,
        usageResolvedThroughCatch: true,
        requests: [...reownCalls],
      },
      "Immediate Reown API failures are caught; fallback completes initialization steps.",
    )

    globalThis.fetch = async (url, init) => {
      reownCalls.push({
        url: String(url),
        hasAbortSignal: Boolean(init?.signal),
      })
      return new Promise(() => {})
    }
    const configPending = await observePending(
      ConfigUtil.fetchRemoteFeatures({}),
    )
    const usagePending = await observePending(ApiController.fetchUsage())
    assert.equal(configPending, "pending")
    assert.equal(usagePending, "pending")
    record(
      "appkit-config-and-usage-silent-hang",
      {
        config: configPending,
        usage: usagePending,
        requests: reownCalls.slice(2),
      },
      "These readiness dependencies have no supplied AbortSignal or application deadline. They can keep WalletConnect pending and thereby hide healthy accounts in the shared account selector.",
    )

    const { chainsMap } = require("@galacticcouncil/xc-cfg")
    const near = chainsMap.get("near")
    assert(near, "Pinned configuration must contain NEAR")
    const nearCalls = []
    globalThis.fetch = async (url, init) => {
      nearCalls.push({
        url: String(url),
        method: init?.method,
        hasAbortSignal: Boolean(init?.signal),
      })
      throw new Error("simulated NEAR RPC outage")
    }
    const nearBalances = await near.getBalances(near.getAssets(), "sample.near")
    assert.deepEqual(nearBalances, [])
    record(
      "near-all-balances-immediate-rejection",
      { promise: "resolved", balances: nearBalances, requests: [...nearCalls] },
      "The chain swallows all asset RPC failures and resolves an empty successful result. Portfolio therefore cannot distinguish unavailable from verified zero and can hide the affected chain.",
    )

    globalThis.fetch = async (url, init) => {
      nearCalls.push({
        url: String(url),
        method: init?.method,
        hasAbortSignal: Boolean(init?.signal),
      })
      return new Promise(() => {})
    }
    const nearPending = await observePending(
      near.getBalances(near.getAssets(), "sample.near"),
    )
    assert.equal(nearPending, "pending")
    assert.equal(nearCalls.at(-1).hasAbortSignal, false)
    record(
      "near-all-balances-silent-hang",
      { promise: nearPending, requests: nearCalls.slice(1) },
      "NEAR's balance fetch has no supplied AbortSignal or deadline. The affected chain query stays pending; other independently queried chains are not awaited here.",
    )

    // Use require for both packages so they share the same CJS OneClickService.
    // Mixing ESM and CJS entries would mock a different service instance.
    const {
      OneClickService,
    } = require("@defuse-protocol/one-click-sdk-typescript")
    const { createXcSwap } = require("@galacticcouncil/xc-swap")
    const originalGetTokens = OneClickService.getTokens
    let serviceCalls = 0
    const originalFailure = new Error("simulated 1Click registry outage")
    try {
      OneClickService.getTokens = () => {
        serviceCalls++
        return Promise.reject(originalFailure)
      }
      const client = createXcSwap({
        sdk: {},
        emitter: "0x0000000000000000000000000000000000000000",
      })
      await assert.rejects(
        client.getDestinationAssets(),
        (error) => error === originalFailure,
      )
      OneClickService.getTokens = () => {
        serviceCalls++
        return Promise.resolve([])
      }
      await assert.rejects(
        client.getDestinationAssets(),
        (error) => error === originalFailure,
      )
      assert.equal(serviceCalls, 1)
      record(
        "xc-swap-rejected-registry-promise-remains-cached",
        {
          firstCall: "rejected",
          afterServiceRecovery: "rejected with same error",
          serviceCalls,
        },
        "The client caches its failed token-registry promise. Retrying destination assets on the same client never reaches the recovered service.",
      )
    } finally {
      OneClickService.getTokens = originalGetTokens
    }
    results.completed = true
  } finally {
    globalThis.fetch = originalFetch
    console.warn = originalWarn
    console.error = originalError
  }
}

main().then(
  () => {
    fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n")
    console.log(
      `${results.checks.length} expected outage behaviors confirmed; results: ${output}`,
    )
  },
  (error) => {
    results.completed = false
    results.unexpectedError = String(error?.stack || error)
    fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n")
    console.error(error)
    process.exitCode = 1
  },
)
