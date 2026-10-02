#!/usr/bin/env node
// Audit only. Actual modules/dependency methods; mocked storage and network.
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const assert = require("node:assert/strict")
const root = path.resolve(__dirname, "..")
const ts = require(path.join(root, "node_modules/typescript"))
const { createRequire } = require("node:module")
const req = createRequire(path.join(root, "package.json"))
const windowBefore = global.window
const results = []
const windowMs = 120
const silentConsole = { ...console, error() {}, warn() {} }

function moduleTs(file, imports, globals = {}, append = "") {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2016, esModuleInterop: true },
  }).outputText
  vm.runInNewContext(code + "\n" + append, {
    module,
    exports: module.exports,
    require(id) {
      if (Object.hasOwn(imports, id)) return imports[id]
      throw Error("Missing stub " + id + " in " + file)
    },
    Promise,
    console: silentConsole,
    setTimeout,
    clearTimeout,
    AbortController,
    performance,
    ...globals,
  }, { filename: file })
  return module.exports
}

async function observe(name, operation, detail = {}) {
  let timer
  const started = Date.now()
  const result = await Promise.race([
    Promise.resolve().then(operation).then(
      value => ({ state: "fulfilled", value }),
      error => ({ state: "rejected", error: error?.message ?? String(error) }),
    ),
    new Promise(resolve => { timer = setTimeout(() => resolve({ state: "pending_at_observation_deadline" }), windowMs) }),
  ])
  clearTimeout(timer)
  const row = { name, ...result, elapsedMs: Date.now() - started, ...detail }
  results.push(row)
  return row
}

function idbModule(indexedDB) {
  return moduleTs("apps/main/src/utils/indexedDB.ts", {
    zustand: req("zustand"),
    "zustand/middleware": req("zustand/middleware"),
  }, { indexedDB })
}

async function idbCases() {
  let opens = 0
  let manager = idbModule({ open() { opens++; throw new Error("SecurityError: IndexedDB blocked") } }).IndexedDBManager
  assert.equal((await observe("idb_synchronous_open_failure", () => manager.getInstance())).state, "rejected")
  assert.equal((await observe("idb_repeat_after_synchronous_open_failure", () => manager.getInstance())).state, "rejected")
  assert.equal(opens, 1)
  results.at(-1).openCalls = opens
  manager = idbModule({ open() { return {} } }).IndexedDBManager
  assert.equal((await observe("idb_open_never_fires_success_error", () => manager.getInstance())).state, "pending_at_observation_deadline")
  const eventFailure = idbModule({ open() {
    const request = {}
    setTimeout(() => request.onerror(), 0)
    return request
  } })
  assert.equal((await observe("idb_open_error_event_is_soft_failure", () => eventFailure.IndexedDBManager.getInstance())).value, null)

  // Rehydrate actual asset store through actual IndexedDB adapter/middleware.
  const corruptStorage = idbModule({ open() {
    const request = { result: { transaction() { return { objectStore() { return { getAll() {
      const readRequest = { result: [{ key: "assets", data: "invalid-array" }, { key: "genesisHash", data: "0xhealthy" }] }
      setTimeout(() => readRequest.onsuccess(), 0)
      return readRequest
    } } } } } } }
    setTimeout(() => request.onsuccess(), 0)
    return request
  } })
  const store = moduleTs("apps/main/src/states/assetRegistry.ts", {
    react: req("react"), remeda: req("remeda"), "@/utils/indexedDB": corruptStorage,
  }).useAssetRegistryStore
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(typeof store.getState().assets, "string")
  const row = await observe("idb_malformed_registry_shape_reaches_consumer", () => {
    return store.getState().assets.reduce(() => null, {})
  })
  assert.equal(row.state, "rejected")
  row.consumerEvidence = "AssetsProvider calls assets.reduce at apps/main/src/providers/assetsProvider.tsx:146; raw persisted state has no schema check"
}

async function localStorageCases() {
  const storage = {
    getItem() { return null },
    setItem() { throw Error("QuotaExceededError: injected full storage") },
    removeItem() {},
  }
  global.window = { localStorage: storage }
  const provider = moduleTs("apps/main/src/states/provider.ts", {
    remeda: req("remeda"), zustand: req("zustand"), "zustand/middleware": req("zustand/middleware"),
    "@/config/env": { ENV: { VITE_PROVIDER_URL: "wss://healthy-hydration.test" } },
  }, { window: global.window }).useProviderRpcUrlStore
  const row = await observe("provider_resolution_persist_write_failure", () => provider.setState({ rpcUrl: "wss://healthy-selected-hydration.test" }))
  assert.equal(row.state, "rejected")
  row.inMemoryUpdatedBeforeThrow = provider.getState().rpcUrl === "wss://healthy-selected-hydration.test"
  row.consumerEvidence = "DataProviderResolver.tsx:86 persists before setIsBestProviderFound(true):93; write failure skips readiness flag"

  // Invalid same-version data is returned unchanged despite the schema.
  const schemaStorage = { ...storage, getItem() { return JSON.stringify({ version: 7, state: { count: "invalid" } }) }, setItem() {} }
  const helper = moduleTs("packages/utils/src/lib/zustandStorage.ts", {
    "zod/v4": req("zod/v4"), "zustand/middleware": req("zustand/middleware"),
  }, { window: { localStorage: schemaStorage } }).createZustandStorage
  const z = req("zod/v4").z
  const config = helper({ name: "audit-store", version: 7, schema: z.object({ count: z.number() }), defaultState: { count: 0 } })
  const restored = await config.storage.getItem("audit-store")
  assert.equal(restored.state.count, "invalid")
  results.push({ name: "local_storage_schema_invalid_same_version_passes_through", state: "fulfilled", observed: restored, expectedSafeDefault: { count: 0 } })
}

