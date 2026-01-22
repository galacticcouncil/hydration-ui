export enum ChainId {
  hydration = 222222,
  // Mock Hydration testnet chain ID so we can differentiate between mainnet and testnet
  hydration_testnet = 333333,
}

export type ExplorerLinkBuilderProps = {
  tx?: string
  address?: string
}

export type ExplorerLinkBuilderConfig = {
  baseUrl: string
  addressPrefix?: string
  txPrefix?: string
}

export type NetworkConfig = {
  name: string
  displayName?: string
  baseAssetSymbol: string
  baseAssetDecimals: number
  isTestnet?: boolean
  networkLogoPath: string
  underlyingChainId?: number
  bridge?: {
    icon: string
    name: string
    url: string
  }
}

export const networkConfigs: Record<string, NetworkConfig> = {
  [ChainId.hydration]: {
    name: "Hydration",
    baseAssetSymbol: "",
    baseAssetDecimals: 18,
    isTestnet: false,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
  [ChainId.hydration_testnet]: {
    name: "Hydration Testnet",
    baseAssetSymbol: "",
    baseAssetDecimals: 18,
    isTestnet: true,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
} as const
