import { ProviderProps } from "@/api/provider"

export const PASEO_WS_URL = "paseo-rpc.play.hydration.cloud"

const defaultProvider: Omit<ProviderProps, "name" | "url"> = {
  indexerUrl: "https://explorer.hydradx.cloud/graphql",
  squidUrl:
    "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
  env: ["production"],
  dataEnv: "mainnet",
}

export const PROVIDERS: ProviderProps[] = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    ...defaultProvider,
  },
  {
    name: "Dwellir",
    url: "wss://hydration-rpc.n.dwellir.com",
    ...defaultProvider,
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    ...defaultProvider,
  },
  {
    name: "Dotters",
    url: "wss://hydration.dotters.network",
    ...defaultProvider,
  },
  {
    name: "IBP",
    url: "wss://hydration.ibp.network",
    ...defaultProvider,
  },
  {
    name: "cay",
    url: "wss://rpc.cay.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "parm",
    url: "wss://rpc.parm.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "roach",
    url: "wss://rpc.roach.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "zipp",
    url: "wss://rpc.zipp.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "sin",
    url: "wss://rpc.sin.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "coke",
    url: "wss://rpc.coke.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "3",
    url: "wss://3.rpc.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "5",
    url: "wss://5.rpc.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "Testnet",
    url: "wss://rpc.nice.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
    env: ["development"],
    dataEnv: "testnet",
  },
  {
    name: "Paseo",
    url: `wss://${PASEO_WS_URL}`,
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    env: ["rococo", "development"],
    dataEnv: "testnet",
  },
]
