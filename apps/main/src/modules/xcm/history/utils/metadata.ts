import type { XcAssetOperation, XcJourney } from "@galacticcouncil/xc-scan"

import type { XcScanAssets, XcScanChains } from "@/api/xcScanMetadata"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"

const hasDecimals = (asset: Pick<XcAssetOperation, "decimals">) =>
  Number.isInteger(asset.decimals) &&
  asset.decimals !== undefined &&
  asset.decimals >= 0 &&
  asset.decimals <= 255

export const hasJourneyAssetMetadata = (asset: XcAssetOperation) =>
  !!asset.symbol && hasDecimals(asset)

export const getJourneyChainName = (urn: string, chains: XcScanChains = {}) =>
  resolveChainFromUrn(urn)?.name ?? chains[urn]?.runtimeChain ?? urn

export const enrichJourneyAsset = (
  asset: XcAssetOperation,
  chains: XcScanChains,
  assets: XcScanAssets = {},
): XcAssetOperation => {
  if (hasJourneyAssetMetadata(asset)) return asset
  const [network, id] = asset.asset.split("|")
  if (!network || id === undefined) return asset
  const native = id === "native" || id === ""
  const metadata = assets[`${network}|${id || "native"}`]
  const chain = chains[network]
  // Multi-token chain properties don't identify which token a native key means.
  const nativeChain = native && chain?.chainTokens.length === 1 ? chain : null
  const symbol = asset.symbol || metadata?.symbol || nativeChain?.chainTokens[0]
  const decimals = hasDecimals(asset)
    ? asset.decimals
    : (metadata?.decimals ?? nativeChain?.chainDecimals[0])
  if (symbol === asset.symbol && decimals === asset.decimals) return asset
  return { ...asset, symbol, decimals }
}

export const enrichJourneyAssets = (
  journeys: readonly XcJourney[],
  chains: XcScanChains,
  assets: XcScanAssets = {},
): XcJourney[] =>
  journeys.map((journey) => {
    const enriched = journey.assets.map((asset) =>
      enrichJourneyAsset(asset, chains, assets),
    )
    return enriched.some((asset, index) => asset !== journey.assets[index])
      ? { ...journey, assets: enriched }
      : journey
  })
