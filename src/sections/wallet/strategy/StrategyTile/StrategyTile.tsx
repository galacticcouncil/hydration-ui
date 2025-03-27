import { FC } from "react"
import { AssetOverview } from "sections/wallet/strategy/AssetOverview/AssetOverview"
import {
  StrategyTileSeparator,
  SStrategyTile,
} from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { NewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm"
import { StrategyTileBackgroundEffect } from "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffect"
import {
  CurrentDeposit,
  CurrentDepositData,
} from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { Separator } from "components/Separator/Separator"
import { CurrentDepositReadMore } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositReadMore"
import { CurrentDepositEmptyState } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositEmptyState"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useAssetRewards } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"

type Props = {
  readonly assetId: string
  readonly underlyingAssetId: string
  readonly rewardAssetId: string
}

export const StrategyTile: FC<Props> = ({
  assetId,
  underlyingAssetId,
  rewardAssetId,
}) => {
  const { getAssetWithFallback } = useAssets()
  const underlyingAsset = getAssetWithFallback(underlyingAssetId)

  const { data: accountAssets } = useAccountAssets()

  const depositBalance = new BigNumber(
    accountAssets?.accountAssetsMap.get(underlyingAssetId)?.balance?.balance ||
      "0",
  ).shiftedBy(-(underlyingAsset.decimals ?? 0))

  const rewardsBalance = new BigNumber(useAssetRewards(rewardAssetId) || "0")

  const depositData: CurrentDepositData | null =
    depositBalance.gt(0) || rewardsBalance.gt(0)
      ? {
          depositBalance: depositBalance.toString(),
          rewardsBalance: rewardsBalance.toString(),
        }
      : null

  return (
    <SStrategyTile>
      <StrategyTileBackgroundEffect />
      <div sx={{ flex: "column", gap: [20, 30] }}>
        <AssetOverview assetId={assetId} />
        <Separator />
        {depositData ? (
          <>
            <CurrentDeposit
              assetId={underlyingAssetId}
              rewardAssetId={rewardAssetId}
              depositData={depositData}
            />
            <div sx={{ display: ["none", "contents"] }}>
              <Separator />
              <CurrentDepositReadMore />
            </div>
          </>
        ) : (
          <CurrentDepositEmptyState />
        )}
      </div>
      <StrategyTileSeparator />
      <NewDepositForm assetId={underlyingAssetId} depositData={depositData} />
    </SStrategyTile>
  )
}
