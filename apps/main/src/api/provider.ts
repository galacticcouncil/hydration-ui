import { ApiOptions, SubstrateApis } from "@galacticcouncil/common"
import {
  getMetadata,
  hydration,
  hydrationNext,
} from "@galacticcouncil/descriptors"
import { getIndexerSdk, IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { getSquidSdk, SquidSdk } from "@galacticcouncil/indexer/squid"
import { createSdkContext, SdkCtx } from "@galacticcouncil/sdk-next"
import {
  AssetMetadataFactory,
  DryRunErrorDecoder,
  getHostnameFromUrl,
} from "@galacticcouncil/utils"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import { createWsClient } from "polkadot-api/ws"
import { useEffect, useMemo, useState } from "react"
import { doNothing, unique } from "remeda"
import { createPublicClient, custom, PublicClient } from "viem"

import { ENV } from "@/config/env"
import {
  createProvider,
  ProviderProps,
  PROVIDERS,
  TDataEnv,
} from "@/config/rpc"
import { Papi, PapiNext, useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore, useRpcListStore } from "@/states/provider"

export type TFeatureFlags = {
  hollarBondsEnabled: boolean
  bilEnabled: boolean
}

export type WsPolkadotClient = ReturnType<typeof createWsClient>

export type TProviderData = {
  queryClient: QueryClient
  papi: Papi
  papiNext: PapiNext
  sdk: SdkCtx
  papiClient: WsPolkadotClient
  evm: PublicClient
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  slotDurationMs: number
  metadata: AssetMetadataFactory
  dryRunErrorDecoder: DryRunErrorDecoder
}

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

/**
 * Live block time from the SDK — the single authority the UI trusts
 * (`ChainParams.getBlockTime()`: average `Timestamp.Now` delta over the
 * trailing blocks, cached SDK-side with a 60s TTL). The provider snapshot
 * reads it once at init — a session that spans a runtime upgrade
 * (block-time change) would otherwise keep multiplying fresh
 * block-denominated constants by a stale block time (observed on 3.lark:
 * 2s cooldown constant × frozen 6s block time → "84 days"). Re-asking the
 * SDK once a minute keeps the session honest.
 */
export const nominalBlockTimeQuery = (data: TProviderData, endpoint: string) =>
  queryOptions({
    queryKey: ["nominalBlockTime", endpoint],
    enabled: Object.keys(data.sdk).length > 0,
    queryFn: () => data.sdk.client.params.getBlockTime(),
    refetchInterval: millisecondsInMinute,
    refetchIntervalInBackground: true,
  })

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
    staleTime: Infinity,
    refetchOnWindowFocus: false,
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

  const urls = getSortedRpcUrlList(rpcUrlList, priorityRpcUrl)

  const papiClient = apis.api(urls, apiOptions) as WsPolkadotClient

  const papi = papiClient.getTypedApi(hydration)
  const papiNext = papiClient.getTypedApi(hydrationNext)

  const metadata = AssetMetadataFactory.getInstance()

  const evm = createPublicClient({
    transport: custom({
      request: ({ method, params }) =>
        papiClient._request(method, params || []),
    }),
  })

  const [sdk] = await Promise.all([
    createSdkContext(papiClient),
    metadata.fetchAssets(),
    metadata.fetchChains(),
    metadata.fetchMetadata(),
  ])

  const blockTimeMs = await sdk.client.params.getBlockTime()

  if (ENV.VITE_HSM_ENABLED) {
    sdk.ctx.pool.withHsm()
  }

  return {
    queryClient,
    papi,
    papiNext,
    papiClient,
    evm,
    sdk,
    rpcUrlList,
    slotDurationMs: blockTimeMs,
    featureFlags: {
      hollarBondsEnabled: true,
      bilEnabled: true,
    },
    metadata,
    dryRunErrorDecoder: new DryRunErrorDecoder(papiClient),
  }
}

export const useSquidUrl = (): string => {
  const { squidUrl } = useProviderRpcUrlStore()
  return squidUrl
}

export const useProxyUrl = (): string => {
  const squidUrl = useSquidUrl()

  const url = new URL(squidUrl).origin

  return `${url}/proxy`
}

export const useIndexerUrl = (): string => {
  return useState(() => ENV.VITE_INDEXER_URL)[0]
}

export const useActiveProviderProps = (): ProviderProps | null => {
  const { endpoint } = useRpcProvider()
  const { rpcList } = useRpcListStore()

  return useMemo(() => {
    if (!endpoint) return null

    const known = getProviderProps(endpoint)
    if (known) return known

    const custom = rpcList.find((rpc) => rpc.url === endpoint)
    return createProvider(
      custom?.name ?? getHostnameFromUrl(endpoint),
      endpoint,
    )
  }, [endpoint, rpcList])
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
