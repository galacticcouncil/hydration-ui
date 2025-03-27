import { useRpcProvider } from "providers/rpcProvider"
import { FC, lazy } from "react"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import { WalletStrategyProviders } from "sections/wallet/strategy/WalletStrategy.providers"
import { WalletStrategySkeleton } from "sections/wallet/strategy/WalletStrategy.skeleton"
import { GigadotStrategy } from "sections/wallet/strategy/GigadotStrategy/GigadotStrategy"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { useMedia } from "react-use"
import { theme } from "theme"

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
    // TODO 1075 loading
    return <WalletStrategySkeleton />
  }

  return (
    <WalletStrategyProviders>
      <div sx={{ flex: "column", gap: 20 }}>
        <WalletStrategyHeader />
        <GigadotStrategy />
        {!isMobile && <GigadotAnswers />}
      </div>
    </WalletStrategyProviders>
  )
}
