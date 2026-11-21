#!/usr/bin/env node
// Audit-only fault injection. Does not edit application code or make requests.
// Run: node audit/metadata-faults.cjs
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { createRequire } = require("node:module")
const { createHash } = require("node:crypto")
const assert = require("node:assert/strict")

const root = path.resolve(__dirname, "..")
const appRequire = createRequire(path.join(root, "package.json"))
const ts = appRequire("typescript")
const reactQuery = appRequire("@tanstack/react-query")
const observationMs = Number(process.env.METADATA_OBSERVATION_MS ?? 250)
const relativeSources = {
  factory: "packages/utils/src/lib/AssetMetadataFactory.ts",
  metadataQuery: "apps/main/src/api/metadata.ts",
  assetsQuery: "apps/main/src/api/assets.ts",
  gate: "apps/main/src/providers/AssetRegistryGate.tsx",
  rootRoute: "apps/main/src/routes/__root.tsx",
}
const sources = Object.fromEntries(
  Object.entries(relativeSources).map(([name, file]) => [
    name,
    fs.readFileSync(path.join(root, file), "utf8"),
  ]),
)

function loadTs(name, imports, fetch) {
  const file = path.join(root, relativeSources[name])
  const code = ts.transpileModule(sources[name], {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const module = { exports: {} }
  const context = {
    module,
    exports: module.exports,
    require(id) {
      if (Object.hasOwn(imports, id)) return imports[id]
      throw new Error(`Unstubbed audit import from ${name}: ${id}`)
    },
    fetch,
    console,
    setTimeout,
    clearTimeout,
  }
  vm.runInNewContext(code, context, { filename: file })
  return module.exports
}

function validResponse(url) {
  return {
    ok: true,
    status: 200,
    json: async () =>
      url.endsWith("metadata.json")
        ? { assets: { external: { whitelist: {} }, xcscanAssetUrnMap: {} } }
        : { items: [], path: "", baseUrl: "", branch: "", repository: "", cdn: {} },
  }
}

const faults = {
  fetch_rejection: async () => {
    throw new TypeError("Injected network failure")
  },
  http_503: async () => ({ ok: false, status: 503 }),
  silent_fetch_hang: () => new Promise(() => {}),
  hanging_response_body: async () => ({
    ok: true,
    status: 200,
    json: () => new Promise(() => {}),
  }),
  malformed_successful_json: async () => ({
    ok: true,
    status: 200,
    json: async () => ({ error: "Injected CDN outage" }),
  }),
}

function createEnvironment(fault) {
  const requests = []
  // One failing resource suffices: the other CDN responses are healthy.
  const fetch = (url, options) => {
    requests.push({ url, suppliedAbortSignal: !!options?.signal })
    return url.endsWith("assets-v2.json") ? fault(url) : Promise.resolve(validResponse(url))
  }
  const ecosystem = { Polkadot: "Polkadot", Ethereum: "Ethereum" }
  const factoryExports = loadTs(
    "factory",
    { "@galacticcouncil/xc-core": { ChainEcosystem: ecosystem } },
    fetch,
  )
  const metadata = factoryExports.AssetMetadataFactory.getInstance()
  // Infinity GC avoids background test-process timers. No retry override is
  // needed: ensureQueryData/fetchQuery preserve their actual library behavior.
  const queryClient = new reactQuery.QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  })
  const metadataExports = loadTs(
    "metadataQuery",
    {
      "@galacticcouncil/utils": factoryExports,
      "@tanstack/react-query": reactQuery,
    },
    fetch,
  )
  const store = {
    assets: [],
    genesisHash: "",
    shareTokens: [],
    aTokenPairs: [],
    syncAssets(assets, genesisHash) {
      store.assets = assets
      store.genesisHash = genesisHash
    },
    syncATokenPairs(pairs) {
      store.aTokenPairs = pairs
    },
    syncShareTokens(tokens) {
      store.shareTokens = tokens
    },
  }
  const healthyPools = {
    allPools: [],
    omnipoolTokens: [],
    stablePools: [],
    xykPools: [],
    aavePools: [],
    v3Pools: [],
  }
  const assetsExports = loadTs(
    "assetsQuery",
    {
      "@galacticcouncil/utils": {
        ...factoryExports,
        HYDRATION_PARACHAIN_ID: "2034",
      },
      "@galacticcouncil/xc-core": { ChainEcosystem: ecosystem },
      "@tanstack/react-query": reactQuery,
      remeda: appRequire("remeda"),
      viem: { zeroAddress: "0x0000000000000000000000000000000000000000" },
      "@/api/gamma/abi": { FACTORY_ABI: [], HYPERVISOR_ABI: [] },
      "@/api/gamma/config": {
        getGammaContracts: () => ({
          hypervisor: "0x0000000000000000000000000000000000000001",
          hypervisorFactory: "0x0000000000000000000000000000000000000002",
        }),
      },
      "@/api/metadata": metadataExports,
      "@/api/pools": {
        allPools: () => reactQuery.queryOptions({
          queryKey: ["allPools"],
          queryFn: async () => healthyPools,
        }),
      },
      "@/states/assetRegistry": { useAssetRegistryStore: { getState: () => store } },
      "@/utils/assets": { ASSET_ICON_OVERRIDES: {}, ASSET_NAME_OVERRIDES: {} },
      "@/utils/externalAssets": {
        getAccountKey20: () => undefined,
        getEthereumNetworkEntry: () => undefined,
        getExternalId: () => undefined,
        getParachainId: () => undefined,
      },
    },
    fetch,
  )
  const healthyHydrationContext = {
    sdk: {
      api: { router: { getTradeableAssets: async () => [0] } },
      client: { asset: { getSupported: async () => [{
        id: 0,
        existentialDeposit: 0n,
        symbol: "HDX",
        decimals: 12,
        name: "Hydration",
        isSufficient: true,
        type: "Token",
      }] } },
    },
    papi: { query: { XYK: { ShareToken: { getValues: async () => [] } } } },
    evm: { readContract: async () => "gamma-audit-share" },
    endpoint: "wss://healthy-hydration.test",
    isEndpointSettled: true,
    dataEnv: "mainnet",
    genesisHash: "0xhealthyHydration",
  }
  return { metadata, metadataExports, assetsExports, queryClient, requests, store, healthyHydrationContext }
}

