export type TDataEnv = "testnet" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string[]
  dataEnv: TDataEnv
}

const MAINNET_INDEXER_URL = "https://explorer.hydradx.cloud/graphql"
const MAINNET_SQUID_URL =
  "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql"

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

export const SQUID_URLS = [
  {
    name: "Whale Prod Pool 01",
    url: "https://galacticcouncil.squids.live/hydration-pools:whale-prod-pool-01/api/graphql",
  },
  {
    name: "Orca Prod",
    url: "https://galacticcouncil.squids.live/hydration-pools:orca-prod/api/graphql",
  },
]

export const PROVIDERS: ProviderProps[] = [
  createProvider("Dwellir", "wss://hydration-rpc.n.dwellir.com"),
  createProvider("Helikon", "wss://rpc.helikon.io/hydradx"),
  createProvider("Dotters", "wss://hydration.dotters.network"),
  createProvider("IBP", "wss://hydration.ibp.network"),
  createProvider("Roach", "wss://node.roach.hydration.cloud"),
  createProvider("Lait", "wss://node.lait.hydration.cloud"),
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
    "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
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
