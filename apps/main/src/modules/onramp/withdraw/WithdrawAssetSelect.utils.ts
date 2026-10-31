import type { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"

export type WithdrawAssetSelection = {
  assetId: string
  sourceAssetKey: string
  destinationChainKey: string
  destinationAssetKey: string
}

export type WithdrawDestinationRoute = {
  sourceAsset: Asset
  destinationChain: AnyChain
  destinationAsset: Asset
  route?: AssetRoute
}

export type WithdrawDestinationOption = WithdrawAssetSelection &
  WithdrawDestinationRoute

export const getWithdrawDestinationOptions = (
  routes: readonly WithdrawDestinationRoute[],
  getSourceAssetId: (asset: Asset) => string | null,
  supportedChainKeys: ReadonlySet<string>,
): WithdrawDestinationOption[] => {
  const options = new Map<string, WithdrawDestinationOption>()
  for (const route of routes) {
    if (!supportedChainKeys.has(route.destinationChain.key)) continue
    const assetId = getSourceAssetId(route.sourceAsset)
    if (assetId === null) continue
    const selection = {
      assetId,
      sourceAssetKey: route.sourceAsset.key,
      destinationChainKey: route.destinationChain.key,
      destinationAssetKey: route.destinationAsset.key,
    }
    const key = `${selection.sourceAssetKey}:${selection.destinationChainKey}:${selection.destinationAssetKey}`
    if (!options.has(key)) options.set(key, { ...selection, ...route })
  }
  return [...options.values()]
}
