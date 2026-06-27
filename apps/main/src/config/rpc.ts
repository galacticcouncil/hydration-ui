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
  // EXPERIMENT (do not merge): route ALL mainnet traffic through a single
  // legacy-caching subway endpoint to validate the subway-fronting proposal.
  // subway advertises legacy state_* (no chainHead) so papi falls back to the
  // cacheable legacy path; getReadProof is now cacheable too. Throwaway test
  // endpoint on lark (galacticcouncil/subway:readproof-test, upstream Dwellir
  // mainnet). createProvider keeps the mainnet indexer/squid defaults, so
  // dataEnv stays "mainnet" and the squid still works. Original mainnet RPCs
  // (Dwellir/Rotko/sin/coke/kril/sparrow) intentionally omitted for the test.
  createProvider(
    "Legacy subway (test)",
    "wss://mainnetsub.lark.hydration.cloud",
  ),
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
