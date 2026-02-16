import { useRpcProvider } from "providers/rpcProvider"
import { FC } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMoneyMarketInit } from "sections/lending/utils/marketsAndNetworksConfig"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { useGigadotAssetIds } from "sections/wallet/strategy/WalletStrategy.utils"
import {
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  PRIME_ASSET_ID,
  PRIME_ERC20_ASSET_ID,
  PRIME_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { useTranslation } from "react-i18next"
import { StrategyTileVariant } from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { HollarTile } from "./StrategyTile/HollarTile"
import { useAssets } from "providers/assets"

export const WalletStrategy: FC = () => {
  const { getAsset } = useAssets()
  const { t } = useTranslation()
  const { gdotAssetId, underlyingGdotAssetId } = useGigadotAssetIds()
  const { isLoaded } = useRpcProvider()

  const { isLoading: isMoneyMarketLoading } = useMoneyMarketInit()

  if (!isLoaded || isMoneyMarketLoading) {
    return <WalletStrategySkeleton />
  }

  return (
    <WalletStrategyProviders>
      <SWalletStrategy>
        <WalletStrategyHeader />
        <HollarTile />
        <StrategyTile
          moneyMarketAssetId={gdotAssetId}
          stableswapId={gdotAssetId}
          aTokenId={underlyingGdotAssetId}
          emptyState={t("wallet.strategy.gigadot.emptyState")}
          riskTooltip={t("wallet.strategy.gigadot.risk.tooltip")}
          variant={StrategyTileVariant.One}
        />

        <StrategyTile
          moneyMarketAssetId={GETH_STABLESWAP_ASSET_ID}
          stableswapId={GETH_STABLESWAP_ASSET_ID}
          aTokenId={GETH_ERC20_ASSET_ID}
          emptyState={t("wallet.strategy.geth.emptyState")}
          riskTooltip={t("wallet.strategy.geth.risk.tooltip")}
          variant={StrategyTileVariant.Two}
        />
        {getAsset(PRIME_ERC20_ASSET_ID) && (
          <StrategyTile
            moneyMarketAssetId={PRIME_ASSET_ID}
            stableswapId={PRIME_STABLESWAP_ASSET_ID}
            aTokenId={PRIME_ERC20_ASSET_ID}
            defaultAssetIdToDeposit={PRIME_ASSET_ID}
            emptyState={t("wallet.strategy.prime.emptyState")}
            variant={StrategyTileVariant.Prime}
          />
        )}
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
