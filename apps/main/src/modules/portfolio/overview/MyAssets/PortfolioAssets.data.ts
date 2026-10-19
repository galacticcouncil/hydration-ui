import { TAssetData } from "@/api/assets"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import {
  myAssetsMobileSorter,
  myAssetsSorter,
} from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.utils"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"

export const mergePortfolioAssets = (
  assets: MyAsset[],
  positions: StrategyPosition[],
  getAsset: (id: string) => TAssetData,
  isMobile = false,
): MyAsset[] => {
  const representedShareAssets = new Set(
    positions.flatMap((position) => {
      if (position.strategy === "juicer") {
        const vault = PROPELLER_VAULTS.find(
          (vault) => vault.assetId === position.assetId,
        )
        return vault ? [vault.shareAssetId] : []
      }
      return position.transferAssetId ? [position.transferAssetId] : []
    }),
  )
  // Upstream now lists Juicer shares in Assets. The combined view already
  // represents those shares as positions, so keep only one row per holding.
  const walletAssets = assets.filter(
    (asset) => !representedShareAssets.has(asset.id),
  )
  const strategyAssets = positions.map<MyAsset>((position) => {
    const amount =
      position.strategy === "juicer"
        ? position.underlyingAmount
        : position.shareAmount
    // Live Juicer and supplied BIL need share-specific transfer checks.
    const walletHolding =
      position.status === "wallet"
        ? assets.find((asset) => asset.id === position.transferAssetId)
        : undefined
    const transferable = walletHolding?.transferable
    const transferableDisplay = walletHolding?.transferableDisplay

    return {
      ...getAsset(position.assetId),
      id: position.id,
      symbol: position.symbol,
      name:
        position.strategy === "juicer" ? "Juicer" : "Brazilian Invoice Loans",
      origin: null,
      total: amount ?? "0",
      totalDisplay: position.value ?? undefined,
      transferable: transferable ?? "0",
      transferableDisplay,
      canStake: false,
      isTradable: false,
      strategyPosition: position,
      strategyTransferableKnown: transferable !== undefined,
    }
  })

  return [...walletAssets, ...strategyAssets].sort(
    isMobile ? myAssetsMobileSorter : myAssetsSorter,
  )
}
