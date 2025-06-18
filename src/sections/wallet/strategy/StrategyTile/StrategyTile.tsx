import { FC } from "react"
import { AssetOverview } from "sections/wallet/strategy/AssetOverview/AssetOverview"
import {
  StrategyTileSeparator,
  SStrategyTile,
  StrategyTileVariant,
} from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { NewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm"
import { StrategyTileBackgroundEffect } from "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffect"
import {
  CurrentDeposit,
  CurrentDepositData,
} from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { Separator } from "components/Separator/Separator"
import { CurrentDepositEmptyState } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositEmptyState"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useAssetReward } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NewDepositFormWrapper } from "sections/wallet/strategy/NewDepositForm/NewDepositFormWrapper"
import { WalletStrategyFormSkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { useNewDepositDefaultAssetId } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

type Props = {
  readonly assetId: string
  readonly underlyingAssetId: string
  readonly emptyState: string
  readonly riskTooltip: string
  readonly variant: StrategyTileVariant
}

export const StrategyTile: FC<Props> = ({
  assetId,
  underlyingAssetId,
  emptyState,
  riskTooltip,
  variant,
}) => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const underlyingAsset = getAssetWithFallback(underlyingAssetId)
  const { data: defaultAssetId, isLoading } =
    useNewDepositDefaultAssetId(underlyingAssetId)
  const { data: accountAssets } = useAccountAssets()

  const depositBalance = new BigNumber(
    accountAssets?.accountAssetsMap.get(underlyingAssetId)?.balance?.balance ||
      "0",
  ).shiftedBy(-(underlyingAsset.decimals ?? 0))

  const reward = useAssetReward(underlyingAssetId)
  const rewardBalance = new BigNumber(reward.balance)

  const hasBalance = depositBalance.gt(0) || rewardBalance.gt(0)
  const depositData: CurrentDepositData | null =
    account && hasBalance
      ? {
          depositBalance: depositBalance.toString(),
          reward,
        }
      : null

  return (
    <SStrategyTile variant={variant}>
      <StrategyTileBackgroundEffect variant={variant} />
      <div sx={{ flex: "column", gap: [20, 20, 35] }}>
        <AssetOverview
          assetId={assetId}
          underlyingAssetId={underlyingAssetId}
          riskLevel="lower"
          riskTooltip={riskTooltip}
        />
        <Separator color="white" sx={{ opacity: 0.06 }} />
        {depositData ? (
          <CurrentDeposit
            assetId={underlyingAssetId}
            depositData={depositData}
          />
        ) : (
          <CurrentDepositEmptyState emptyState={emptyState} />
        )}
      </div>
      <StrategyTileSeparator />
      {isLoading ? (
        <WalletStrategyFormSkeleton />
      ) : (
        <NewDepositFormWrapper defaultAssetId={defaultAssetId}>
          <NewDepositForm
            assetId={underlyingAssetId}
            depositData={depositData}
          />
        </NewDepositFormWrapper>
      )}
    </SStrategyTile>
  )
}
