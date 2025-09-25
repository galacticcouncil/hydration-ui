import { getIndexerSdk, IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { getSquidSdk, SquidSdk } from "@galacticcouncil/indexer/squid"
import { api, createSdkContext, pool, SdkCtx } from "@galacticcouncil/sdk-next"
import {
  AssetMetadataFactory,
  getProviderInstance,
  hasOwn,
} from "@galacticcouncil/utils"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { hydration } from "@polkadot-api/descriptors"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { PolkadotClient } from "polkadot-api"
import { useEffect, useMemo, useState } from "react"
import { createPublicClient, custom, PublicClient } from "viem"

import {
  createProvider,
  ProviderProps,
  PROVIDERS,
  TDataEnv,
} from "@/config/rpc"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { ApiMetadata, useApiMetadataStore } from "@/states/metadata"

export type TFeatureFlags = object

export type TProviderData = {
  papi: Papi
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

export const providerQuery = (rpcUrlList: string[]) => {
  return queryOptions({
    queryKey: ["provider"],
    queryFn: () => getProviderData(rpcUrlList),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })
}

const getProviderData = async (rpcUrlList: string[] = []) => {
  const papiClient = await api.getWs(rpcUrlList)

  const papi = papiClient.getTypedApi(hydration)

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

  /**
   * @TODO Legacy clients for backward compatibility, remove when fully migrated
   */
  const maxRetries = rpcUrlList.length * 5
  const apiPool = SubstrateApis.getInstance()
  const legacy_api = await apiPool.api(rpcUrlList, maxRetries)
  const provider = getProviderInstance(legacy_api)
  const endpoint = provider.endpoint

  return {
    papi,
    papiClient,
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
  } satisfies TProviderData
}

export const useSquidUrl = (): string => {
  return useState(() => import.meta.env.VITE_SQUID_URL)[0]
}

export const useIndexerUrl = (): string => {
  return useState(() => import.meta.env.VITE_INDEXER_URL)[0]
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

export const useProviderMetadata = () => {
  const { papi, papiClient, isApiLoaded } = useRpcProvider()
  const { metadata: storedMetadata, setMetadata } = useApiMetadataStore()

  return useQuery({
    enabled: isApiLoaded,
    queryKey: ["providerMetadata"],
    queryFn: async () => {
      const [specData, lastRuntimeUpgrade] = await Promise.all([
        papiClient.getChainSpecData(),
        papi.query.System.LastRuntimeUpgrade.getValue(),
      ])

      const genesisHash = specData.genesisHash
      const runtimeVersion = lastRuntimeUpgrade?.spec_version

      const metadataKey = `${genesisHash}-${runtimeVersion}`
      const isCurrentMetadataStored = hasOwn(storedMetadata, metadataKey)

      if (isCurrentMetadataStored) {
        return storedMetadata
      }

      const metadataBinary = await papi.apis.Metadata.metadata()
      const metadataHex = metadataBinary.asHex()
      const metadata: ApiMetadata = {
        [metadataKey]: metadataHex,
      }

      setMetadata(metadata)
      return metadata
    },

    staleTime: Infinity,
    notifyOnChangeProps: [],
  })
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
