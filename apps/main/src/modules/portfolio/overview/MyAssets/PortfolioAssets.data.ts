import { BIL_ASSET_ID, BIL_ERC20_ID } from "@galacticcouncil/utils"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"

export const mergePortfolioAssets = (
  assets: MyAsset[],
  positions: StrategyPosition[],
  getAsset: (id: string) => TAssetData,
): MyAsset[] => {
  const representedShareAssets = new Set(
    positions.flatMap((position) => {
      if (position.strategy === "juicer") {
        const vault = PROPELLER_VAULTS.find(
          (vault) => vault.assetId === position.assetId,
        )
        return vault ? [vault.shareAssetId] : []
      }
      return position.isPreview
        ? [BIL_ASSET_ID, BIL_ERC20_ID]
        : position.transferAssetId
          ? [position.transferAssetId]
          : []
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
    // Fixture transferability is illustrative. Live Juicer and supplied BIL
    // require share-specific transfer checks, not collateral wallet balances.
    const walletHolding =
      position.status === "wallet"
        ? assets.find((asset) => asset.id === position.transferAssetId)
        : undefined
    const transferable = position.isPreview
      ? Big(amount ?? 0)
          .times(position.status === "supplied" ? "0.75" : 1)
          .toString()
      : walletHolding?.transferable
    const transferableDisplay =
      position.isPreview && position.value !== null
        ? Big(position.value)
            .times(position.status === "supplied" ? "0.75" : 1)
            .toString()
        : walletHolding?.transferableDisplay

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

  return [...walletAssets, ...strategyAssets]
}
