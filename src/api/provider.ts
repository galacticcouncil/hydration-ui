import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDisplayAssetStore } from "utils/displayAsset"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getAssets } from "./assetDetails"
import { SubstrateApis } from "@galacticcouncil/xcm-sdk"

export const PROVIDERS = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
  },
  {
    name: "Dwellir",
    url: "wss://hydradx-rpc.dwellir.com",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
  },
  {
    name: "Dotters",
    url: "wss://hydradx.paras.dotters.network",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
  },
  {
    name: "Rococo via GC",
    url: "wss://hydradx-rococo-rpc.play.hydration.cloud",
    indexerUrl: "https://hydradx-rococo-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: ["rococo", "development"],
  },
  {
    name: "Testnet",
    url: "wss://rpc.nice.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl: "https://data-squid.nice.hydration.cloud/graphql",
    env: ["development"],
  },
  /*{
    name: "Testnet",
    url: "wss://mining-rpc.hydradx.io",
    indexerUrl: "https://mining-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: "development",
  },*/
]

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl?: string
    setRpcUrl: (rpcUrl: string | undefined) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set) => ({
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 2,
      getStorage: () => ({
        async getItem(name: string) {
          return window.localStorage.getItem(name)
        },
        setItem(name, value) {
          window.localStorage.setItem(name, value)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)

export const useProviderData = (rpcUrl: string) => {
  const displayAsset = useDisplayAssetStore()

  return useQuery(
    QUERY_KEYS.provider(rpcUrl),
    async ({ queryKey: [_, url] }) => {
      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(url)

      const {
        isStableCoin,
        stableCoinId: chainStableCoinId,
        update,
      } = displayAsset

      const assets = await getAssets(api)
      let stableCoinId: string | undefined

      // set USDT as a stable token
      stableCoinId = assets.assets.rawTradeAssets.find(
        (asset) => asset.symbol === "USDT",
      )?.id

      // set DAI as a stable token if there is no USDT
      if (!stableCoinId) {
        stableCoinId = assets.assets.rawTradeAssets.find(
          (asset) => asset.symbol === "DAI",
        )?.id
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
        api,
        assets: assets.assets,
        tradeRouter: assets.tradeRouter,
        featureFlags: assets.featureFlags,
      }
    },
    { refetchOnWindowFocus: false },
  )
}

export const useRefetchProviderData = () => {
  const queryClient = useQueryClient()

  const preference = useProviderRpcUrlStore()

  return () => {
    const url = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
    url && queryClient.invalidateQueries(QUERY_KEYS.provider(url))
  }
}

export const useIndexerUrl = () => {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)

  const indexerUrl =
    selectedProvider?.indexerUrl ?? import.meta.env.VITE_INDEXER_URL
  return indexerUrl
}

export const useSquidUrl = () => {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_SQUID_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)

  const indexerUrl =
    selectedProvider?.squidUrl ?? import.meta.env.VITE_SQUID_URL
  return indexerUrl
}
