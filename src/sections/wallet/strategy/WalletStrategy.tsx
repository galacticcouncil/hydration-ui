import { useRpcProvider } from "providers/rpcProvider"
import { FC, lazy } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { StrategyTile } from "sections/wallet/strategy/StrategyTile/StrategyTile"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"

const GigadotAnswers = lazy(async () => ({
  default: (
    await import("sections/wallet/strategy/GigadotAnswers/GigadotAnswers")
  ).GigadotAnswers,
}))

export const WalletStrategy: FC = () => {
  const { dataEnv } = useRpcProvider()
  const { isLoaded } = useRpcProvider()

  useMarketChangeSubscription()

  if (!isLoaded) {
    return <WalletStrategySkeleton />
  }

  const [assetId, underlyingAssetId, rewardAssetId] =
    dataEnv === "mainnet"
      ? [GDOT_STABLESWAP_ASSET_ID, GDOT_ERC20_ASSET_ID, GDOT_ERC20_ASSET_ID]
      : // erc20 and stableswap asset IDs are flipped on testnet
        [
          GDOT_ERC20_ASSET_ID,
          GDOT_STABLESWAP_ASSET_ID,
          GDOT_STABLESWAP_ASSET_ID,
        ]

  return (
    <WalletStrategyProviders>
      <SWalletStrategy>
        <WalletStrategyHeader />
        <StrategyTile
          assetId={assetId}
          underlyingAssetId={underlyingAssetId}
          rewardAssetId={rewardAssetId}
        />
        <GigadotAnswers />
      </SWalletStrategy>
    </WalletStrategyProviders>
  )
}
