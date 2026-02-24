import { log } from "@galacticcouncil/common"
import { hydration, hydrationNext } from "@galacticcouncil/descriptors"
import {
  AssetMetadataFactory,
  DryRunErrorDecoder,
} from "@galacticcouncil/utils"
import {
  QueryClient,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { TypedApi } from "polkadot-api"
import {
  StatusChange,
  WsEvent,
  WsJsonRpcProvider,
} from "polkadot-api/ws-provider"
import { createContext, ReactNode, useContext, useEffect } from "react"

import {
  getProviderDataEnv,
  rpcProviderQuery,
  TProviderData,
} from "@/api/provider"
import { TDataEnv } from "@/config/rpc"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useProviderRpcUrlStore } from "@/states/provider"

export type Papi = TypedApi<typeof hydration>
export type PapiNext = TypedApi<typeof hydrationNext>

export type TProviderContext = TProviderData & {
  isLoaded: boolean
  isApiLoaded: boolean
  dataEnv: TDataEnv
  endpoint: string
}

const defaultData: TProviderContext = {
  queryClient: {} as QueryClient,
  ws: {} as WsJsonRpcProvider,
  rpcUrlList: [],
  slotDurationMs: 6000,
  papi: {} as TProviderData["papi"],
  papiNext: {} as TProviderData["papiNext"],
  isNext: false,
  papiCompatibilityToken: {} as TProviderData["papiCompatibilityToken"],
  sdk: {} as TProviderData["sdk"],
  papiClient: {} as TProviderData["papiClient"],
  evm: {} as TProviderData["evm"],
  featureFlags: {} as TProviderData["featureFlags"],
  poolService: {} as TProviderData["poolService"],
  metadata: AssetMetadataFactory.getInstance(),
  dryRunErrorDecoder: {} as DryRunErrorDecoder,
  isLoaded: false,
  isApiLoaded: false,
  dataEnv: "mainnet",
  endpoint: "",
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

const logWsStatusChange = (status: StatusChange) => {
  switch (status.type) {
    case WsEvent.CONNECTING:
      log.logger.debug("[WS] CONNECTING", status.uri)
      break
    case WsEvent.CONNECTED:
      log.logger.debug("[WS] CONNECTED", status.uri)
      break
    case WsEvent.CLOSE:
      log.logger.debug("[WS] CLOSED", status.event)
      break
    case WsEvent.ERROR:
      log.logger.error("[WS] ERROR", status)
      break
  }
}

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const { assets } = useAssetRegistry()
  const { setRpcUrl, rpcUrl, rpcUrlList, autoMode } = useProviderRpcUrlStore()

  const { data } = useSuspenseQuery(
    rpcProviderQuery(queryClient, rpcUrlList, {
      priorityRpcUrl: !autoMode ? rpcUrl : undefined,
      probeConfig: {
        enabled: false,
      },
      wsProviderOpts: {
        onStatusChanged: (status) => {
          logWsStatusChange(status)
          if (status.type === WsEvent.CONNECTED) {
            setRpcUrl(status.uri)
          }
        },
      },
    }),
  )

  useEffect(() => {
    if (!Object.keys(data.sdk).length) return
    return () => {
      data.sdk.destroy()
    }
  }, [data?.sdk])

  const isLoaded = assets.length > 0
  const isApiLoaded =
    Object.keys(data.papi).length > 0 && Object.keys(data.ws).length > 0

  return (
    <ProviderContext.Provider
      value={{
        ...data,
        isApiLoaded,
        isLoaded,
        endpoint: rpcUrl,
        dataEnv: getProviderDataEnv(rpcUrl),
      }}
    >
      {children}
    </ProviderContext.Provider>
  )
}
