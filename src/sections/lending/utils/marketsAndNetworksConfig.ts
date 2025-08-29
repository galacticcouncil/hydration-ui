import { ChainIdToNetwork } from "@aave/contract-helpers"
import { Provider } from "@ethersproject/providers"

import {
  CustomMarket,
  MarketDataType,
  marketsData as _marketsData,
} from "sections/lending/ui-config/marketsConfig"
import {
  BaseNetworkConfig,
  ChainId,
  ExplorerLinkBuilderConfig,
  ExplorerLinkBuilderProps,
  NetworkConfig,
  networkConfigs as _networkConfigs,
} from "sections/lending/ui-config/networksConfig"
import {
  isPaseoRpcUrl,
  isTestnetRpcUrl,
  useProviderRpcUrlStore,
} from "api/provider"
import { useCallback, useEffect } from "react"
import { useRootStore } from "sections/lending/store/root"
import { useRpcProvider } from "providers/rpcProvider"
import { pick } from "utils/rx"

export type Pool = {
  address: string
}

window.global ||= window

export const networkConfigs = Object.keys(_networkConfigs).reduce(
  (acc, value) => {
    acc[value] = _networkConfigs[value]
    return acc
  },
  {} as { [key: string]: BaseNetworkConfig },
)

export const marketsData = Object.keys(_marketsData).reduce(
  (acc, value) => {
    acc[value] = _marketsData[value as keyof typeof CustomMarket]
    return acc
  },
  {} as { [key: string]: MarketDataType },
)

export function getDefaultChainId() {
  return marketsData[availableMarkets[0]].chainId
}

export const getRpcUrls = () => {
  const { autoMode, rpcUrl, rpcUrlList } = useProviderRpcUrlStore.getState()
  return autoMode ? rpcUrlList : [rpcUrl]
}

export function getSupportedChainIds(): number[] {
  return Array.from(
    Object.keys(marketsData).reduce(
      (acc, value) =>
        acc.add(marketsData[value as keyof typeof CustomMarket].chainId),
      new Set<number>(),
    ),
  )
}

export const availableMarkets = Object.keys(marketsData).filter((key) =>
  getSupportedChainIds().includes(
    marketsData[key as keyof typeof CustomMarket].chainId,
  ),
) as CustomMarket[]

export const getInitialMarket = () => {
  const bestRpcUrl = getRpcUrls()[0]

  if (isPaseoRpcUrl(bestRpcUrl)) {
    return CustomMarket.hydration_v3
  }

  const isTestnet = isTestnetRpcUrl(bestRpcUrl)
  return isTestnet
    ? CustomMarket.hydration_testnet_v3
    : CustomMarket.hydration_v3
}

const linkBuilder =
  ({
    baseUrl,
    addressPrefix = "address",
    txPrefix = "tx",
  }: ExplorerLinkBuilderConfig) =>
  ({ tx, address }: ExplorerLinkBuilderProps): string => {
    if (tx) {
      return `${baseUrl}/${txPrefix}/${tx}`
    }
    if (address) {
      return `${baseUrl}/${addressPrefix}/${address}`
    }
    return baseUrl
  }

export function getNetworkConfig(chainId: ChainId): NetworkConfig {
  const config = networkConfigs[chainId]
  if (!config) {
    // this case can only ever occure when a wallet is connected with a unknown chainId which will not allow interaction
    const name = ChainIdToNetwork[chainId]
    return {
      name: name || `unknown chainId: ${chainId}`,
    } as unknown as NetworkConfig
  }
  return {
    ...config,
    explorerLinkBuilder: linkBuilder({ baseUrl: config.explorerLink }),
  }
}

export const isFeatureEnabled = {
  faucet: (data: MarketDataType) => data.enabledFeatures?.faucet,
  liquiditySwap: (data: MarketDataType) => data.enabledFeatures?.liquiditySwap,
  collateralRepay: (data: MarketDataType) =>
    data.enabledFeatures?.collateralRepay,
  permissions: (data: MarketDataType) => data.enabledFeatures?.permissions,
  debtSwitch: (data: MarketDataType) => data.enabledFeatures?.debtSwitch,
  withdrawAndSwitch: (data: MarketDataType) =>
    data.enabledFeatures?.withdrawAndSwitch,
  switch: (data: MarketDataType) => data.enabledFeatures?.switch,
}

export const getProvider = (_chainId: ChainId): Provider => {
  const { provider } = useRootStore.getState()
  if (!provider) throw new Error("Provider not set")
  return provider
}

export const useMoneyMarketInit = () => {
  const { isLoaded, evm, dataEnv } = useRpcProvider()
  const { provider, setProvider, setCurrentMarket } = useRootStore(
    useCallback(
      (state) => pick(state, ["provider", "setProvider", "setCurrentMarket"]),
      [],
    ),
  )

  useEffect(() => {
    setProvider(null)
    if (isLoaded && evm) {
      setCurrentMarket(
        dataEnv === "mainnet"
          ? CustomMarket.hydration_v3
          : CustomMarket.hydration_testnet_v3,
      )
      setProvider(evm)
    }
  }, [dataEnv, evm, isLoaded, setCurrentMarket, setProvider])

  return { isLoading: !isLoaded || !provider }
}

export { CustomMarket }
export type { MarketDataType, NetworkConfig }
