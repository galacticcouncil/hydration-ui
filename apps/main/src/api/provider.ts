import { ApiOptions, SubstrateApis } from "@galacticcouncil/common"
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
import { createSdkContext, SdkCtx } from "@galacticcouncil/sdk-next"
import {
  AssetMetadataFactory,
  DryRunErrorDecoder,
} from "@galacticcouncil/utils"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import { CompatibilityLevel, PolkadotClient } from "polkadot-api"
import { WsJsonRpcProvider } from "polkadot-api/ws-provider"
import { useEffect, useMemo, useState } from "react"
import { doNothing, unique } from "remeda"
import { createPublicClient, custom, PublicClient } from "viem"

import { ProviderProps, PROVIDERS, TDataEnv } from "@/config/rpc"
import { Papi, PapiNext, useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

export type TFeatureFlags = object

export type TProviderData = {
  queryClient: QueryClient
  ws: WsJsonRpcProvider
  papi: Papi
  papiNext: PapiNext
  isNext: boolean
  sdk: SdkCtx
  papiClient: PolkadotClient
  papiCompatibilityToken: Awaited<Papi["compatibilityToken"]>
  evm: PublicClient
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  slotDurationMs: number
  metadata: AssetMetadataFactory
  dryRunErrorDecoder: DryRunErrorDecoder
}

const isHsmEnabled = import.meta.env.VITE_HSM_ENABLED === "true"

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const getProviderProps = (rpcUrl: string) =>
  PROVIDERS.find((p) => p.url === rpcUrl)

export const getDefaultDataEnv = (): TDataEnv => {
  const env = import.meta.env.VITE_ENV
  if (env === "production") return "mainnet"
  return "testnet"
}

export const getProviderDataEnv = (rpcUrl: string) => {
  const provider = getProviderProps(rpcUrl)
  return provider ? provider.dataEnv : getDefaultDataEnv()
}

type RpcProviderQueryOptions = ApiOptions & { priorityRpcUrl?: string }

export const rpcProviderQuery = (
  queryClient: QueryClient,
  rpcUrlList: string[],
  options: RpcProviderQueryOptions,
) => {
  return queryOptions({
    queryKey: ["provider"],
    queryFn: () => getProviderData(queryClient, rpcUrlList, options),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })
}

const getProviderData = async (
  queryClient: QueryClient,
  rpcUrlList: string[] = [],
  options: RpcProviderQueryOptions,
): Promise<TProviderData> => {
  const { priorityRpcUrl, ...apiOptions } = options

  const apis = SubstrateApis.getInstance()

  apis.configureMetadataCache({
    getMetadata,
    setMetadata: doNothing,
  })

  const urls = priorityRpcUrl
    ? unique([priorityRpcUrl, ...rpcUrlList])
    : rpcUrlList

  const papiClient = apis.api(urls, apiOptions)
  const ws = apis.getWs(urls)
  if (!ws) throw new Error("WsJsonRpcProvider is not available")

  const papi = papiClient.getTypedApi(hydration)
  const papiNext = papiClient.getTypedApi(hydrationNext)

  const metadata = AssetMetadataFactory.getInstance()

  const [sdk, slotDuration, papiCompatibilityToken, isNext] = await Promise.all(
    [
      createSdkContext(papiClient),
      papi.constants.Aura.SlotDuration(),
      papi.compatibilityToken,
      papiNext.constants.System.Version.isCompatible(
        CompatibilityLevel.Partial,
      ),
      metadata.fetchAssets(),
      metadata.fetchChains(),
    ],
  )

  if (isHsmEnabled) {
    sdk.ctx.pool.withHsm()
  }

  const evm = createPublicClient({
    transport: custom({
      request: ({ method, params }) =>
        papiClient._request(method, params || []),
    }),
  })

  return {
    queryClient,
    ws,
    papi,
    papiNext,
    papiClient,
    isNext,
    papiCompatibilityToken,
    evm,
    sdk,
    rpcUrlList,
    slotDurationMs: Number(slotDuration),
    featureFlags: {},
    metadata,
    dryRunErrorDecoder: new DryRunErrorDecoder(papiClient),
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

  return useMemo(() => getProviderProps(endpoint) || null, [endpoint])
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
