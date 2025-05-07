import { PoolService, PoolType, TradeRouter } from "@galacticcouncil/sdk"
import { api, client, pool, sor } from "@galacticcouncil/sdk-next"
import { getProviderInstance, hasOwn } from "@galacticcouncil/utils"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { ApiPromise } from "@polkadot/api"
import { hydration } from "@polkadot-api/descriptors"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { PolkadotClient } from "polkadot-api"
import { useMemo } from "react"

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
  papiClient: PolkadotClient
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  balanceClient: client.BalanceClient
  assetClient: client.AssetClient
  poolService: pool.PoolContextProvider
  endpoint: string
  dataEnv: TDataEnv
  tradeRouter: sor.TradeRouter
  tradeUtils: sor.TradeUtils
  /**
   * @deprecated
   */
  legacy_api: ApiPromise
  /**
   * @deprecated
   */
  legacy_tradeRouter: TradeRouter
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

  const balanceClient = new client.BalanceClient(papiClient)

  const assetClient = new client.AssetClient(papiClient)

  const poolService = new pool.PoolContextProvider(papiClient)
    .withOmnipool()
    .withStableswap()
    .withXyk()

  const tradeRouter = new sor.TradeRouter(poolService)
  const tradeUtils = new sor.TradeUtils(papiClient)

  /**
   * @TODO Legacy clients for backward compatibility, remove when fully migrated
   */
  const maxRetries = rpcUrlList.length * 5
  const apiPool = SubstrateApis.getInstance()
  const legacy_api = await apiPool.api(rpcUrlList, maxRetries)
  const provider = getProviderInstance(legacy_api)
  const endpoint = provider.endpoint

  const legacy_poolService = new PoolService(legacy_api)
  const legacy_tradeRouter = new TradeRouter(legacy_poolService, {
    includeOnly: [PoolType.Omni, PoolType.Stable, PoolType.XYK, PoolType.LBP],
  })

  return {
    papi,
    papiClient,
    endpoint,
    poolService,
    balanceClient,
    assetClient,
    rpcUrlList,
    dataEnv: getProviderProps(endpoint)?.dataEnv ?? getDefaultDataEnv(),
    tradeRouter,
    tradeUtils,
    featureFlags: {},
    legacy_api,
    legacy_tradeRouter,
  } satisfies TProviderData
}

export const useActiveProviderProps = (): ProviderProps | null => {
  const { endpoint } = useRpcProvider()

  return useMemo(() => {
    if (!endpoint) return null

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