async function observe(start, env) {
  const startedAt = Date.now()
  let timer
  const operation = Promise.resolve().then(start)
  const result = await Promise.race([
    operation.then(
      () => ({ state: "fulfilled" }),
      (error) => ({ state: "rejected", error: String(error?.message ?? error) }),
    ),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve({ state: "pending_at_observation_deadline" }), observationMs)
    }),
  ])
  clearTimeout(timer)
  env.queryClient.clear()
  return {
    ...result,
    elapsedMs: Date.now() - startedAt,
    requests: env.requests,
    storedAssets: env.store.assets.length,
  }
}

function firstLine(name, fragment) {
  const position = sources[name].indexOf(fragment)
  if (position === -1) throw new Error(`Source evidence missing: ${fragment}`)
  return { file: relativeSources[name], line: sources[name].slice(0, position).split("\n").length, fragment }
}

function checkoutHead() {
  const gitDir = path.join(root, ".git")
  const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim()
  if (!head.startsWith("ref: ")) return head
  const ref = head.slice(5)
  const refFile = path.join(gitDir, ref)
  if (fs.existsSync(refFile)) return fs.readFileSync(refFile, "utf8").trim()
  const packed = fs.readFileSync(path.join(gitDir, "packed-refs"), "utf8")
  const row = packed.split("\n").find((line) => line.endsWith(" " + ref))
  if (!row) throw new Error(`Cannot resolve checkout reference ${ref}`)
  return row.split(" ")[0]
}

