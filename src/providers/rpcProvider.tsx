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
}
const ProviderContext = createContext<TProviderContext>({
  isLoaded: false,
  api: {} as TProviderContext["api"],
  assets: {} as TProviderContext["assets"],
  tradeRouter: {} as TradeRouter,
})

export const useRpcProvider = () => useContext(ProviderContext)

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const preference = useProviderRpcUrlStore()
  const providerData = useProviderData(preference.rpcUrl)

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
          isLoaded: true,
        }
      : {
          isLoaded: false,
          api: {} as TProviderContext["api"],
          assets: {} as TProviderContext["assets"],
          tradeRouter: {} as TradeRouter,
        }

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
