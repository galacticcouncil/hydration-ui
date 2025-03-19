import {
  AssetClient,
  BalanceClient,
  PoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { hydration } from "@polkadot-api/descriptors"
import { queryOptions } from "@tanstack/react-query"
import { createClient, PolkadotClient } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"

import { PROVIDERS } from "@/config/rpc"

export type TDataEnv = "testnet" | "paseo" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string[]
  dataEnv: TDataEnv
}

export type TFeatureFlags = {
  dispatchPermit: boolean
}

export type TProviderData = Awaited<ReturnType<typeof getProviderData>>

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const getProviderProps = (url: string) =>
  PROVIDERS.find((p) => p.url === url)

type ProviderQueryOptions = {
  onSuccess?: (endpoint: string) => void
}

export const providerQuery = (
  rpcUrlList: string[],
  options: ProviderQueryOptions = {},
) => {
  return queryOptions({
    queryKey: ["provider", rpcUrlList.join()],
    queryFn: async () => {
      const data = await getProviderData(rpcUrlList)
      const provider = getProviderInstance(data.api)

      options.onSuccess?.(provider.endpoint)

      return data
    },
    enabled: !!rpcUrlList.length,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const getPapiClient = async (
  wsUrl: string | string[],
): Promise<PolkadotClient> => {
  const endpoints = typeof wsUrl === "string" ? wsUrl.split(",") : wsUrl
  const getWsProvider = (await import("polkadot-api/ws-provider/web"))
    .getWsProvider

  const wsProvider = getWsProvider(endpoints)
  return createClient(withPolkadotSdkCompat(wsProvider))
}

const getProviderData = async (rpcUrlList: string[]) => {
  const maxRetries = rpcUrlList.length * 5
  const apiPool = SubstrateApis.getInstance()
  const api = await apiPool.api(rpcUrlList, maxRetries)

  const papiClient = await getPapiClient(rpcUrlList)
  const papi = papiClient.getTypedApi(hydration)

  const provider = getProviderInstance(api)

  const endpoint = provider.endpoint

  const [isDispatchPermitEnabled] = await Promise.all([
    api.tx.multiTransactionPayment.dispatchPermit,
  ])

  const balanceClient = new BalanceClient(api)
  const assetClient = new AssetClient(api)

  return {
    api,
    papi,
    balanceClient,
    assetClient,
    rpcUrlList,
    endpoint,
    dataEnv: PROVIDERS.find((p) => p.url === endpoint)?.dataEnv ?? "mainnet",
    featureFlags: {
      dispatchPermit: !!isDispatchPermitEnabled,
    },
  }
}

export function getProviderInstance(api: ApiPromise) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const options = api?._options
  return options?.provider as WsProvider
}

export async function reconnectProvider(provider: WsProvider) {
  if (provider?.isConnected) return
  await provider.connect()
  await new Promise((resolve) => {
    if (provider.isConnected) {
      resolve(provider)
    } else {
      provider.on("connected", () => {
        resolve(provider)
      })
    }
  })
}

export async function changeProvider(prevUrl: string, nextUrl: string) {
  if (prevUrl === nextUrl) return
  const apiPool = SubstrateApis.getInstance()
  const prevApi = await apiPool.api(prevUrl)

  if (prevApi && prevApi.isConnected) {
    await prevApi.disconnect()
  }

  const nextApi = await apiPool.api(nextUrl)

  if (nextApi && !nextApi.isConnected) {
    await reconnectProvider(getProviderInstance(nextApi))
  }
}

let tradeRouter: TradeRouter | null = null
let poolService: PoolService | null = null

export const initializeServices = (api: ApiPromise) => {
  if (!poolService) {
    poolService = new PoolService(api)

    tradeRouter = new TradeRouter(poolService, {
      includeOnly: [PoolType.Omni, PoolType.Stable, PoolType.XYK, PoolType.LBP],
    })
  }

  return { poolService, tradeRouter }
}

export const getTradeRouter = () => {
  if (!tradeRouter) {
    throw new Error(
      "TradeRouter has not been initialized. Call initializeServices(api) first.",
    )
  }
  return tradeRouter
}

export const getPoolService = () => {
  if (!poolService) {
    throw new Error(
      "PoolService has not been initialized. Call initializeServices(api) first.",
    )
  }
  return poolService
}