async function main() {
  const cases = []
  for (const [faultName, fault] of Object.entries(faults)) {
    for (const workflow of ["factory_fetch_methods", "metadata_query_real_query_client", "cold_assets_query_real_query_client"]) {
      const env = createEnvironment(fault)
      const start = workflow === "factory_fetch_methods"
        ? () => Promise.all([env.metadata.fetchAssets(), env.metadata.fetchChains(), env.metadata.fetchMetadata()])
        : workflow === "metadata_query_real_query_client"
          ? () => env.queryClient.ensureQueryData(env.metadataExports.assetMetadataQuery())
          : () => env.queryClient.ensureQueryData(env.assetsExports.assetsQuery(env.healthyHydrationContext, env.queryClient))
      const result = { fault: faultName, workflow, ...await observe(start, env) }
      const expectedState = faultName === "fetch_rejection" || faultName === "http_503"
        ? "fulfilled"
        : faultName === "malformed_successful_json"
          ? "rejected"
          : "pending_at_observation_deadline"
      assert.equal(result.state, expectedState, `${faultName} / ${workflow}`)
      if (workflow === "cold_assets_query_real_query_client") {
        assert.equal(result.storedAssets, expectedState === "fulfilled" ? 1 : 0)
      }
      cases.push(result)
    }
  }
  const packageNames = [
    "typescript", "react", "react-dom", "@tanstack/react-query", "@tanstack/query-core",
    "@tanstack/react-router", "polkadot-api", "viem", "@galacticcouncil/common",
    "@galacticcouncil/descriptors", "@galacticcouncil/sdk-next", "@galacticcouncil/xc",
    "@galacticcouncil/xc-cfg", "@galacticcouncil/xc-core", "@galacticcouncil/xc-sdk",
    "@galacticcouncil/xc-swap", "@galacticcouncil/xc-scan",
  ]
  const versions = Object.fromEntries(packageNames.map((name) => {
    const info = JSON.parse(fs.readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8"))
    return [name, info.version]
  }))
  const checkout = checkoutHead()
  const evidence = [
    firstLine("factory", "const response = await fetch(METADATA_CDN_URL + path)"),
    firstLine("factory", "return (await response.json()) as T"),
    firstLine("factory", "this.assets = data.items.map("),
    firstLine("factory", "this.chains = data.items.map("),
    firstLine("metadataQuery", "await Promise.all(["),
    firstLine("assetsQuery", "queryClient.ensureQueryData(assetMetadataQuery()),"),
    firstLine("gate", "useSuspenseQuery(assetsQuery(rpcProvider, queryClient))"),
    firstLine("gate", "const isCached = assets.length > 0 && storedGenesisHash === genesisHash"),
    firstLine("rootRoute", "<AssetRegistryGate>"),
  ]
  const results = {
    checkout,
    observationMs,
    scope: "Actual TS factory, metadata query and assets query executed; exact installed TanStack Query client used. Healthy chain, pool, EVM and state interfaces mocked. Cold React gate linkage is source-traced, not browser-rendered by this harness.",
    limits: "Pending is observed only for the stated window. The source has no fetch deadline or abort signal; the hanging injected promise never settles. This harness does not prove browser behavior for real networking or other application integrations.",
    versions,
    sourceHashes: Object.fromEntries(Object.entries(sources).map(([name, source]) => [
      relativeSources[name], createHash("sha256").update(source).digest("hex"),
    ])),
    sourceEvidence: evidence,
    cases,
  }
  fs.writeFileSync(path.join(__dirname, "metadata-faults.results.json"), JSON.stringify(results, null, 2) + "\n")
  fs.writeFileSync(path.join(__dirname, "versions.json"), JSON.stringify({ checkout, packages: versions }, null, 2) + "\n")
  for (const result of cases) {
    console.log(`${result.fault} / ${result.workflow}: ${result.state}; stored assets ${result.storedAssets}${result.error ? "; " + result.error : ""}`)
  }
  console.log(`Wrote ${path.join(__dirname, "metadata-faults.results.json")} and versions.json`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
