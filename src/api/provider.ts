import { QueryFilters, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useEffect, useMemo, useState } from "react"
import { useShallow } from "hooks/useShallow"
import { pick } from "utils/rx"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { useRpcProvider } from "providers/rpcProvider"
import {
  AssetClient,
  BalanceClient,
  CachingPoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import { useApiMetadata, useAssetRegistry, useSettingsStore } from "state/store"
import { undefinedNoop } from "utils/helpers"
import {
  ChainCursor,
  Ecosystem,
  ExternalAssetCursor,
} from "@galacticcouncil/apps"
import { getExternalId } from "utils/externalAssets"
import { PingResponse, pingRpc } from "utils/rpc"
import { PolkadotEvmRpcProvider } from "utils/provider"

export type TDataEnv = "testnet" | "mainnet"
export type ProviderProps = {
  name: string
  url: string
  indexerUrl: string
  squidUrl: string
  env: string | string[]
  dataEnv: TDataEnv
}

export type TFeatureFlags = {
  dispatchPermit: boolean
} & { [key: string]: boolean }

export const PASEO_WS_URL = "paseo-rpc.play.hydration.cloud"

const defaultProvider: Omit<ProviderProps, "name" | "url"> = {
  indexerUrl: "https://explorer.hydradx.cloud/graphql",
  squidUrl:
    "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
  env: "production",
  dataEnv: "mainnet",
}

export const PROVIDERS: ProviderProps[] = [
  {
    name: "GalacticCouncil",
    url: "wss://rpc.hydradx.cloud",
    ...defaultProvider,
  },
  {
    name: "Dwellir",
    url: "wss://hydration-rpc.n.dwellir.com",
    ...defaultProvider,
  },
  {
    name: "Helikon",
    url: "wss://rpc.helikon.io/hydradx",
    ...defaultProvider,
  },
  {
    name: "Dotters",
    url: "wss://hydration.dotters.network",
    ...defaultProvider,
  },
  {
    name: "IBP",
    url: "wss://hydration.ibp.network",
    ...defaultProvider,
  },
  {
    name: "cay",
    url: "wss://rpc.cay.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "parm",
    url: "wss://rpc.parm.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "roach",
    url: "wss://rpc.roach.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "zipp",
    url: "wss://rpc.zipp.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "sin",
    url: "wss://rpc.sin.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "coke",
    url: "wss://rpc.coke.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "3",
    url: "wss://3.rpc.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "5",
    url: "wss://5.rpc.hydration.cloud",
    ...defaultProvider,
  },
  {
    name: "Testnet",
    url: "wss://rpc.nice.hydration.cloud",
    indexerUrl: "https://archive.nice.hydration.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/graphql",
    env: ["development"],
    dataEnv: "testnet",
  },
  {
    name: "Paseo",
    url: `wss://${PASEO_WS_URL}`,
    indexerUrl: "https://explorer.hydradx.cloud/graphql",
    squidUrl:
      "https://galacticcouncil.squids.live/hydration-paseo-pools:prod/api/graphql",
    env: ["rococo", "development"],
    dataEnv: "testnet",
  },
]

export const PROVIDER_LIST = PROVIDERS.filter((provider) =>
  typeof provider.env === "string"
    ? provider.env === import.meta.env.VITE_ENV
    : provider.env.includes(import.meta.env.VITE_ENV),
)

export const PROVIDER_URLS = PROVIDER_LIST.map(({ url }) => url)

const getDefaultDataEnv = (): TDataEnv => {
  const env = import.meta.env.VITE_ENV
  if (env === "production") return "mainnet"
  return "testnet"
}

export const getProviderDataEnv = (rpcUrl: string) => {
  const provider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  return provider ? provider.dataEnv : getDefaultDataEnv()
}

export const isTestnetRpcUrl = (rpcUrl: string) => {
  const dataEnv = getProviderDataEnv(rpcUrl)
  return dataEnv === "testnet"
}

export async function getBestProvider(): Promise<PingResponse[]> {
  const controller = new AbortController()
  const signal = controller.signal

  const results: PingResponse[] = []

  const promises = PROVIDER_URLS.map(async (url) => {
    try {
      const res = await pingRpc(url, 5000, signal)
      if (res.ping === Infinity) return

      results.push(res)
      results.sort((a, b) => b.timestamp - a.timestamp)

      // Wait for up to 3 results, then abort
      if (results.length === 3 || results.length === PROVIDER_URLS.length) {
        controller.abort()
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error(`Error pinging RPC ${url}:`, error)
      }
    }
  })

  await Promise.all(promises)

  if (results.length === 0) {
    throw new Error("All RPC providers failed or timed out")
  }

  return results
}

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    rpcUrlList: string[]
    autoMode: boolean
    updatedAt: number
    setRpcUrl: (rpcUrl: string | undefined) => void
    setRpcUrlList: (rpcUrlList: string[], updatedAt: number) => void
    getDataEnv: () => TDataEnv
    setAutoMode: (state: boolean) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      rpcUrlList: [],
      updatedAt: 0,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setRpcUrlList: (rpcUrlList, updatedAt) => set({ rpcUrlList, updatedAt }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()
        return getProviderDataEnv(rpcUrl)
      },
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 3.2,
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)

