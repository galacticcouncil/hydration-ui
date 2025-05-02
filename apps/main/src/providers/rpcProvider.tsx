import { AssetClient, PoolService, TradeRouter } from "@galacticcouncil/sdk"
import { changeProvider } from "@galacticcouncil/utils"
import { ApiPromise } from "@polkadot/api"
import { hydration } from "@polkadot-api/descriptors"
import { QueryFilters, useQuery, useQueryClient } from "@tanstack/react-query"
import { TypedApi } from "polkadot-api"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getProviderDataEnv,
  providerQuery,
  TFeatureFlags,
} from "@/api/provider"
import { TDataEnv } from "@/config/rpc"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useApiMetadataStore } from "@/states/metadata"
import { useProviderRpcUrlStore } from "@/states/provider"

export type Papi = TypedApi<typeof hydration>

export type TProviderContext = {
  api: ApiPromise
  papi: Papi
  isLoaded: boolean
  isApiLoaded: boolean
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  assetClient: AssetClient
  endpoint: string
  dataEnv: TDataEnv
  tradeRouter: TradeRouter
  poolService: PoolService
}

const defaultData: TProviderContext = {
  isLoaded: false,
  isApiLoaded: false,
  api: {} as TProviderContext["api"],
  papi: {} as TProviderContext["papi"],
  featureFlags: { dispatchPermit: false } as TProviderContext["featureFlags"],
  assetClient: {} as TProviderContext["assetClient"],
  rpcUrlList: [],
  endpoint: "",
  dataEnv: "mainnet",
  tradeRouter: {} as TradeRouter,
  poolService: {} as PoolService,
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

const WHITELISTED_QUERIES_ON_PROVIDER_CHANGE = ["rpcStatus"]
const RPC_CHANGE_QUERY_FILTER: QueryFilters = {
  type: "active",
  predicate: (query) =>
    !WHITELISTED_QUERIES_ON_PROVIDER_CHANGE.includes(
      query.queryKey[0] as string,
    ),
}

export const useInvalidateRpcProvider = () => {
  const [isInvalidating, setIsInvalidating] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    return useProviderRpcUrlStore.subscribe(async (state, prevState) => {
      const prevRpcUrl = prevState.rpcUrl
      const nextRpcUrl = state.rpcUrl
      const hasRpcUrlChanged = prevRpcUrl !== nextRpcUrl

      if (!hasRpcUrlChanged) return

      const prevDataEnv = getProviderDataEnv(prevRpcUrl)
      const nextDataEnv = getProviderDataEnv(nextRpcUrl)

      const hasDataEnvChanged = !nextDataEnv || prevDataEnv !== nextDataEnv

      setIsInvalidating(true)
      queryClient.removeQueries({
        queryKey: ["provider"],
      })

      if (hasDataEnvChanged) {
        queryClient.removeQueries(RPC_CHANGE_QUERY_FILTER)
      } else {
        queryClient.invalidateQueries(
          {
            ...RPC_CHANGE_QUERY_FILTER,
            refetchType: "none",
          },
          { cancelRefetch: true },
        )
      }
      await changeProvider(prevRpcUrl, nextRpcUrl)
      setIsInvalidating(false)
    })
  }, [queryClient])

  return { isInvalidating }
}

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry()
  const { rpcUrl, rpcUrlList, autoMode } = useProviderRpcUrlStore()
  const { isInvalidating } = useInvalidateRpcProvider()

  const rpcProviderUrls = autoMode ? rpcUrlList : [rpcUrl]

  const { metadata } = useApiMetadataStore()

  const { data } = useQuery({
    enabled: !isInvalidating,
    ...providerQuery(rpcProviderUrls, metadata),
  })

  const value = useMemo(() => {
    if (!data) return defaultData

    return {
      ...data,
      isApiLoaded: !!data?.api.isConnected,
      isLoaded: assets.length > 0,
    }
  }, [assets, data])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