async function frameworkCases() {
  const appSource = fs.readFileSync(path.join(root, "apps/main/src/App.tsx"), "utf8")
  const parsed = ts.createSourceFile("App.tsx", appSource, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)
  const statement = parsed.statements.find(node => ts.isExpressionStatement(node) && node.getText(parsed).startsWith('window.addEventListener("vite:preloadError"'))
  let listener
  let reloads = 0
  vm.runInNewContext(statement.getText(parsed), { window: { addEventListener(type, callback) { listener = callback }, location: { reload() { reloads++ } } } })
  for (let i = 0; i < 3; i++) listener({ preventDefault() {} })
  assert.equal(reloads, 3)
  results.push({ name: "preload_error_unconditionally_reloads", state: "fulfilled", injectedEvents: 3, reloadRequests: reloads, limit: "Direct callback execution; not a deployed chunk outage browser test" })

  for (const [name, fetchBaseline] of Object.entries({
    baseline_rejection: () => Promise.reject(Error("offline")),
    baseline_hang: () => new Promise(() => {}),
  })) {
    let calls = 0
    const appUpdate = moduleTs("apps/main/src/utils/appUpdate.ts", { zustand: req("zustand") }, {
      fetch: () => ++calls === 1 ? fetchBaseline() : Promise.resolve({ ok: true, text: async () => "recovered-new-build" }),
      document: { addEventListener() {} }, setInterval() {},
    }, "module.exports.__audit = { check, baseline }")
    const row = await observe("app_update_" + name, () => appUpdate.__audit.check())
    assert.equal(row.state, name === "baseline_hang" ? "pending_at_observation_deadline" : "fulfilled")
    row.updateAvailable = appUpdate.useAppUpdateStore.getState().isAvailable
    row.fetchCalls = calls
    assert.equal(row.updateAvailable, false)
  }
}

async function sdkCases() {
  const prototype = req("@galacticcouncil/sdk-next").pool.PoolContextProvider.prototype
  for (const [name, broken] of Object.entries({ reject: () => Promise.reject(Error("injected V3 failure")), hang: () => new Promise(() => {}) })) {
    let absorbed = 0
    const context = {
      at: "best", isReady: false, isSnapshot: false,
      active: new Set(["Omnipool", "UniswapV3"]),
      clients: [
        { getPoolType: () => "Omnipool", getPools: async () => [{ address: "healthy-omnipool" }] },
        { getPoolType: () => "UniswapV3", getPools: broken },
      ],
      absorb() { absorbed++ },
      loadAll(at) { return prototype.loadAll.call(this, at) },
    }
    const row = await observe("sdk_pool_aggregate_v3_" + name, () => prototype.getPools.call(context))
    assert.equal(row.state, name === "hang" ? "pending_at_observation_deadline" : "rejected")
    row.absorbedHealthyFamilies = absorbed
    assert.equal(absorbed, 0)
    if (name === "reject") {
      assert.equal(context.pending, undefined)
      context.clients[1].getPools = async () => []
      const recovery = await prototype.getPools.call(context)
      assert.equal(recovery.length, 1)
      row.recoveredOnNextCall = true
    }
  }
}

async function viemCases() {
  const { createPublicClient, custom, http } = req("viem")
  let bodySignal
  const client = createPublicClient({
    transport: http("https://mock-evm-rpc.test", { timeout: 25, retryCount: 0, fetchFn: async (_url, options) => {
      bodySignal = options.signal
      return new Response(new ReadableStream({ start() {} }), { status: 200, headers: { "Content-Type": "application/json" } })
    } }),
  })
  const row = await observe("viem_http_response_body_hang_outlives_configured_timeout", () => client.request({ method: "eth_blockNumber" }), { configuredTimeoutMs: 25 })
  assert.equal(row.state, "pending_at_observation_deadline")
  row.suppliedSignalAbortedAtObservation = bodySignal.aborted
  assert.equal(bodySignal.aborted, false)
  const customClient = createPublicClient({ transport: custom({ request: () => new Promise(() => {}) }, { retryCount: 0 }) })
  assert.equal((await observe("viem_custom_shared_papi_hang_has_no_deadline", () => customClient.request({ method: "eth_blockNumber" }))).state, "pending_at_observation_deadline")
}

async function main() {
  await idbCases()
  await localStorageCases()
  await frameworkCases()
  await sdkCases()
  await viemCases()
  const document = {
    checkout: JSON.parse(fs.readFileSync(path.join(__dirname, "versions.json"), "utf8")).checkout,
    observationWindowMs: windowMs,
    scope: "Audit-only injected storage/network faults and direct exact installed SDK/viem methods. React boot/chunk blast radius is source traced where explicitly noted.",
    limits: "Pending state is measured only within observation window. Mocks never settle; source confirms missing deadlines. Network/persistence mocks do not prove production browser behavior.",
    cases: results,
  }
  fs.writeFileSync(path.join(__dirname, "deep-startup-faults.results.json"), JSON.stringify(document, null, 2) + "\n")
  for (const row of results) console.log(`${row.name}: ${row.state}`)
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => { global.window = windowBefore })