export const useActiveRpcUrlList = () => {
  const {
    autoMode,
    rpcUrl,
    rpcUrlList: list,
  } = useProviderRpcUrlStore(
    useShallow((state) => pick(state, ["autoMode", "rpcUrl", "rpcUrlList"])),
  )
  const rpcUrlList = autoMode ? list : [rpcUrl]
  const dataEnv = getProviderDataEnv(rpcUrlList[0])
  return {
    rpcUrlList,
    rpcUrlListKey: rpcUrlList.join(","),
    dataEnv: getProviderDataEnv(rpcUrlList[0]),
    isTestnet: dataEnv === "testnet",
  }
}

export const useProviderAssets = () => {
  const { data: provider } = useProviderData()
  const { dataEnv } = useActiveRpcUrlList()

  return useQuery(
    [...QUERY_KEYS.assets(dataEnv), provider?.timestamp],
    provider
      ? async () => {
          const degenMode = useSettingsStore.getState().degenMode
          const { tokens: externalTokens } = degenMode
            ? ExternalAssetCursor.deref().state
            : useUserExternalTokenStore.getState()

          const assetClient = new AssetClient(provider.api)

          const [tradeAssets, sdkAssets] = await Promise.all([
            provider.tradeRouter.getAllAssets(),
            assetClient.getOnChainAssets(true, externalTokens[dataEnv]),
          ])

          if (sdkAssets?.length && tradeAssets?.length) {
            const { sync } = useAssetRegistry.getState()

            sync(
              sdkAssets.map((asset) => {
                const isTradable = tradeAssets.some(
                  (tradeAsset) => tradeAsset.id === asset.id,
                )
                return {
                  ...asset,
                  symbol: asset.symbol ?? "",
                  decimals: asset.decimals ?? 0,
                  name: asset.name ?? "",
                  externalId: getExternalId(asset),
                  isTradable,
                }
              }),
            )
          }

          return []
        }
      : undefinedNoop,
    {
      enabled: !!provider,
      notifyOnChangeProps: [],
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 1,
    },
  )
}

const WHITELISTED_QUERIES_ON_PROVIDER_CHANGE = ["rpcStatus"]
const RPC_CHANGE_QUERY_FILTER: QueryFilters = {
  type: "active",
  predicate: (query) =>
    !WHITELISTED_QUERIES_ON_PROVIDER_CHANGE.includes(
      query.queryKey[0] as string,
    ),
}

export const useProviderMetadata = () => {
  const { isLoaded, api } = useRpcProvider()
  const { metadata: storedMetadata, setMetadata } = useApiMetadata()

  return useQuery(
    QUERY_KEYS.providerMetadata,
    async () => {
      const [genesisHash, runtimeVersion] = await Promise.all([
        api.genesisHash.toHex(),
        api.runtimeVersion.specVersion.toNumber(),
      ])

      const metadataKey = `${genesisHash}-${runtimeVersion}`
      const isStoredMetadata =
        storedMetadata?.hasOwnProperty(metadataKey) ?? false

      if (!isStoredMetadata) {
        const metadataHex = await api.runtimeMetadata.toHex()
        setMetadata(metadataKey, metadataHex)
      }

      return true
    },
    { enabled: isLoaded, staleTime: Infinity, notifyOnChangeProps: [] },
  )
}

