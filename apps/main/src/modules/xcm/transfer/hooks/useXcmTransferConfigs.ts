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
  bridgeProvider?: string | null,
): TransferConfigs | null => {
  const configService = useCrossChainConfigService()
  if (!srcAsset || !srcChain || !destChain || !destAsset) return null

  // The SDK throws on unsupported source/destination/asset combos (e.g. a
  // src chain without a registered route table, or an asset with no
  // matching AssetRoute). Returning `null` lets `XcmSummary` render an
  // empty state instead of crashing into the error boundary on every
  // render — the latter loops because the form state stays put.
  try {
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

    return build(destAsset, bridgeProvider ?? undefined)
  } catch (err) {
    console.warn(
      `[xcm] no transfer config for ${srcChain.key}/${srcAsset.key} → ${destChain.key}/${destAsset.key}:`,
      err,
    )
    return null
  }
}
