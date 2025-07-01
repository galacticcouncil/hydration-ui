import { FC } from "react"
import { AssetOverview } from "sections/wallet/strategy/AssetOverview/AssetOverview"
import {
  StrategyTileSeparator,
  SStrategyTile,
  StrategyTileVariant,
} from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { NewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm"
import { StrategyTileBackgroundEffect } from "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffect"
import { CurrentDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { Separator } from "components/Separator/Separator"
import { CurrentDepositEmptyState } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositEmptyState"

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
  const { data: defaultAssetId, isLoading } =
    useNewDepositDefaultAssetId(underlyingAssetId)

  return (
    <SStrategyTile variant={variant}>
      <StrategyTileBackgroundEffect variant={variant} />
      <div sx={{ flex: "column", gap: [20, 20, 35] }}>
        <AssetOverview
          assetId={assetId}
          underlyingAssetId={underlyingAssetId}
          riskLevel="low"
          riskTooltip={riskTooltip}
        />
        <Separator color="white" sx={{ opacity: 0.06 }} />
        {account ? (
          <CurrentDeposit assetId={underlyingAssetId} emptyState={emptyState} />
        ) : (
          <CurrentDepositEmptyState emptyState={emptyState} />
        )}
      </div>
      <StrategyTileSeparator />
      {isLoading ? (
        <WalletStrategyFormSkeleton />
      ) : (
        <NewDepositFormWrapper defaultAssetId={defaultAssetId}>
          <NewDepositForm assetId={underlyingAssetId} />
        </NewDepositFormWrapper>
      )}
    </SStrategyTile>
  )
}