export const useProviderData = (
  { shouldRefetchOnRpcChange } = { shouldRefetchOnRpcChange: false },
) => {
  const queryClient = useQueryClient()
  const { metadata: storedMetadata } = useApiMetadata()
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (!shouldRefetchOnRpcChange) return
    return useProviderRpcUrlStore.subscribe(async (state, prevState) => {
      const prevRpcUrl = prevState.rpcUrl
      const nextRpcUrl = state.rpcUrl
      const hasRpcUrlChanged = prevRpcUrl !== nextRpcUrl

      if (!hasRpcUrlChanged) return

      const prevDataEnv = getProviderDataEnv(prevRpcUrl)
      const nextDataEnv = getProviderDataEnv(nextRpcUrl)

      const hasDataEnvChanged = !nextDataEnv || prevDataEnv !== nextDataEnv

      setEnabled(false)
      queryClient.removeQueries(QUERY_KEYS.provider)

      if (hasDataEnvChanged) {
        queryClient.removeQueries(RPC_CHANGE_QUERY_FILTER)
        queryClient.removeQueries(QUERY_KEYS.providerMetadata)
      } else {
        queryClient.invalidateQueries(
          {
            ...RPC_CHANGE_QUERY_FILTER,
            refetchType: "none",
          },
          { cancelRefetch: true },
        )
      }
      await changeProvider(prevRpcUrl, nextRpcUrl)
      setEnabled(true)
    })
  }, [queryClient, shouldRefetchOnRpcChange])

  return useQuery(
    QUERY_KEYS.provider,
    async () => {
      const currentRpcUrlState = useProviderRpcUrlStore.getState()
      const rpcUrlList = currentRpcUrlState.autoMode
        ? currentRpcUrlState.rpcUrlList
        : [currentRpcUrlState.rpcUrl]

      const maxRetries = rpcUrlList.length * 5
      const apiPool = SubstrateApis.getInstance()

      const api = await apiPool.api(rpcUrlList, maxRetries, storedMetadata)

      const provider = getProviderInstance(api)
      const endpoint = provider.endpoint
      const dataEnv = getProviderDataEnv(endpoint)

      const poolService = new CachingPoolService(api)
      const traderRoutes = [
        PoolType.Omni,
        PoolType.Stable,
        PoolType.XYK,
        PoolType.LBP,
      ]
      const tradeRouter = new TradeRouter(poolService, {
        includeOnly: traderRoutes,
      })

      ChainCursor.reset({
        api,
        poolService,
        router: tradeRouter,
        ecosystem: Ecosystem.Polkadot,
        isTestnet: isTestnetRpcUrl(endpoint),
      })

      const degenMode = useSettingsStore.getState().degenMode
      const { tokens: externalTokens } = degenMode
        ? ExternalAssetCursor.deref().state
        : useUserExternalTokenStore.getState()

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

      await poolService.syncRegistry(externalTokens[dataEnv])

      const [isDispatchPermitEnabled] = await Promise.all([
        api.tx.multiTransactionPayment.dispatchPermit,
        tradeRouter.getPools(),
      ])

      const balanceClient = new BalanceClient(api)

      const evm = new PolkadotEvmRpcProvider(api)

      const timestamp = new Date().toISOString()

      return {
        api,
        evm,
        tradeRouter,
        poolService,
        balanceClient,
        endpoint,
        dataEnv,
        timestamp,
        featureFlags: {
          dispatchPermit: !!isDispatchPermitEnabled,
        } as TFeatureFlags,
      }
    },
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: false,
    },
  )
}

export const useRefetchProviderData = () => {
  const queryClient = useQueryClient()
  const { dataEnv } = useActiveRpcUrlList()

  return () => {
    queryClient.invalidateQueries(QUERY_KEYS.provider)
    queryClient.invalidateQueries(QUERY_KEYS.assets(dataEnv))
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
  const { api, isLoaded } = useRpcProvider()

  const activeRpcUrl = useMemo(() => {
    if (!isLoaded) return undefined

    let rpcUrl = import.meta.env.VITE_PROVIDER_URL
    try {
      const provider = api ? getProviderInstance(api) : null
      if (provider?.endpoint) {
        rpcUrl = provider.endpoint
      }
    } catch (e) {}
    return rpcUrl
  }, [api, isLoaded])

  return (
    PROVIDERS.find((provider) => provider.url === activeRpcUrl) || {
      name: "",
      url: import.meta.env.VITE_PROVIDER_URL,
      indexerUrl: import.meta.env.VITE_INDEXER_URL,
      squidUrl: import.meta.env.VITE_SQUID_URL,
      env: import.meta.env.VITE_ENV,
      dataEnv: getDefaultDataEnv(),
    }
  )
}

export function getProviderInstance(api: ApiPromise) {
  // @ts-ignore
  const options = api?._options
  return options?.provider as WsProvider
}

export async function reconnectProvider(provider: WsProvider) {
  return new Promise((resolve, reject) => {
    provider.connect()
    if (provider.isConnected) {
      resolve(provider)
    } else {
      provider.on("connected", () => {
        resolve(provider)
      })
      provider.on("error", () =>
        reject(new Error("Failed to reconnect provider")),
      )
    }
  })
}

export async function changeProvider(prevUrl: string, nextUrl: string) {
  if (prevUrl === nextUrl) return

  const apiPool = SubstrateApis.getInstance()
  const prevApi = await apiPool.api(prevUrl)

  const nextApi = await apiPool.api(nextUrl)
  const nextProvider = getProviderInstance(nextApi)

  if (nextProvider && !nextProvider.isConnected) {
    await reconnectProvider(nextProvider)
  }

  if (nextApi && !nextApi.isConnected) {
    await nextApi.connect()
  }

  if (prevApi && prevApi.isConnected) {
    await prevApi.disconnect()
  }
}
