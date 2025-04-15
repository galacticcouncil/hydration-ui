import { useRpcProvider } from "providers/rpcProvider"
import { FC, lazy } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { useGigadotAssetIds } from "sections/wallet/strategy/WalletStrategy.utils"

const GigadotAnswers = lazy(async () => ({
  default: (
    await import("sections/wallet/strategy/GigadotAnswers/GigadotAnswers")
  ).GigadotAnswers,
}))

export const WalletStrategy: FC = () => {
  const { assetId, underlyingAssetId } = useGigadotAssetIds()
  const { isLoaded, featureFlags } = useRpcProvider()

  useMarketChangeSubscription()

  if (!featureFlags.strategies) return null

  if (!isLoaded) {
    return <WalletStrategySkeleton />
  }

  return (
    <WalletStrategyProviders>
      <SWalletStrategy>
        <WalletStrategyHeader />
        <StrategyTile assetId={assetId} underlyingAssetId={underlyingAssetId} />
        <GigadotAnswers />
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
