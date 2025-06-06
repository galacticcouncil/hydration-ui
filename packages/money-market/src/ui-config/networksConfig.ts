import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain } from "@galacticcouncil/xcm-core"

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
  // needed for configuring the chain on metemask when it doesn't exist yet
  baseAssetDecimals: number
  // usdMarket?: boolean;
  // function returning a link to etherscan et al
  explorerLink: string
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string
  // set this to show faucets and similar
  isTestnet?: boolean
  networkLogoPath: string
  // contains the forked off chainId
  underlyingChainId?: number
  bridge?: {
    icon: string
    name: string
    url: string
  }
}

const hydration = (chainsMap.get("hydration") as EvmParachain).client.chain

export type BaseNetworkConfig = Omit<NetworkConfig, "explorerLinkBuilder">

export const networkConfigs: Record<string, BaseNetworkConfig> = {
  [ChainId.hydration]: {
    name: "Hydration",
    baseAssetSymbol: "",
    baseAssetDecimals: 18,
    explorerLink: hydration.blockExplorers?.default?.url ?? "",
    isTestnet: false,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
  [ChainId.hydration_testnet]: {
    name: "Hydration Testnet",
    baseAssetSymbol: "",
    baseAssetDecimals: 18,
    explorerLink: "https://explorer.nice.hydration.cloud",
    isTestnet: true,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
} as const
