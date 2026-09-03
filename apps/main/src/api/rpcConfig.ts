import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { EvmParachain } from "@galacticcouncil/xc-core"
import { unique } from "remeda"

import { ENV } from "@/config/env"
import { PROVIDERS, TDataEnv } from "@/config/rpc"

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  provider.env.includes(ENV.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const getSortedRpcUrlList = (
  rpcUrlList: string[],
  priorityRpcUrl?: string,
): string[] => {
  return priorityRpcUrl ? unique([priorityRpcUrl, ...rpcUrlList]) : rpcUrlList
}

export const getProviderProps = (rpcUrl: string) =>
  PROVIDERS.find((p) => p.url === rpcUrl)

export const getDefaultDataEnv = (): TDataEnv => {
  if (ENV.VITE_ENV === "production") return "mainnet"
  return "testnet"
}

export const getProviderDataEnv = (rpcUrl: string) => {
  const provider = getProviderProps(rpcUrl)
  return provider ? provider.dataEnv : getDefaultDataEnv()
}

export const getHydrationGenesisHash = (): string =>
  (chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain).genesisHash
