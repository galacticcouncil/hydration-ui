import { TradeRouter } from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import {
  TAsset,
  TBond,
  TShareToken,
  TStableSwap,
  TToken,
  fallbackAsset,
  getAssets,
} from "api/assetDetails"
import { useProviderData, useProviderRpcUrlStore } from "api/provider"
import { ReactNode, createContext, useContext, useMemo } from "react"
import { useWindowFocus } from "hooks/useWindowFocus"

type IContextAssets = Awaited<ReturnType<typeof getAssets>>["assets"] & {
  all: (TToken | TBond | TStableSwap | TShareToken)[]
  isStableSwap: (asset: TAsset) => asset is TStableSwap
  isBond: (asset: TAsset) => asset is TBond
  isShareToken: (asset: TAsset) => asset is TShareToken
  getAsset: (id: string) => TAsset
  getBond: (id: string) => TBond | undefined
  getAssets: (ids: string[]) => TAsset[]
  tradeAssets: TAsset[]
}

type TProviderContext = {
  api: ApiPromise
  assets: IContextAssets
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
      const provider = providerData.data?.api

      if (provider && !provider.isConnected) {
        provider.connect()
      }
    },
  })

  const value = useMemo(() => {
    if (!!providerData.data && preference._hasHydrated) {
      const {
        tokens,
        bonds,
        stableswap,
        shareTokens,
        rawTradeAssets,
        external: externalRaw,
      } = providerData.data.assets

      const all = [
        ...tokens,
        ...bonds,
        ...stableswap,
        ...shareTokens,
        ...externalRaw,
      ]

      const allTokensObject = all.reduce<Record<string, TAsset>>(
        (acc, asset) => ({ ...acc, [asset.id]: asset }),
        {},
      )
      const isStableSwap = (asset: TAsset): asset is TStableSwap =>
        asset.isStableSwap

      const isBond = (asset: TAsset): asset is TBond => asset.isBond

      const isShareToken = (asset: TAsset): asset is TShareToken =>
        asset.isShareToken

      const getAsset = (id: string) => allTokensObject[id] ?? fallbackAsset

      const getBond = (id: string) => {
        const asset = allTokensObject[id] ?? fallbackAsset

        if (isBond(asset)) return asset
      }

      const getAssets = (ids: string[]) => ids.map((id) => getAsset(id))

      const tradeAssets = rawTradeAssets.map((tradeAsset) =>
        getAsset(tradeAsset.id),
      )

      return {
        assets: {
          ...providerData.data.assets,
          all,
          external: externalRaw,
          isStableSwap,
          isBond,
          isShareToken,
          getAsset,
          getBond,
          getAssets,
          tradeAssets,
        },
        api: providerData.data.api,
        tradeRouter: providerData.data.tradeRouter,
        featureFlags: providerData.data.featureFlags,
        isLoaded: true,
      }
    }
    return {
      isLoaded: false,
      api: {} as TProviderContext["api"],
      assets: {} as TProviderContext["assets"],
      tradeRouter: {} as TradeRouter,
      featureFlags: {} as TProviderContext["featureFlags"],
    }
  }, [preference._hasHydrated, providerData.data])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
