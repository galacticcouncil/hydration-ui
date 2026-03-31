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
    name: "Orca Prod",
    url: "https://orca-main-aggr-indx.indexer.hydration.cloud",
  },
  {
    name: "Orca Prod 01 indx",
    url: "https://orca-prod-pool-01-aggr-indx.indexer.hydration.cloud",
  },
  {
    name: "Orca Prod 02 indx",
    url: "https://orca-prod-pool-02-aggr-indx.indexer.hydration.cloud",
  },
  {
    name: "Orca Prod 03 indx",
    url: "https://orca-prod-pool-03-aggr-indx.indexer.hydration.cloud",
  },
  {
    name: "Orca Prod 01 indexer",
    url: "https://orca-prod-pool-01.aggr-indexer-hydration.shadow-senate.com",
  },
  {
    name: "Orca Prod 02 indexer",
    url: "https://orca-prod-pool-02.aggr-indexer-hydration.shadow-senate.com",
  },
  {
    name: "Orca Prod 03 indexer",
    url: "https://orca-prod-pool-03.aggr-indexer-hydration.shadow-senate.com",
  },
]

export const SQUID_URLS: IndexerProps[] = SQUID_URLS_CONFIG.map((config) => ({
  ...config,
  graphqlUrl: `${config.url}/graphql`,
  metadataUrl: `${config.url}/rest/service/metadata`,
}))

export const PROVIDERS: ProviderProps[] = [
  createProvider("Dwellir", "wss://hydration-rpc.n.dwellir.com"),
  createProvider("Helikon", "wss://rpc.helikon.io/hydradx"),
  createProvider("Dotters", "wss://hydration.dotters.network"),
  createProvider("IBP", "wss://hydration.ibp.network"),
  createProvider("LATAM", "wss://hydration.rpc.stkd.io"),
  /* These RPCs don't work with Papi, disabled for now  */
  // createProvider("cay", "wss://rpc.cay.hydration.cloud"),
  // createProvider("cay2", "wss://rpc2.cay.hydration.cloud"),
  // createProvider("parm", "wss://rpc.parm.hydration.cloud"),
  // createProvider("roach", "wss://rpc.roach.hydration.cloud"),
  // createProvider("zipp", "wss://rpc.zipp.hydration.cloud"),
  // createProvider("sin", "wss://rpc.sin.hydration.cloud"),
  // createProvider("coke", "wss://rpc.coke.hydration.cloud"),
  // createProvider("lait", "wss://rpc.lait.hydration.cloud"),
  // createProvider("3", "wss://3.rpc.hydration.cloud"),
  createProvider(
    "Testnet",
    "wss://rpc.nice.hydration.cloud",
    "https://archive.nice.hydration.cloud/graphql",
    "https://unified-main-aggr-indx.indexer.hydration.cloud/graphql",
    ["development"],
    "testnet",
  ),
  createProvider(
    "Paseo",
    "wss://paseo-rpc.play.hydration.cloud",
    "https://explorer.hydradx.cloud/graphql",
    "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    ["rococo", "development"],
    "testnet",
  ),
]
