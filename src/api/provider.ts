import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDisplayAssetStore } from "utils/displayAsset"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getAssets } from "./assetDetails"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { useCallback, useEffect, useRef, useState } from "react"
import { undefinedNoop } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"

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
    autoMode: boolean
    setAutoMode: (state: boolean) => void
    setRpcUrl: (rpcUrl: string | undefined) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set) => ({
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setAutoMode: (state) => set({ autoMode: state }),
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 2.1,
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

const PROVIDER_CONNECT_TIMEOUT = 10000

const predefinedRpcUrls = PROVIDERS.filter((provider) =>
  typeof provider.env === "string"
    ? provider.env === import.meta.env.VITE_ENV
    : provider.env.includes(import.meta.env.VITE_ENV),
).map(({ url }) => url)

export const useProviderData = () => {
  const { autoMode, rpcUrl } = useProviderRpcUrlStore()
  const displayAsset = useDisplayAssetStore()
  const queryCleint = useQueryClient()

  const [activeProvider, setActiveProvider] = useState<WsProvider>()

  const initialRpcUrlList = useRef(
    autoMode
      ? predefinedRpcUrls
      : [rpcUrl ?? import.meta.env.VITE_PROVIDER_URL],
  )
  const [rpcUrlList, setRpcUrlList] = useState(initialRpcUrlList.current)

  const switchRpcList = useCallback(
    async (provider: WsProvider) => {
      console.log("[RPC] error", provider?.endpoint)
      await provider?.disconnect()
      setRpcUrlList((prev) => {
        const newList = prev.filter((item) => item !== provider?.endpoint)
        return newList.length ? newList : initialRpcUrlList.current
      })
      queryCleint.refetchQueries(["provider"])
    },
    [queryCleint],
  )

  useEffect(() => {
    if (!autoMode) return
    const id = setTimeout(async () => {
      if (activeProvider && !activeProvider?.isConnected) {
        switchRpcList(activeProvider)
      }
    }, PROVIDER_CONNECT_TIMEOUT)

    return () => clearTimeout(id)
  }, [activeProvider, autoMode, switchRpcList])

  const providerData = useQuery(
    QUERY_KEYS.provider(rpcUrlList.toString()),
    async () => {
      /* const apiPool = SubstrateApis.getInstance()
      
      const api = await apiPool.api(url) */

      const provider = new WsProvider(rpcUrlList, 500)
      console.log("[RPC] connected to", provider?.endpoint)

      setActiveProvider(provider)
      const api = await ApiPromise.create({
        noInitWarn: true,
        provider,
      })

      api.registry.register({
        XykLMDeposit: {
          shares: "u128",
          ammPoolId: "AccountId",
          yieldFarmEntries: "Vec<PalletLiquidityMiningYieldFarmEntry>",
        },
        OmnipoolLMDeposit: {
          shares: "u128",
          ammPoolId: "u32",
          yieldFarmEntries: "Vec<PalletLiquidityMiningYieldFarmEntry>",
        },
      })

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
        provider,
        assets: assets.assets,
        tradeRouter: assets.tradeRouter,
        featureFlags: assets.featureFlags,
        poolService: assets.poolService,
      }
    },
    {
      enabled: !!rpcUrlList,
      refetchOnWindowFocus: false,
      retry: false,
      onSettled(_, error) {
        if (error && autoMode && activeProvider) {
          switchRpcList(activeProvider)
        }
      },
    },
  )

  useEffect(() => {
    return onConnectErrorHandler(
      providerData?.data?.api,
      activeProvider,
      () => {
        if (!activeProvider) return
        switchRpcList(activeProvider)
      },
    )
  }, [activeProvider, providerData?.data?.api, switchRpcList])

  return providerData
}

function onConnectErrorHandler(
  api?: ApiPromise,
  provider?: WsProvider,
  onError = undefinedNoop,
) {
  let unsubApi: () => void
  let unsubProvider: () => void

  if (api && api?.isConnected) {
    api.on("error", onError)

    unsubApi = () => {
      api.off("error", onError)
    }
  }

  if (provider) {
    unsubProvider = provider.on("error", onError)
  }

  return () => {
    unsubApi?.()
    unsubProvider?.()
  }
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

export const useActiveProvider = () => {
  const { rpcUrl, autoMode } = useProviderRpcUrlStore()

  const { provider } = useRpcProvider()

  const preferredRpcUrl = rpcUrl ?? import.meta.env.VITE_SQUID_URL
  const activeRpcUrl =
    autoMode && provider?.isConnected ? provider.endpoint : preferredRpcUrl

  return PROVIDERS.find((provider) => provider.url === activeRpcUrl)
}
