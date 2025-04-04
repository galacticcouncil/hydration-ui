import { useRpcProvider } from "providers/rpcProvider"
import { FC, lazy } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"

const GigadotAnswers = lazy(async () => ({
  default: (
    await import("sections/wallet/strategy/GigadotAnswers/GigadotAnswers")
  ).GigadotAnswers,
}))

export const WalletStrategy: FC = () => {
  const isMobile = useMedia(theme.viewport.lt.sm)
  const { isLoaded } = useRpcProvider()

  useMarketChangeSubscription()

  if (!isLoaded) {
    return <WalletStrategySkeleton />
  }

  // TODO 1075 Temporary until its possible to swap gigadot via trade router
  const [assetId, underlyingAssetId, rewardAssetId] =
    import.meta.env.VITE_ENV === "production"
      ? ["690", "69", "69"]
      : ["5", "1000037", "15"]

  return (
    <WalletStrategyProviders>
      <SWalletStrategy>
        <WalletStrategyHeader />
        <StrategyTile
          assetId={assetId}
          underlyingAssetId={underlyingAssetId}
          rewardAssetId={rewardAssetId}
        />
        {!isMobile && <GigadotAnswers />}
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
