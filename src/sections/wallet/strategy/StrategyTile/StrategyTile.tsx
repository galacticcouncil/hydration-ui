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

export type StrategyTileProps = {
  readonly stableswapId: string
  readonly aTokenId: string
  readonly emptyState: string
  readonly riskTooltip: string
  readonly variant: StrategyTileVariant
  withdrawAssetId?: string
  moneyMarketAssetId: string
  defaultAssetIdToDeposit?: string
}

export const StrategyTile: FC<StrategyTileProps> = ({
  stableswapId,
  aTokenId,
  emptyState,
  riskTooltip,
  variant,
  moneyMarketAssetId,
  defaultAssetIdToDeposit,
}) => {
  const { account } = useAccount()
  const { data: defaultAssetId, isLoading } = useNewDepositDefaultAssetId(
    defaultAssetIdToDeposit ?? stableswapId,
  )

  return (
    <SStrategyTile variant={variant}>
      <StrategyTileBackgroundEffect variant={variant} />
      <div sx={{ flex: "column", gap: [20, 20, 35] }}>
        <AssetOverview
          assetId={moneyMarketAssetId}
          metaAssetId={aTokenId}
          riskLevel="low"
          riskTooltip={riskTooltip}
        />
        <Separator color="white" sx={{ opacity: 0.06 }} />
        {account ? (
          <CurrentDeposit
            stableswapId={stableswapId}
            aTokenId={aTokenId}
            emptyState={emptyState}
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
          <NewDepositForm assetId={aTokenId} />
        </NewDepositFormWrapper>
      )}
    </SStrategyTile>
  )
}
