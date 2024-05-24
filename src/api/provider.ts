import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDisplayAssetStore } from "utils/displayAsset"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getAssets } from "./assetDetails"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useMemo } from "react"
import { useShallow } from "hooks/useShallow"
import { pick } from "utils/rx"
import { ApiOptions } from "@polkadot/api/types"
import { WsProvider } from "@polkadot/api"

export type TEnv = "testnet" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string | string[]
  dataEnv: TEnv
}

export const PROVIDERS: ProviderProps[] = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Dwellir",
    url: "wss://hydradx-rpc.dwellir.com",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Dotters",
    url: "wss://hydradx.paras.dotters.network",
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl: "https://hydra-data-squid.play.hydration.cloud/graphql",
    env: "production",
    dataEnv: "mainnet",
  },
  {
    name: "Testnet",
    url: "wss://rpc.nice.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl: "https://data-squid.nice.hydration.cloud/graphql",
    env: ["development"],
    dataEnv: "testnet",
  },
  {
    name: "Rococo via GC",
    url: "wss://hydradx-rococo-rpc.play.hydration.cloud",
    indexerUrl: "https://hydradx-rococo-explorer.play.hydration.cloud/graphql",
    squidUrl:
      "https://squid.subsquid.io/hydradx-rococo-data-squid/v/v1/graphql",
    env: ["rococo", "development"],
    dataEnv: "testnet",
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

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  typeof provider.env === "string"
    ? provider.env === import.meta.env.VITE_ENV
    : provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    autoMode: boolean
    setRpcUrl: (rpcUrl: string | undefined) => void
    getDataEnv: () => TEnv
    setAutoMode: (state: boolean) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl, autoMode } = get()
        if (!autoMode) {
          return (
            PROVIDERS.find((provider) => provider.url === rpcUrl)?.dataEnv ??
            "mainnet"
          )
        }

        return import.meta.env.VITE_ENV === "production" ? "mainnet" : "testnet"
      },
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

export const useActiveRpcUrlList = () => {
  const { autoMode, rpcUrl } = useProviderRpcUrlStore(
    useShallow((state) => pick(state, ["autoMode", "rpcUrl"])),
  )
  return autoMode ? PROVIDER_URLS : [rpcUrl]
}

export const useProviderData = () => {
  const rpcUrlList = useActiveRpcUrlList()
  const displayAsset = useDisplayAssetStore()

  return useQuery(
    QUERY_KEYS.provider(rpcUrlList.join()),
    async () => {
      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(rpcUrlList)

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
        assets: assets.assets,
        tradeRouter: assets.tradeRouter,
        featureFlags: assets.featureFlags,
        poolService: assets.poolService,
      }
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  )
}

export const useRefetchProviderData = () => {
  const queryClient = useQueryClient()
  const rpcList = useActiveRpcUrlList()

  return () => {
    queryClient.invalidateQueries(QUERY_KEYS.provider(rpcList.join()))
  }
}

export const useIndexerUrl = () => {
  const activeProvider = useActiveProvider()
  return activeProvider.indexerUrl
}

export const useSquidUrl = () => {
  const activeProvider = useActiveProvider()
  return activeProvider.squidUrl
}

export const useActiveProvider = (): ProviderProps => {
  const { data } = useProviderData()

  const activeRpcUrl = useMemo(() => {
    let rpcUrl = import.meta.env.VITE_PROVIDER_URL
    try {
      // @ts-ignore
      const options = data?.api?._options as ApiOptions
      const provider = options?.provider as WsProvider
      if (provider.endpoint) {
        rpcUrl = provider.endpoint
      }
    } catch (e) {}
    return rpcUrl
  }, [data?.api])

  return (
    PROVIDERS.find((provider) => provider.url === activeRpcUrl) || {
      name: "",
      url: import.meta.env.VITE_PROVIDER_URL,
      indexerUrl: import.meta.env.VITE_INDEXER_URL,
      squidUrl: import.meta.env.VITE_SQUID_URL,
      env: import.meta.env.VITE_ENV,
      dataEnv:
        import.meta.env.VITE_ENV === "production" ? "mainnet" : "testnet",
    }
  )
}
