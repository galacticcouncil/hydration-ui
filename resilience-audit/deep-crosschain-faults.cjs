#!/usr/bin/env node
const { outputDir, checkoutHead } = require("./output.cjs")
// Exact locked packages; every network operation below uses an in-process mock.
// Run: node resilience-audit/deep-crosschain-faults.cjs
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const { pathToFileURL } = require("node:url")
const root = path.resolve(__dirname, "..")
const report = {
  kind: "Dependency fault injection; no live calls/signing/transactions",
  observationMs: 100,
  checks: [],
  versions: {},
}
for (const pkg of [
  "@galacticcouncil/xc-scan",
  "@galacticcouncil/xc-cfg",
  "@galacticcouncil/xc-sdk",
  "@galacticcouncil/xc-core",
  "@mysten/sui",
  "@solana/web3.js",
  "@reown/appkit-wallet",
]) {
  report.versions[pkg] = JSON.parse(
    fs.readFileSync(
      path.join(root, "node_modules", pkg, "package.json"),
      "utf8",
    ),
  ).version
}
const pending = () => new Promise(() => {})
async function state(promise) {
  let timer
  try {
    return await Promise.race([
      Promise.resolve(promise).then(
        () => "resolved",
        () => "rejected",
      ),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve("pending"), report.observationMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
function add(name, observations) {
  report.checks.push({ name, confirmed: true, observations })
}
async function main() {
  const originalFetch = globalThis.fetch
  const originalEventSource = globalThis.EventSource
  const originalWarn = console.warn
  const originalError = console.error
  console.warn = console.error = () => {}
  globalThis.fetch = async () => {
    throw new Error("unexpected network operation")
  }
  try {
    const { OcelloidsHttpClient, OcelloidsSseClient, XcStore } = await import(
      pathToFileURL(
        path.join(
          root,
          "node_modules/@galacticcouncil/xc-scan/build/index.mjs",
        ),
      )
    )
    let sseCalls = 0
    const mockSse = {
      subscribe() {
        sseCalls++
        return () => {}
      },
    }
    const store = new XcStore(
      new OcelloidsHttpClient("https://ocelloids.invalid", "test"),
      mockSse,
    )
    const calls = []
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), hasSignal: !!init.signal })
      throw new Error("DNS/transport failure")
    }
    await assert.rejects(
      store.subscribe("sample-address", {}),
      /DNS\/transport/,
    )
    assert.equal(sseCalls, 0)
    add("ocelloids-initial-query-rejection-prevents-SSE", {
      subscribe: "rejected",
      sseCalls,
      request: calls.at(-1),
    })
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), hasSignal: !!init.signal })
      return pending()
    }
    assert.equal(await state(store.subscribe("sample-address", {})), "pending")
    assert.equal(sseCalls, 0)
    add("ocelloids-initial-query-silent-hang", {
      subscribe: "pending",
      sseCalls,
      request: calls.at(-1),
    })
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ items: null }),
    })
    await assert.rejects(store.subscribe("sample-address", {}), TypeError)
    add("ocelloids-malformed-initial-query", {
      subscribe: "rejected with TypeError",
      sseCalls,
    })
    let finishHttp
    globalThis.fetch = () =>
      new Promise((resolve) => {
        finishHttp = resolve
      })
    const lateSubscribe = store.subscribe("old-address", {})
    store.unsubscribe()
    finishHttp({ ok: true, json: async () => ({ items: [] }) })
    await lateSubscribe
    assert.equal(sseCalls, 1)
    add("ocelloids-late-recovery-after-unsubscribe-opens-SSE", {
      sseCalls,
      state: "resolved",
      staleAddress: "old-address",
      implication:
        "Unmount/account-change cleanup does not cancel the in-flight HTTP load; recovery can start a stale subscription after cleanup.",
    })
    store.unsubscribe()
    let eventSource
    globalThis.EventSource = class {
      static CLOSED = 2
      constructor(url) {
        this.url = url
        this.listeners = {}
        eventSource = this
      }
      addEventListener(name, handler) {
        this.listeners[name] = handler
      }
      close() {}
    }
    const dispose = new OcelloidsSseClient(
      "https://ocelloids.invalid",
    ).subscribe(
      { criteria: {} },
      {
        onError() {},
        onNewJourney() {},
        onUpdateJourney() {},
        onReplaceJourney() {},
      },
    )
    assert.throws(
      () => eventSource.listeners.new_journey({ data: "{invalid" }),
      SyntaxError,
    )
    add("ocelloids-malformed-SSE-JSON-uncaught-in-handler", {
      eventHandler: "throws SyntaxError",
      url: eventSource.url,
    })
    dispose()

    const { chainsMap, clients } = require("@galacticcouncil/xc-cfg")
    const sui = chainsMap.get("sui")
    globalThis.fetch = async () => {
      throw new Error("Sui unavailable")
    }
    assert.deepEqual(
      await sui.getBalances(sui.getAssets(), "0x" + "1".repeat(64)),
      [],
    )
    add("sui-all-balances-rejection-becomes-success-empty", {
      result: [],
      queryState: "resolved",
    })
    let suiSignal
    globalThis.fetch = async (_url, init) => {
      suiSignal = init.signal
      return pending()
    }
    assert.equal(
      await state(sui.getBalances(sui.getAssets(), "0x" + "1".repeat(64))),
      "pending",
    )
    assert.equal(suiSignal, undefined)
    add("sui-balances-silent-hang", { state: "pending", hasSignal: false })
    const { Connection, PublicKey } = require("@solana/web3.js")
    let solanaSignal
    const connection = new Connection("https://solana.invalid", {
      fetch: async (_url, init) => {
        solanaSignal = init.signal
        return pending()
      },
    })
    assert.equal(
      await state(
        connection.getBalance(
          new PublicKey("11111111111111111111111111111111"),
        ),
      ),
      "pending",
    )
    assert.equal(solanaSignal, undefined)
    add("solana-balance-silent-hang", { state: "pending", hasSignal: false })

    const executor = new clients.ExecutorClient()
    globalThis.fetch = async () => ({ ok: false, status: 503 })
    await assert.rejects(
      executor.quote(2, 1, { gasLimit: 1n, msgValue: 0n }),
      /Executor quote failed/,
    )
    add("wormhole-executor-HTTP-failure", { state: "rejected" })
    let executorRequest
    globalThis.fetch = async (url, init) => {
      executorRequest = { url: String(url), hasSignal: !!init.signal }
      return { ok: true, json: pending }
    }
    assert.equal(
      await state(executor.quote(2, 1, { gasLimit: 1n, msgValue: 0n })),
      "pending",
    )
    add("wormhole-executor-body-hang", {
      state: "pending",
      request: executorRequest,
    })
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ signedQuote: "invalid-quote", estimatedCost: "3" }),
    })
    const unchecked = await executor.quote(2, 1, { gasLimit: 1n, msgValue: 0n })
    assert.equal(unchecked.signedQuote, "invalid-quote")
    add("wormhole-executor-signedQuote-not-validated-at-fetch", {
      state: "resolved",
      signedQuote: unchecked.signedQuote,
      estimatedCost: String(unchecked.estimatedCost),
      caveat:
        "Only confirms missing client validation; onchain verification is outside this test.",
    })
    const { WormholeScan } = require("@galacticcouncil/xc-sdk")
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({ operations: [] }),
    })
    assert.deepEqual(
      await new WormholeScan("https://wormhole.invalid").getOperations({}),
      [],
    )
    add("wormhole-scan-HTTP-status-not-checked", {
      state: "resolved",
      HTTPStatus: 503,
      operations: [],
      caveat: "SDK transport is dormant in current UI paths.",
    })

    const { W3mFrameProvider } = await import(
      pathToFileURL(
        path.join(
          root,
          "node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrameProvider.js",
        ),
      )
    )
    const nativeSetTimeout = globalThis.setTimeout
    const nativeClearTimeout = globalThis.clearTimeout
    const timers = []
    const alerts = []
    const abortController = new AbortController()
    let iframePromise
    try {
      globalThis.setTimeout = (callback, delay) => {
        timers.push({ callback, delay })
        return timers.length
      }
      globalThis.clearTimeout = () => {}
      iframePromise = W3mFrameProvider.prototype.appEvent.call(
        {
          w3mFrame: { iframeIsReady: false, frameLoadPromise: pending() },
          onTimeout: (reason) => alerts.push(reason),
          abortController,
        },
        { type: "@w3m-app/CONNECT_EMAIL" },
      )
      assert.equal(timers[0].delay, 20000)
      timers[0].callback()
    } finally {
      globalThis.setTimeout = nativeSetTimeout
      globalThis.clearTimeout = nativeClearTimeout
    }
    assert.equal(await state(iframePromise), "pending")
    assert.equal(abortController.signal.aborted, true)
    add("reown-auth-iframe-load-timeout-does-not-settle-await", {
      stateAfterTimeout: "pending",
      timeoutMs: timers[0].delay,
      alerts,
      abortSignal: "aborted",
      caveat:
        "Conditional remote email/social feature; component timeout shows alert but frameLoadPromise remains pending.",
    })
    report.completed = true
  } finally {
    globalThis.fetch = originalFetch
    globalThis.EventSource = originalEventSource
    console.warn = originalWarn
    console.error = originalError
  }
}
main().then(
  () => {
    fs.writeFileSync(
      path.join(outputDir, "deep-crosschain-faults.json"),
      JSON.stringify(report, null, 2) + "\n",
    )
    console.log(`${report.checks.length} exact dependency checks confirmed`)
  },
  (error) => {
    report.completed = false
    report.unexpectedError = String(error.stack || error)
    fs.writeFileSync(
      path.join(outputDir, "deep-crosschain-faults.json"),
      JSON.stringify(report, null, 2) + "\n",
    )
    console.error(error)
    process.exitCode = 1
  },
)
