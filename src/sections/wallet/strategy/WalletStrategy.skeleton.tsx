import { FC, lazy } from "react"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import { WalletStrategyHeader } from "sections/wallet/strategy/WalletStrategyHeader"
import {
  StrategyTileSeparator,
  SStrategyTile,
} from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import Skeleton from "react-loading-skeleton"

const GigadotAnswers = lazy(async () => ({
  default: (
    await import("sections/wallet/strategy/GigadotAnswers/GigadotAnswers")
  ).GigadotAnswers,
}))

export const WalletStrategySkeleton: FC = () => {
  return (
    <SWalletStrategy>
      <WalletStrategyHeader />
      <SStrategyTile>
        <div
          sx={{
            height: 250,
            display: "grid",
            gap: 20,
          }}
        >
          <Skeleton sx={{ height: "100%" }} />
          <Skeleton sx={{ height: "100%" }} />
          <Skeleton sx={{ height: "100%" }} />
        </div>
        <StrategyTileSeparator />
        <div
          sx={{
            height: 250,
            display: "grid",
            gap: 20,
          }}
          css={{
            gridTemplateRows: "3fr 2fr",
          }}
        >
          <Skeleton css={{ height: "100%" }} />
          <Skeleton css={{ height: "100%" }} />
        </div>
      </SStrategyTile>
      <GigadotAnswers />
    </SWalletStrategy>
  )
}
