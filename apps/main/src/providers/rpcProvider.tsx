import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { hydration } from "@polkadot-api/descriptors"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { TypedApi } from "polkadot-api"
import { WsEvent } from "polkadot-api/ws-provider"
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react"

import {
  getProviderDataEnv,
  papiClientQuery,
  TProviderData,
  wsProviderQuery,
} from "@/api/provider"
import { TDataEnv } from "@/config/rpc"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useProviderRpcUrlStore } from "@/states/provider"

export type Papi = TypedApi<typeof hydration>

export type TProviderContext = TProviderData & {
  isLoaded: boolean
  isApiLoaded: boolean
  endpoint: string
  dataEnv: TDataEnv
}

const defaultData: TProviderContext = {
  isLoaded: false,
  isApiLoaded: false,
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

export const useWsProvider = () => {
  const { rpcUrl, rpcUrlList, autoMode } = useProviderRpcUrlStore()
  const queryClient = useQueryClient()
  const urls = autoMode ? rpcUrlList : [rpcUrl]

  const { data: ws } = useSuspenseQuery(wsProviderQuery(urls))

  const status = ws.getStatus()

  const isConnected =
    status &&
    (status.type === WsEvent.CONNECTED || status.type === WsEvent.CONNECTING)

  const endpoint = autoMode && isConnected ? status.uri : rpcUrl

  useEffect(() => {
    return useProviderRpcUrlStore.subscribe((state, prevState) => {
      const prevRpcUrl = prevState.rpcUrl
      const nextRpcUrl = state.rpcUrl
      const hasRpcUrlChanged = prevRpcUrl !== nextRpcUrl

      if (!hasRpcUrlChanged) return

      ws.switch(nextRpcUrl)
    })
  }, [ws, queryClient])

  return {
    ws,
    endpoint,
    dataEnv: getProviderDataEnv(endpoint),
  }
}

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry()

  const { ws, endpoint, dataEnv } = useWsProvider()

  const { data } = useSuspenseQuery(papiClientQuery(ws))

  const value = useMemo(() => {
    if (!data) return defaultData

    return {
      ...data,
      endpoint,
      dataEnv,
      isApiLoaded: Object.keys(data.papi).length > 0,
      isLoaded: assets.length > 0,
    }
  }, [assets, data, dataEnv, endpoint])

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
