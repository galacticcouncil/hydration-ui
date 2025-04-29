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

export const PROVIDERS: ProviderProps[] = [
  createProvider("GalacticCouncil", "wss://rpc.hydradx.cloud"),
  createProvider("Dwellir", "wss://hydration-rpc.n.dwellir.com"),
  createProvider("Helikon", "wss://rpc.helikon.io/hydradx"),
  createProvider("Dotters", "wss://hydration.dotters.network"),
  createProvider("IBP", "wss://hydration.ibp.network"),
  createProvider("cay", "wss://rpc.cay.hydration.cloud"),
  createProvider("parm", "wss://rpc.parm.hydration.cloud"),
  createProvider("roach", "wss://rpc.roach.hydration.cloud"),
  createProvider("zipp", "wss://rpc.zipp.hydration.cloud"),
  createProvider("sin", "wss://rpc.sin.hydration.cloud"),
  createProvider("coke", "wss://rpc.coke.hydration.cloud"),
  createProvider("3", "wss://3.rpc.hydration.cloud"),
  createProvider("5", "wss://5.rpc.hydration.cloud"),
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
