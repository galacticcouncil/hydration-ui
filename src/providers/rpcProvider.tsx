import { TradeRouter } from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import { getAssets } from "api/assetDetails"
import { useProviderData, useProviderRpcUrlStore } from "api/provider"
import { ReactNode, createContext, useContext } from "react"
import { useWindowFocus } from "hooks/useWindowFocus"

type TProviderContext = {
  api: ApiPromise
  assets: Awaited<ReturnType<typeof getAssets>>["assets"]
  tradeRouter: TradeRouter
  isLoaded: boolean
  featureFlags: Awaited<ReturnType<typeof getAssets>>["featureFlags"]
}
const ProviderContext = createContext<TProviderContext>({
  isLoaded: false,
  api: {} as TProviderContext["api"],
  assets: {} as TProviderContext["assets"],
  tradeRouter: {} as TradeRouter,
  featureFlags: {} as TProviderContext["featureFlags"],
})

export const useRpcProvider = () => useContext(ProviderContext)

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const preference = useProviderRpcUrlStore()
  const providerData = useProviderData(
    preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL,
  )

  useWindowFocus({
    onFocus: () => {
      const provider = providerData.data?.provider

      if (provider && !provider.isConnected) {
        provider.connect()
      }
    },
  })

  const value =
    !!providerData.data && preference._hasHydrated
      ? {
          api: providerData.data.api,
          assets: providerData.data.assets,
          tradeRouter: providerData.data.tradeRouter,
          featureFlags: providerData.data.featureFlags,
          isLoaded: true,
        }
      : {
          isLoaded: false,
          api: {} as TProviderContext["api"],
          assets: {} as TProviderContext["assets"],
          tradeRouter: {} as TradeRouter,
          featureFlags: {} as TProviderContext["featureFlags"],
        }

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
