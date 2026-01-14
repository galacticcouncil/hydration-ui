import { AssetMetadataFactory } from "@galacticcouncil/utils"
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
  TProviderData,
} from "@/api/provider"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useProviderRpcUrlStore } from "@/states/provider"

export type Papi = TypedApi<typeof hydration>

export type TProviderContext = TProviderData & {
  isLoaded: boolean
  isApiLoaded: boolean
}

const defaultData: TProviderContext = {
  isLoaded: false,
  isApiLoaded: false,
  rpcUrlList: [],
  endpoint: "",
  dataEnv: "mainnet",
  slotDurationMs: 6000,
  papi: {} as TProviderData["papi"],
  papiCompatibilityToken: {} as TProviderData["papiCompatibilityToken"],
  sdk: {} as TProviderData["sdk"],
  papiClient: {} as TProviderData["papiClient"],
  evm: {} as TProviderData["evm"],
  featureFlags: {} as TProviderData["featureFlags"],
  poolService: {} as TProviderData["poolService"],
  metadata: AssetMetadataFactory.getInstance(),
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

  // @TODO enable when Papi supports cached metadata
  // const { metadata } = useApiMetadataStore()

  const { data } = useQuery({
    enabled: !isInvalidating,
    ...providerQuery(rpcProviderUrls),
  })

  const value = useMemo(() => {
    if (!data) return defaultData

    return {
      ...data,
      isApiLoaded: Object.keys(data.papi).length > 0,
      isLoaded: assets.length > 0,
    }
  }, [assets, data])

  useEffect(() => {
    if (!data?.sdk) {
      return
    }

    return () => {
      data.sdk.destroy()
      data.papiClient.destroy()
    }
  }, [data?.sdk, data?.papiClient])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
