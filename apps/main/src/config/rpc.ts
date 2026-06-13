export type TDataEnv = "testnet" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string[]
  dataEnv: TDataEnv
}

export type IndexerProps = {
  name: string
  url: string
  graphqlUrl: string
  metadataUrl: string
}

const MAINNET_INDEXER_URL = "https://explorer.hydradx.cloud/graphql"
const MAINNET_SQUID_URL =
  "https://unified-main-aggr-indx.indexer.hydration.cloud/graphql"

export const createProvider = (
  name: string,
  url: string,
  indexerUrl = MAINNET_INDEXER_URL,
  squidUrl = MAINNET_SQUID_URL,
  env = ["production"],
  dataEnv: TDataEnv = "mainnet",
): ProviderProps => ({
  name,
  url,
  indexerUrl,
  squidUrl,
  env,
  dataEnv,
})

export const SQUID_URLS_CONFIG = [
  {
    name: "Orca",
    url: "https://orca-prod-pool-01.orca.hydration.cloud",
  },
  {
    name: "Catfish",
    url: "https://orca-prod-pool-02.catfish.hydration.cloud",
  },
]

export const SQUID_URLS: IndexerProps[] = SQUID_URLS_CONFIG.map((config) => ({
  ...config,
  graphqlUrl: `${config.url}/graphql`,
  metadataUrl: `${config.url}/rest/service/metadata`,
}))

export const PROVIDERS: ProviderProps[] = [
  createProvider("Dwellir", "wss://hydration-rpc.n.dwellir.com"),
  createProvider("Dotters", "wss://hydration.dotters.network"),
  createProvider("IBP", "wss://hydration.ibp.network"),
  createProvider("LATAM", "wss://hydration.rpc.stkd.io"),
  createProvider("zipp", "wss://rpc.zipp.hydration.cloud"),
  createProvider("roach", "wss://rpc.roach.hydration.cloud"),
  createProvider("lait", "wss://rpc.lait.hydration.cloud"),
  //createProvider("parm", "wss://rpc.parm.hydration.cloud"),
  createProvider("sin", "wss://rpc.sin.hydration.cloud"),
  createProvider("coke", "wss://rpc.coke.hydration.cloud"),
  // createProvider("owl", "wss://rpc-owl-1.owl.shadow-senate.com"),
  // BIL Vault lives on lark-2 — default dev RPC on this branch.
  // `DataProviderResolver` picks the dev candidate with the freshest
  // latest-block timestamp from `getBestRpcs`, so to make lark-2 the
  // deterministic default we keep it as the ONLY `["development"]` entry
  // (nice has been moved off the dev tag below; it's still reachable via
  // the manual RPC picker). See `aave-v3-deploy/bil-vault/deployments/
  // lark-2.md` for the matching contract manifest.
  createProvider(
    "Lark-2 (BIL)",
    "wss://2.lark.hydration.cloud",
    "https://archive.nice.hydration.cloud/graphql",
    "https://unified-main-aggr-indx.indexer.hydration.cloud/graphql",
    ["development"],
    "testnet",
  ),
  createProvider(
    "Nice testnet",
    "wss://rpc.nice.hydration.cloud",
    "https://archive.nice.hydration.cloud/graphql",
    "https://unified-main-aggr-indx.indexer.hydration.cloud/graphql",
    [],
    "testnet",
  ),
  createProvider(
    "Paseo",
    "wss://paseo-rpc.play.hydration.cloud",
    "https://explorer.hydradx.cloud/graphql",
    "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    ["rococo"],
    "testnet",
  ),
]
