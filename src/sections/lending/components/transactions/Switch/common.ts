import { BaseNetworkConfig } from "sections/lending/ui-config/networksConfig"
import {
  getSupportedChainIds,
  marketsData,
  networkConfigs,
} from "sections/lending/utils/marketsAndNetworksConfig"

export interface SupportedNetworkWithChainId extends BaseNetworkConfig {
  chainId: number
}

export const supportedNetworksConfig: SupportedNetworkWithChainId[] =
  getSupportedChainIds().map((chainId) => ({
    ...networkConfigs[chainId],
    chainId,
  }))
export const supportedNetworksWithEnabledMarket =
  supportedNetworksConfig.filter((elem) =>
    Object.values(marketsData).find(
      (market) =>
        market.chainId === elem.chainId && market.enabledFeatures?.switch,
    ),
  )
