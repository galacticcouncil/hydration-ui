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
  const { dataEnv } = useRpcProvider()
  const isMobile = useMedia(theme.viewport.lt.sm)
  const { isLoaded } = useRpcProvider()

  useMarketChangeSubscription()

  if (!isLoaded) {
    return <WalletStrategySkeleton />
  }

  const [assetId, underlyingAssetId, rewardAssetId] =
    dataEnv === "mainnet" ? ["690", "69", "69"] : ["69", "690", "690"]

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
