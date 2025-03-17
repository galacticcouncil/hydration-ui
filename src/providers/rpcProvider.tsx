import {
  type TradeRouter,
  type PoolService,
  type BalanceClient,
} from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import {
  TDataEnv,
  TFeatureFlags,
  useProviderAssets,
  useProviderData,
} from "api/provider"
import { ReactNode, createContext, useContext, useMemo } from "react"
import { useWindowFocus } from "hooks/useWindowFocus"
import { useAssetRegistry } from "state/store"
import { useDisplayAssetStore } from "utils/displayAsset"
import { useShareTokens } from "api/xyk"
import { PolkadotEvmRpcProvider } from "utils/provider"
import { useShallow } from "hooks/useShallow"

type TProviderContext = {
  api: ApiPromise
  balanceClient: BalanceClient
  dataEnv: TDataEnv
  endpoint: string
  evm: PolkadotEvmRpcProvider
  featureFlags: TFeatureFlags
  isLoaded: boolean
  poolService: PoolService
  tradeRouter: TradeRouter
  timestamp: string
}

const defaultData: TProviderContext = {
  api: {} as TProviderContext["api"],
  balanceClient: {} as TProviderContext["balanceClient"],
  dataEnv: "mainnet",
  endpoint: "",
  evm: {} as TProviderContext["evm"],
  featureFlags: {} as TProviderContext["featureFlags"],
  isLoaded: false,
  poolService: {} as TProviderContext["poolService"],
  tradeRouter: {} as TradeRouter,
  timestamp: "",
}

const ProviderContext = createContext<TProviderContext>(defaultData)

export const useRpcProvider = () => useContext(ProviderContext)

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const assets = useAssetRegistry(useShallow((state) => state.assets))

  const isAssets = !!assets.length
  const { data: providerData } = useProviderData({
    shouldRefetchOnRpcChange: true,
  })
  const displayAsset = useDisplayAssetStore()
  useProviderAssets()
  useShareTokens()

  useWindowFocus({
    onFocus: () => {
      const provider = providerData?.api

      if (provider && !provider.isConnected) {
        provider.connect()
      }
    },
  })

  const value = useMemo(() => {
    if (!!providerData && isAssets) {
      const {
        isStableCoin,
        stableCoinId: chainStableCoinId,
        update,
      } = displayAsset

      let stableCoinId: string | undefined

      // set USDT as a stable token
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
        poolService: providerData.poolService,
        api: providerData.api,
        evm: providerData.evm,
        tradeRouter: providerData.tradeRouter,
        balanceClient: providerData.balanceClient,
        featureFlags: providerData.featureFlags,
        isLoaded: providerData.api.isConnected,
        endpoint: providerData.endpoint,
        dataEnv: providerData.dataEnv,
        timestamp: providerData.timestamp,
      }
    }

    return {
      ...defaultData,
      featureFlags: {
        ...defaultData.featureFlags,
        dispatchPermit: true, // optimistically assume dispatch permit is enabled
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayAsset, isAssets, providerData])

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  )
}
