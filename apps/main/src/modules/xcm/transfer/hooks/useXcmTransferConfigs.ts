import {
  AnyChain,
  Asset,
  ConfigBuilder,
  TransferConfigs,
} from "@galacticcouncil/xc-core"

import { useCrossChainConfigService } from "@/api/xcm"

export const useXcmTransferConfigs = (
  srcAsset: Asset | null,
  srcChain: AnyChain | null,
  destChain: AnyChain | null,
  destAsset: Asset | null,
): TransferConfigs | null => {
  const configService = useCrossChainConfigService()
  if (!srcAsset || !srcChain || !destChain || !destAsset) return null
  const { destination, destinationChains } = ConfigBuilder(configService)
    .assets()
    .asset(srcAsset)
    .source(srcChain)

  if (
    !destinationChains.some(
      ({ assetsData, key }) =>
        key === destChain.key && assetsData.has(destAsset.key),
    )
  ) {
    return null
  }

  const { build, routes } = destination(destChain)

  if (
    !routes.some(({ destination }) => destination.asset.key === destAsset.key)
  ) {
    return null
  }

  return build(destAsset)
}
