import { ApiPromise, WsProvider } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import * as definitions from "interfaces/voting/definitions"
import { useDisplayAssetStore } from "utils/displayAsset"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getAssets } from "./assetDetails"

export const PROVIDERS = [
  {
    name: "Mainnet via GC",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: "production",
  },
  {
    name: "Mainnet via Dwellir",
    url: "wss://hydradx-rpc.dwellir.com",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: "production",
  },
  {
    name: "Mainnet via ZeePrime",
    url: "wss://rpc-lb.data6.zp-labs.net:8443/hydradx/ws/?token=2ZGuGivPJJAxXiT1hR1Yg2MXGjMrhEBYFjgbdPi",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
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
    url: "wss://mining-rpc.hydradx.io",
    indexerUrl: "https://mining-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: "development",
  },
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

export const useProviderData = (rpcUrl?: string) => {
  const displayAsset = useDisplayAssetStore()

  return useQuery(
    QUERY_KEYS.provider(rpcUrl ?? import.meta.env.VITE_PROVIDER_URL),
    async ({ queryKey: [_, url] }) => {
      const provider = new WsProvider(url)
      const types = Object.values(definitions).reduce(
        (res, { types }): object => ({ ...res, ...types }),
        {},
      )

      const api = await ApiPromise.create({ provider, types })
      console.log(api)
      const { id, isStableCoin, update } = displayAsset

      const assets = await getAssets(api)
      console.log(assets)
      let stableCoinId: string | undefined

      // set USDT as a stable token
      stableCoinId = assets.assets.tradeAssets.find(
        (asset) => asset.symbol === "USDT",
      )?.id

      // set DAI as a stable token if there is no USDT
      if (!stableCoinId) {
        stableCoinId = assets.assets.tradeAssets.find(
          (asset) => asset.symbol === "DAI",
        )?.id
      }

      if (stableCoinId && isStableCoin && id !== stableCoinId) {
        // setting stable coin id from asset registry
        update({
          id: stableCoinId,
          symbol: "$",
          isRealUSD: false,
          isStableCoin: true,
          stableCoinId,
        })
      }

      return { api, assets: assets.assets, tradeRouter: assets.tradeRouter }
    },
    { staleTime: Infinity, refetchOnWindowFocus: true },
  )
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
