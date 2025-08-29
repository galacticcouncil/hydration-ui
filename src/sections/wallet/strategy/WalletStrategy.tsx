import { useRpcProvider } from "providers/rpcProvider"
import { FC } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { useGigadotAssetIds } from "sections/wallet/strategy/WalletStrategy.utils"
import { GETH_ERC20_ASSET_ID, GETH_STABLESWAP_ASSET_ID } from "utils/constants"
import { useTranslation } from "react-i18next"
import { StrategyTileVariant } from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { HollarTile } from "./StrategyTile/HollarTile"

export const WalletStrategy: FC = () => {
  const { t } = useTranslation()
  const { gdotAssetId, underlyingGdotAssetId } = useGigadotAssetIds()
  const { isLoaded } = useRpcProvider()

  useMarketChangeSubscription()

  if (!isLoaded) {
    return <WalletStrategySkeleton />
  }

  return (
    <WalletStrategyProviders>
      <SWalletStrategy>
        <WalletStrategyHeader />
        <HollarTile />
        <StrategyTile
          stableswapId={gdotAssetId}
          aTokenId={underlyingGdotAssetId}
          emptyState={t("wallet.strategy.gigadot.emptyState")}
          riskTooltip={t("wallet.strategy.gigadot.risk.tooltip")}
          variant={StrategyTileVariant.One}
        />
        <StrategyTile
          stableswapId={GETH_STABLESWAP_ASSET_ID}
          aTokenId={GETH_ERC20_ASSET_ID}
          emptyState={t("wallet.strategy.geth.emptyState")}
          riskTooltip={t("wallet.strategy.geth.risk.tooltip")}
          variant={StrategyTileVariant.Two}
        />
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
