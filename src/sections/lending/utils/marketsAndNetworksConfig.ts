import { ChainIdToNetwork } from "@aave/contract-helpers"

import { StaticJsonRpcProvider } from "@ethersproject/providers"

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
import { RotationProvider } from "./rotationProvider"
import { ProviderWithSend, wssToHttps } from "sections/lending/utils/utils"
import { isTestnetRpcUrl, useProviderRpcUrlStore } from "api/provider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useEffect } from "react"

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
  const isTestnet = isTestnetRpcUrl(getRpcUrls()[0])
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

const providers: { [network: string]: ProviderWithSend } = {}

/**
 * Created a fallback rpc provider in which providers are prioritized from private to public and in case there are multiple public ones, from top to bottom.
 * @param chainId
 * @returns provider or fallbackprovider in case multiple rpcs are configured
 */
export const getProvider = (chainId: ChainId): ProviderWithSend => {
  if (!providers[chainId]) {
    const config = getNetworkConfig(chainId)
    const chainProviders: string[] = []
    if (config.privateJsonRPCUrl) {
      chainProviders.push(config.privateJsonRPCUrl)
    }
    if (config.publicJsonRPCUrl.length) {
      const rpcUrls = getRpcUrls().map(wssToHttps)
      const rpcUrlsByPriority = [...config.publicJsonRPCUrl].sort(
        (a, b) => rpcUrls.indexOf(a) - rpcUrls.indexOf(b),
      )
      rpcUrlsByPriority.forEach((rpc) => chainProviders.push(rpc))
    }
    if (!chainProviders.length) {
      throw new Error(`${chainId} has no jsonRPCUrl configured`)
    }
    providers[chainId] = new StaticJsonRpcProvider(chainProviders[0], chainId)
    if (chainProviders.length === 1) {
    } else {
      providers[chainId] = new RotationProvider(chainProviders, chainId)
    }
  }

  return providers[chainId]
}

export const useMarketChangeSubscription = () => {
  const { setCurrentMarket } = useProtocolDataContext()
  useEffect(() => {
    return useProviderRpcUrlStore.subscribe((state, prevState) => {
      const autoModeChanged = prevState.autoMode !== state.autoMode
      const rpcUrlChanged = prevState.rpcUrl !== state.rpcUrl

      if (autoModeChanged || rpcUrlChanged) {
        const newUrl = state.autoMode ? state.rpcUrlList[0] : state.rpcUrl
        const isTestnet = isTestnetRpcUrl(newUrl)
        setCurrentMarket(
          isTestnet
            ? CustomMarket.hydration_testnet_v3
            : CustomMarket.hydration_v3,
        )
      }
    })
  }, [setCurrentMarket])
}

export { CustomMarket }
export type { MarketDataType, NetworkConfig }
