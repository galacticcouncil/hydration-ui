import {
  AssetClient,
  type PoolService,
  type TradeRouter,
} from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { createContext, ReactNode, useContext, useMemo } from "react"

import { providerQuery, TFeatureFlags } from "@/api/provider"
import { useAssetRegistry } from "@/states/assetRegistry"
import { useDisplayAssetStore } from "@/states/displayAsset"

export type TProviderContext = {
  api: ApiPromise
  tradeRouter: TradeRouter
  poolService: PoolService
  isLoaded: boolean
  isApiLoaded: boolean
  featureFlags: TFeatureFlags
  rpcUrlList: string[]
  assetClient: AssetClient
}

const defaultData = {
  isLoaded: false,
  isApiLoaded: false,
  api: {} as TProviderContext["api"],
  tradeRouter: {} as TradeRouter,
  featureFlags: { dispatchPermit: false } as TProviderContext["featureFlags"],
  poolService: {} as TProviderContext["poolService"],
  assetClient: {} as TProviderContext["assetClient"],
  rpcUrlList: [],
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry()
  const isAssets = !!assets.length
  const { data } = useQuery(providerQuery())

  const displayAsset = useDisplayAssetStore()

  //   useWindowFocus({
  //     onFocus: () => {
  //       const provider = providerData.data?.api

  //       if (provider && !provider.isConnected) {
  //         provider.connect()
  //       }
  //     },
  //   })

  const value = useMemo(() => {
    if (data) {
      const {
        isStableCoin,
        stableCoinId: chainStableCoinId,
        update,
      } = displayAsset

      let stableCoinId: string | undefined

      //set USDT as a stable token
      stableCoinId = assets.find((asset) => asset.symbol === "USDT")?.id

      // set DAI as a stable token if there is no USDT
      if (!stableCoinId) {
        stableCoinId = assets.find((asset) => asset.symbol === "DAI")?.id
      }

      if (stableCoinId && isStableCoin && chainStableCoinId !== stableCoinId) {
        // setting stable coin id from asset registry
        update({
          id: stableCoinId,
          symbol: "$",
          isRealUSD: false,
          isStableCoin: true,
          stableCoinId,
        })
      }

      return {
        ...data,
        isApiLoaded: !!Object.keys(data.api).length,
        isLoaded: isAssets,
      }
    }

    return defaultData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isAssets])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
