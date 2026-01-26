import { ChainIdToNetwork } from "@aave/contract-helpers"

import {
  CustomMarket,
  MarketDataType,
  marketsData as _marketsData,
} from "@/ui-config/marketsConfig"
import {
  ChainId,
  NetworkConfig,
  networkConfigs as _networkConfigs,
} from "@/ui-config/networksConfig"

export type Pool = {
  address: string
}

export const networkConfigs = Object.keys(_networkConfigs).reduce(
  (acc, value) => {
    acc[value] = _networkConfigs[value]
    return acc
  },
  {} as { [key: string]: NetworkConfig },
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

export function getNetworkConfig(chainId: ChainId): NetworkConfig {
  const config = networkConfigs[chainId]
  if (!config) {
    // this case can only ever occure when a wallet is connected with a unknown chainId which will not allow interaction
    const name = ChainIdToNetwork[chainId]
    return {
      name: name || `unknown chainId: ${chainId}`,
    } as unknown as NetworkConfig
  }
  return config
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

export { CustomMarket }
export type { MarketDataType, NetworkConfig }
