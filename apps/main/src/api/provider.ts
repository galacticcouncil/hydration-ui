import {
  AssetClient,
  BalanceClient,
  PoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { getProviderInstance, hasOwn } from "@galacticcouncil/utils"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { hydration } from "@polkadot-api/descriptors"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { createClient, PolkadotClient } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { useMemo } from "react"

import {
  createProvider,
  ProviderProps,
  PROVIDERS,
  TDataEnv,
} from "@/config/rpc"
import { useRpcProvider } from "@/providers/rpcProvider"
import { ApiMetadata, useApiMetadataStore } from "@/states/metadata"

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

export const getDefaultDataEnv = (): TDataEnv => {
  const env = import.meta.env.VITE_ENV
  if (env === "production") return "mainnet"
  return "testnet"
}

export const getProviderDataEnv = (rpcUrl: string) => {
  const provider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  return provider ? provider.dataEnv : getDefaultDataEnv()
}

export const providerQuery = (rpcUrlList: string[], metadata?: ApiMetadata) => {
  return queryOptions({
    queryKey: ["provider"],
    queryFn: () => getProviderData(rpcUrlList, metadata),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
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

const getProviderData = async (
  rpcUrlList: string[] = [],
  metadata?: ApiMetadata,
) => {
  const maxRetries = rpcUrlList.length * 5
  const apiPool = SubstrateApis.getInstance()
  const api = await apiPool.api(rpcUrlList, maxRetries, metadata)

  const papiClient = await getPapiClient(rpcUrlList)
  const papi = papiClient.getTypedApi(hydration)

  const provider = getProviderInstance(api)

  const endpoint = provider.endpoint

  const [isDispatchPermitEnabled] = await Promise.all([
    api.tx.multiTransactionPayment.dispatchPermit,
  ])

  const balanceClient = new BalanceClient(api)
  const assetClient = new AssetClient(api)

  const poolService = new PoolService(api)
  const traderRoutes = [
    PoolType.Omni,
    PoolType.Stable,
    PoolType.XYK,
    PoolType.LBP,
  ]

  const tradeRouter = new TradeRouter(poolService, {
    includeOnly: traderRoutes,
  })

  return {
    api,
    papi,
    balanceClient,
    assetClient,
    rpcUrlList,
    endpoint,
    dataEnv: getProviderProps(endpoint)?.dataEnv ?? getDefaultDataEnv(),
    tradeRouter,
    poolService,
    featureFlags: {
      dispatchPermit: !!isDispatchPermitEnabled,
    },
  }
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
  const { isLoaded, api } = useRpcProvider()
  const { metadata: storedMetadata, setMetadata } = useApiMetadataStore()

  return useQuery({
    queryKey: ["providerMetadata"],
    queryFn: async () => {
      const [genesisHash, runtimeVersion] = await Promise.all([
        api.genesisHash.toHex(),
        api.runtimeVersion.specVersion.toNumber(),
      ])

      const metadataKey = `${genesisHash}-${runtimeVersion}`
      const isCurrentMetadataStored = hasOwn(storedMetadata, metadataKey)

      if (isCurrentMetadataStored) {
        return storedMetadata
      }

      const metadataHex = api.runtimeMetadata.toHex()
      const metadata: ApiMetadata = {
        [metadataKey]: metadataHex,
      }

      setMetadata(metadata)

      return metadata
    },
    enabled: isLoaded,
    staleTime: Infinity,
    notifyOnChangeProps: [],
  })
}
