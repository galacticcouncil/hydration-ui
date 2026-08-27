import {
  hydration,
  hydrationIce,
  hydrationNext,
} from "@galacticcouncil/descriptors"
import {
  AssetMetadataFactory,
  DryRunErrorDecoder,
  logger,
} from "@galacticcouncil/utils"
import {
  QueryClient,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { StatusChange, WsEvent } from "polkadot-api/ws"
import { createContext, ReactNode, useContext, useEffect } from "react"
import { isFunction } from "remeda"

import { chainSpecDataQueryOptions, isHydrationFork } from "@/api/chainSpec"
import {
  getProviderDataEnv,
  rpcProviderQuery,
  TProviderData,
} from "@/api/provider"
import { TDataEnv } from "@/config/rpc"
import { useAssetRegistryStore } from "@/states/assetRegistry"
import { useProviderRpcUrlStore } from "@/states/provider"

export type Papi = TypedApi<typeof hydration>
export type PapiNext = TypedApi<typeof hydrationNext>
export type PapiIce = TypedApi<typeof hydrationIce>

export type TProviderContext = TProviderData & {
  /** The endpoint is connected and not mid-switch. */
  isEndpointSettled: boolean
  /** The endpoint is settled AND the asset registry is populated for it. */
  isReady: boolean
  dataEnv: TDataEnv
  endpoint: string
  isFork: boolean
}

/**
 * The boot shell's context, and load-bearing despite the casts.
 *
 * The root route's `pendingComponent` is the router's top-level Suspense
 * fallback, and the root match gets no boundary of its own - so while
 * `RpcProvider`'s suspense query is pending, `LayoutSkeleton` renders OUTSIDE
 * this provider. Its tree calls `useRpcProvider()` unconditionally (Footer ->
 * DataProviderSelect, SubNavBar -> useNavigation, Settings). Those reads only
 * touch `featureFlags` and `isReady: false`; everything that would touch
 * `papi`/`sdk` is gated behind `isReady`, which is why the casts never blow up.
 *
 * Removing this default - or making `useRpcProvider()` throw - white-screens
 * every cold boot until that shell tree is made provider-free.
 */
const defaultData: TProviderContext = {
  queryClient: {} as QueryClient,
  rpcUrlList: [],
  papi: {} as Papi,
  papiNext: {} as PapiNext,
  papiIce: {} as PapiIce,
  sdk: {} as TProviderData["sdk"],
  papiClient: {} as TProviderData["papiClient"],
  genesisHash: "",
  evm: {} as TProviderData["evm"],
  featureFlags: {
    hollarBondsEnabled: true,
    bilEnabled: false,
    isIceEnabled: false,
  },
  dryRunErrorDecoder: {} as DryRunErrorDecoder,
  isEndpointSettled: false,
  isReady: false,
  dataEnv: "mainnet",
  endpoint: "",
  isFork: false,
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

const logWsStatusChange = (status: StatusChange) => {
  switch (status.type) {
    case WsEvent.CONNECTING:
      logger.info("[WS] CONNECTING", status.uri)
      break
    case WsEvent.CONNECTED:
      logger.info("[WS] CONNECTED", status.uri)
      break
    case WsEvent.CLOSE:
      logger.info("[WS] CLOSED", status.event)
      break
    case WsEvent.ERROR:
      logger.error("[WS] ERROR", status)
      break
  }
}

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const { assets } = useAssetRegistry()
  const {
    rpcUrl,
    connectedRpcUrl,
    rpcUrlList,
    setRpcUrl,
    setConnectedRpcUrl,
    setIsRpcConnecting,
  } = useProviderRpcUrlStore()

  const { data } = useSuspenseQuery(
    rpcProviderQuery(queryClient, rpcUrlList, {
      priorityRpcUrl: rpcUrl,
      probeConfig: {
        enabled: false,
      },
      wsProviderOpts: {
        onStatusChanged: (status) => {
          logWsStatusChange(status)
          if (status.type === WsEvent.CONNECTING) setIsRpcConnecting(true)
          if (status.type === WsEvent.CONNECTED) {
            const { rpcUrl, connectedRpcUrl } =
              useProviderRpcUrlStore.getState()
            if (status.uri !== connectedRpcUrl) {
              setConnectedRpcUrl(status.uri)
            }
            if (status.uri !== rpcUrl) setRpcUrl(status.uri)
            setIsRpcConnecting(false)
          }
        },
      },
    }),
  )

  useEffect(() => {
    const client = data.papiClient
    if (!isFunction(client?.switch)) return

    // switch to best rpc when auto mode is enabled
    return useProviderRpcUrlStore.subscribe((state, prevState) => {
      if (!state.autoMode || state.rpcUrl === prevState.rpcUrl) return
      client.switch(state.rpcUrl)
    })
  }, [data.papiClient])

  useEffect(() => {
    if (!Object.keys(data.sdk).length) return
    return () => {
      data.sdk.destroy()
    }
  }, [data?.sdk])

  const isLoaded = assets.length > 0
  const isApiLoaded =
    Object.keys(data.papi).length > 0 && rpcUrl === connectedRpcUrl

  const dataEnv = getProviderDataEnv(rpcUrl)

  const { data: chainSpec } = useQuery(
    chainSpecDataQueryOptions(
      connectedRpcUrl,
      data.papiClient,
      data.papi,
      isApiLoaded,
    ),
  )

  const isFork = isHydrationFork(chainSpec?.chainSpecData.genesisHash)

  return (
    <ProviderContext.Provider
      value={{
        ...data,
        isApiLoaded,
        isLoaded,
        endpoint: rpcUrl,
        dataEnv,
        isFork,
      }}
    >
      {children}
    </ProviderContext.Provider>
  )
}
