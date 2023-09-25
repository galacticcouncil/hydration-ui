import { TradeRouter } from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import { TAsset, TBond, TStableSwap, TToken } from "api/assetDetails"
import { useProviderData, useProviderRpcUrlStore } from "api/provider"
import { ReactNode, createContext, useContext } from "react"

type TProviderContext = {
  api: ApiPromise
  assets: {
    all: TAsset[]
    tokens: TToken[]
    bonds: TBond[]
    stableswap: TStableSwap[]
    native: TToken
    tradeAssets: TAsset[]
    getAsset: (assetId: string) => TAsset
    getAssets: (assetIds: string[]) => TAsset[]
  }
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
