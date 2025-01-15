import {
  type TradeRouter,
  type PoolService,
  type BalanceClient,
} from "@galacticcouncil/sdk"
import { ApiPromise } from "@polkadot/api"
import {
  pingAllProvidersAndSort,
  TFeatureFlags,
  useProviderAssets,
  useProviderData,
  useProviderRpcUrlStore,
} from "api/provider"
import { ReactNode, createContext, useContext, useEffect, useMemo } from "react"
import { useWindowFocus } from "hooks/useWindowFocus"
import { useAssetRegistry } from "state/store"
import { useDisplayAssetStore } from "utils/displayAsset"
import { useShareTokens } from "api/xyk"
import { AssetsProvider } from "./assets"
import { differenceInHours } from "date-fns"
import { PolkadotEvmRpcProvider } from "utils/provider"

type TProviderContext = {
  api: ApiPromise
  evm: PolkadotEvmRpcProvider
  tradeRouter: TradeRouter
  poolService: PoolService
  balanceClient: BalanceClient
  isLoaded: boolean
  featureFlags: TFeatureFlags
}
const ProviderContext = createContext<TProviderContext>({
  isLoaded: false,
  api: {} as TProviderContext["api"],
  evm: {} as TProviderContext["evm"],
  tradeRouter: {} as TradeRouter,
  featureFlags: {} as TProviderContext["featureFlags"],
  poolService: {} as TProviderContext["poolService"],
  balanceClient: {} as TProviderContext["balanceClient"],
})

export const useRpcProvider = () => useContext(ProviderContext)

const RPC_PING_HOUR_INTERVAL = 4

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry.getState()
  const isAssets = !!assets.length
  const { data: providerData } = useProviderData()
  const displayAsset = useDisplayAssetStore()
  useProviderAssets()
  useShareTokens()

  useEffect(() => {
    const { rpcUrlList, updatedAt } = useProviderRpcUrlStore.getState()

    const hourDiff = differenceInHours(new Date(), updatedAt)

    const shouldPing =
      hourDiff >= RPC_PING_HOUR_INTERVAL || rpcUrlList.length === 0

    if (shouldPing) {
      pingAllProvidersAndSort()
    }
  }, [])

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
        isLoaded: true,
      }
    }

    return {
      isLoaded: false,
      api: {} as TProviderContext["api"],
      evm: {} as TProviderContext["evm"],
      tradeRouter: {} as TradeRouter,
      balanceClient: {} as BalanceClient,
      featureFlags: {
        dispatchPermit: true,
      } as TProviderContext["featureFlags"],
      poolService: {} as TProviderContext["poolService"],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayAsset, isAssets, providerData])

  return (
    <ProviderContext.Provider value={value}>
      <AssetsProvider>{children}</AssetsProvider>
    </ProviderContext.Provider>
  )
}
