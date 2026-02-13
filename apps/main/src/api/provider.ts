import { log } from "@galacticcouncil/common"
import {
  getMetadata,
  hydration,
  hydrationNext,
} from "@galacticcouncil/descriptors"
import { getIndexerSdk, IndexerSdk } from "@galacticcouncil/indexer/indexer"
import {
  getSnowbridgeSdk,
  SnowbridgeSdk,
} from "@galacticcouncil/indexer/snowbridge"
import { getSquidSdk, SquidSdk } from "@galacticcouncil/indexer/squid"
import { api, createSdkContext, pool, SdkCtx } from "@galacticcouncil/sdk-next"
import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import { CompatibilityLevel, createClient, PolkadotClient } from "polkadot-api"
import { WsEvent } from "polkadot-api/ws-provider"
import { useEffect, useMemo, useState } from "react"
import { createPublicClient, custom, PublicClient } from "viem"

import {
  createProvider,
  ProviderProps,
  PROVIDERS,
  TDataEnv,
} from "@/config/rpc"
import { Papi, PapiNext, useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

export type TFeatureFlags = object

export type TProviderData = {
  queryClient: QueryClient
  papi: Papi
  papiNext: PapiNext
  isNext: boolean
  sdk: SdkCtx
  papiClient: PolkadotClient
  papiCompatibilityToken: Awaited<Papi["compatibilityToken"]>
  evm: PublicClient
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  poolService: pool.PoolContextProvider
  endpoint: string
  dataEnv: TDataEnv
  slotDurationMs: number
  metadata: AssetMetadataFactory
}

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const getProviderProps = (url: string) =>
  PROVIDERS.find((p) => p.url === url)

export const getDefaultDataEnv = (): TDataEnv => {
  const env = import.meta.env.VITE_ENV
  if (env === "production") return "mainnet"
  return "testnet"
}

export const getProviderDataEnv = (rpcUrl: string) => {
  const provider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  return provider ? provider.dataEnv : getDefaultDataEnv()
}

export const providerQuery = (
  queryClient: QueryClient,
  rpcUrlList: string[],
) => {
  return queryOptions({
    queryKey: ["provider"],
    queryFn: () => getProviderData(queryClient, rpcUrlList),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })
}

const getProviderData = async (
  queryClient: QueryClient,
  rpcUrlList: string[] = [],
): Promise<TProviderData> => {
  let endpoint = ""
  const ws = api.getWs(rpcUrlList, {
    onStatusChanged: (status) => {
      switch (status.type) {
        case WsEvent.CONNECTING:
          log.logger.debug("[WS] CONNECTING", status.uri)
          break
        case WsEvent.CONNECTED:
          endpoint = status.uri
          log.logger.debug("[WS] CONNECTED", status.uri)
          break
        case WsEvent.CLOSE:
          log.logger.debug("[WS] CLOSED", status.event)
          break
        case WsEvent.ERROR:
          log.logger.error("[WS] ERROR", status)
          break
      }
    },
  })

  const papiClient = createClient(ws, { getMetadata })
  const papi = papiClient.getTypedApi(hydration)
  const papiNext = papiClient.getTypedApi(hydrationNext)

  const isNext = await papiNext.constants.System.Version.isCompatible(
    CompatibilityLevel.Partial,
  )

  const metadata = AssetMetadataFactory.getInstance()

  const [sdk, slotDuration, papiCompatibilityToken] = await Promise.all([
    createSdkContext(papiClient),
    papi.constants.Aura.SlotDuration(),
    papi.compatibilityToken,
    metadata.fetchAssets(),
    metadata.fetchChains(),
  ])

  const poolService = sdk.ctx.pool.withOmnipool().withStableswap().withXyk()

  const evm = createPublicClient({
    transport: custom({
      request: ({ method, params }) =>
        papiClient._request(method, params || []),
    }),
  })

  return {
    queryClient,
    papi,
    papiNext,
    papiClient,
    isNext,
    papiCompatibilityToken,
    evm,
    endpoint,
    poolService,
    sdk,
    rpcUrlList,
    dataEnv: getProviderProps(endpoint)?.dataEnv ?? getDefaultDataEnv(),
    slotDurationMs: Number(slotDuration),
    featureFlags: {},
    metadata,
  }
}

export const useSquidUrl = (): string => {
  const { squidUrl } = useProviderRpcUrlStore()
  return squidUrl
}

export const useIndexerUrl = (): string => {
  return useState(() => import.meta.env.VITE_INDEXER_URL)[0]
}

export const useSnowbridgeUrl = (): string => {
  return useState(() => import.meta.env.VITE_SNOWBRIDGE_URL)[0]
}

export const useActiveProviderProps = (): ProviderProps | null => {
  const { endpoint } = useRpcProvider()

  return useMemo(() => {
    return (
      getProviderProps(endpoint) ||
      createProvider(
        "",
        import.meta.env.VITE_PROVIDER_URL,
        import.meta.env.VITE_INDEXER_URL,
        import.meta.env.VITE_SQUID_URL,
        import.meta.env.VITE_ENV,
        getDefaultDataEnv(),
      )
    )
  }, [endpoint])
}

export const useSquidClient = (): SquidSdk => {
  const url = useSquidUrl()
  const [client, setClient] = useState<SquidSdk>(() => getSquidSdk(url))

  useEffect(() => {
    setClient(getSquidSdk(url))
  }, [url])

  return client
}

export const useIndexerClient = (): IndexerSdk => {
  const url = useIndexerUrl()
  const [client, setClient] = useState<IndexerSdk>(() => getIndexerSdk(url))

  useEffect(() => {
    setClient(getIndexerSdk(url))
  }, [url])

  return client
}

export const useSnowbridgeClient = (): SnowbridgeSdk => {
  const url = useSnowbridgeUrl()
  const [client, setClient] = useState<SnowbridgeSdk>(() =>
    getSnowbridgeSdk(url),
  )

  useEffect(() => {
    setClient(getSnowbridgeSdk(url))
  }, [url])

  return client
}
